'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import {
  setAdminSessionCookie,
  clearAdminSessionCookie,
  getAdminSession,
} from '@/lib/session';
import type { ElectionStatus, ResultsRow } from '@/types/database';

// ─────────────────────────────────────────────────────────────────────
// Admin Login
// ─────────────────────────────────────────────────────────────────────
export async function loginAdmin(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return { error: 'Admin credentials not configured. Contact the system administrator.' };
  }

  if (email !== adminEmail || password !== adminPassword) {
    return { error: 'Invalid email or password.' };
  }

  await setAdminSessionCookie({ email, role: 'admin' });
  redirect('/admin');
}

// ─────────────────────────────────────────────────────────────────────
// Admin Logout
// ─────────────────────────────────────────────────────────────────────
export async function logoutAdmin() {
  await clearAdminSessionCookie();
  redirect('/admin/login');
}

// ─────────────────────────────────────────────────────────────────────
// Require admin session (throws redirect if not authed)
// ─────────────────────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}

// ─────────────────────────────────────────────────────────────────────
// Election Control
// ─────────────────────────────────────────────────────────────────────
export async function setElectionStatus(status: ElectionStatus) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from('election_config')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) return { error: error.message };
  revalidatePath('/admin');
  revalidatePath('/ballot');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// Results — Final Tally (raw votes + adjustments)
// ─────────────────────────────────────────────────────────────────────
export async function getResults(): Promise<ResultsRow[]> {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  // Raw vote counts per candidate
  const { data: voteCounts, error: voteErr } = await supabase
    .from('votes')
    .select('candidate_id');

  if (voteErr) throw new Error(voteErr.message);

  // Adjustment rows
  const { data: adjustments, error: adjErr } = await supabase
    .from('candidate_adjustments')
    .select('*');

  if (adjErr) throw new Error(adjErr.message);

  // Candidates + positions
  const { data: candidates, error: candErr } = await supabase
    .from('candidates')
    .select('id, full_name, image_url, position_id, positions(title)');

  if (candErr) throw new Error(candErr.message);

  // Build tally map
  const rawMap: Record<string, number> = {};
  for (const v of voteCounts ?? []) {
    const id = v.candidate_id as string;
    rawMap[id] = (rawMap[id] ?? 0) + 1;
  }

  const adjMap: Record<string, number> = {};
  const adjDetails: Record<string, typeof adjustments> = {};
  for (const a of adjustments ?? []) {
    const id = a.candidate_id as string;
    adjMap[id] = (adjMap[id] ?? 0) + (a.adjustment_votes as number);
    if (!adjDetails[id]) adjDetails[id] = [];
    adjDetails[id]!.push(a);
  }

  const rows: ResultsRow[] = (candidates ?? []).map((c) => {
    const raw = rawMap[c.id as string] ?? 0;
    const adj = adjMap[c.id as string] ?? 0;
    return {
      candidate_id: c.id as string,
      full_name: c.full_name as string,
      image_url: c.image_url as string,
      position_id: c.position_id as string,
      position_title: ((c.positions as any)?.title) || ((c.positions as any)?.[0]?.title) || '',
      raw_votes: raw,
      adjustment_votes: adj,
      final_tally: raw + adj,
      adjustments: (adjDetails[c.id as string] ?? []).map((a) => ({
        id: a.id as string,
        adjustment_votes: a.adjustment_votes as number,
        reason: a.reason as string,
        authorized_by: a.authorized_by as string,
        created_at: a.created_at as string,
      })),
    };
  });

  return rows;
}

// ─────────────────────────────────────────────────────────────────────
// Adjustments
// ─────────────────────────────────────────────────────────────────────
export async function addAdjustment(formData: FormData) {
  const session = await requireAdmin();
  const candidateId = formData.get('candidate_id') as string;
  const delta = parseInt(formData.get('delta') as string, 10);
  const reason = (formData.get('reason') as string)?.trim();

  if (!candidateId || isNaN(delta) || !reason) {
    return { error: 'All fields are required.' };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('candidate_adjustments').insert({
    candidate_id: candidateId,
    adjustment_votes: delta,
    reason,
    authorized_by: session.email,
  });

  if (error) return { error: error.message };
  revalidatePath('/admin/adjustments');
  revalidatePath('/admin/results');
  return { success: true };
}

export async function removeAdjustment(id: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('candidate_adjustments').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/adjustments');
  revalidatePath('/admin/results');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// Candidate Management
// ─────────────────────────────────────────────────────────────────────
export async function addCandidate(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const positionId = formData.get('position_id') as string;
  const fullName = (formData.get('full_name') as string)?.trim();
  const photoFile = formData.get('photo') as File | null;

  if (!positionId || !fullName) return { error: 'Position and name are required.' };

  let imageUrl = '';

  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split('.').pop() ?? 'jpg';
    const path = `candidates/${Date.now()}-${fullName.replace(/\s+/g, '-')}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('voter-documents')
      .upload(path, photoFile, { upsert: true, contentType: photoFile.type });
    if (uploadErr) return { error: `Photo upload failed: ${uploadErr.message}` };
    const { data: urlData } = supabase.storage.from('voter-documents').getPublicUrl(path);
    imageUrl = urlData.publicUrl;
  }

  const { error } = await supabase.from('candidates').insert({
    position_id: positionId,
    full_name: fullName,
    image_url: imageUrl,
  });

  if (error) return { error: error.message };
  revalidatePath('/admin/candidates');
  revalidatePath('/ballot');
  return { success: true };
}

export async function updateCandidate(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const fullName = (formData.get('full_name') as string)?.trim();
  const positionId = formData.get('position_id') as string;
  const photoFile = formData.get('photo') as File | null;

  const updates: Record<string, string> = {};
  if (fullName) updates.full_name = fullName;
  if (positionId) updates.position_id = positionId;

  if (photoFile && photoFile.size > 0) {
    const path = `candidates/${id}-${Date.now()}.jpg`;
    const { error: uploadErr } = await supabase.storage
      .from('voter-documents')
      .upload(path, photoFile, { upsert: true, contentType: photoFile.type });
    if (uploadErr) return { error: `Photo upload failed: ${uploadErr.message}` };
    const { data: urlData } = supabase.storage.from('voter-documents').getPublicUrl(path);
    updates.image_url = urlData.publicUrl;
  }

  const { error } = await supabase.from('candidates').update(updates).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/candidates');
  revalidatePath('/ballot');
  return { success: true };
}

export async function deleteCandidate(id: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('candidates').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/candidates');
  revalidatePath('/ballot');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// Voter Roll Management
// ─────────────────────────────────────────────────────────────────────
export async function addVoter(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const matric = (formData.get('matric_number') as string)?.trim();
  const fullName = (formData.get('full_name') as string)?.trim();
  const level = formData.get('level') as 'ND1' | 'HND1';
  const programme = (formData.get('programme') as string) ?? 'Full Time';
  const pin = (formData.get('voting_pin') as string)?.trim();

  if (!matric || !fullName || !level || !pin) {
    return { error: 'Matric number, name, level, and PIN are required.' };
  }

  const { error } = await supabase.from('voters').insert({
    matric_number: matric,
    full_name: fullName,
    level,
    programme,
    voting_pin: pin,
  });

  if (error) return { error: error.message };
  revalidatePath('/admin/voters');
  return { success: true };
}

export async function resetVoter(matricNumber: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from('voters')
    .update({ has_voted: false, voted_at: null })
    .eq('matric_number', matricNumber);
  if (error) return { error: error.message };
  revalidatePath('/admin/voters');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// DANGER: Clear Test Data
// Wipes ALL votes and resets ALL voters.has_voted to false
// ─────────────────────────────────────────────────────────────────────
export async function clearTestData() {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  // Delete all votes
  const { error: votesErr } = await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (votesErr) return { error: `Failed to clear votes: ${votesErr.message}` };

  // Reset all voters
  const { error: votersErr } = await supabase
    .from('voters')
    .update({ has_voted: false, voted_at: null })
    .neq('matric_number', '');
  if (votersErr) return { error: `Failed to reset voters: ${votersErr.message}` };

  // Clear all adjustments
  const { error: adjErr } = await supabase
    .from('candidate_adjustments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (adjErr) return { error: `Failed to clear adjustments: ${adjErr.message}` };

  revalidatePath('/admin');
  revalidatePath('/admin/results');
  revalidatePath('/admin/voters');
  return { success: true };
}
