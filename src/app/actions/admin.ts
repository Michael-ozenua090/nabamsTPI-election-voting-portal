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
type AdminRole = 'admin' | 'superadmin';

interface AdminAccount {
  email: string;
  password: string;
  role: AdminRole;
  title: string;
}
export async function loginAdmin(formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = (formData.get('password') as string || '').trim();

  // Authorized admin accounts from environment variables
  const allAdmins: AdminAccount[] = [
    {
      email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
      password: (process.env.ADMIN_PASSWORD || '').trim(),
      role: 'superadmin',
      title: 'Super Admin',
    },
    {
      email: (process.env.ADMIN_2_EMAIL || '').trim().toLowerCase(),
      password: (process.env.ADMIN_2_PASSWORD || '').trim(),
      role: 'admin',
      title: 'Admin',
    },
  ];
  const authorizedAdmins = allAdmins.filter((admin) => admin.email && admin.password);

  // Debug logging in terminal
  console.log('[Admin Auth] Login attempt for:', email);

  if (authorizedAdmins.length === 0) {
    console.error('[Admin Auth] ERROR: No admin accounts configured in process.env / .env.local!');
    return { error: 'Server authentication configuration missing. Please check .env.local.' };
  }

  const matched = authorizedAdmins.find(
    (admin) => admin.email === email && admin.password === password
  );

  if (!matched) {
    console.warn('[Admin Auth] FAILED: Email or password mismatch.');
    return { error: 'Invalid email or password.' };
  }

  console.log(`[Admin Auth] SUCCESS: Authenticated as ${matched.title} (${matched.role}).`);

  await setAdminSessionCookie({ email: matched.email, role: matched.role });
  return { success: true };
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
  revalidatePath('/');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// Accreditation Lock Control
// ─────────────────────────────────────────────────────────────────────

// 1. Get Accreditation Lock Status
export async function getAccreditationStatus(): Promise<boolean> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from('election_config')
    .select('is_accreditation_locked')
    .limit(1)
    .maybeSingle();

  return data?.is_accreditation_locked === true;
}

// 2. Toggle Accreditation Lock
export async function toggleAccreditationLock(shouldLock: boolean) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const { error } = await supabase
    .from('election_config')
    .update({ is_accreditation_locked: shouldLock })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Updates the active config row

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/accreditation');
  return { success: true, isLocked: shouldLock };
}

// ─────────────────────────────────────────────────────────────────────
// Results — Final Tally (raw votes + adjustments)
// ─────────────────────────────────────────────────────────────────────
export async function getResults(): Promise<{ rows: ResultsRow[], totalRoll: number, accreditedVoters: number, ballotsCast: number, turnoutPercentage: string, error: string | null }> {
  try {
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

    // 1. Total on the general departmental roll (860)
    const { count: totalRoll, error: v1Err } = await supabase
      .from('voters')
      .select('*', { count: 'exact', head: true });
    if (v1Err) throw new Error(v1Err.message);

    // 2. Actually Accredited & Eligible (Completed accreditation & NOT flagged)
    const { count: accreditedCount, error: v2Err } = await supabase
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .not('accredited_at', 'is', null)
      .or('is_flagged.is.null,is_flagged.eq.false');
    if (v2Err) throw new Error(v2Err.message);

    // 3. Ballots Cast
    const { count: votedCount, error: v3Err } = await supabase
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .eq('has_voted', true);
    if (v3Err) throw new Error(v3Err.message);

    const safeAccredited = accreditedCount || 0;
    const safeVoted = votedCount || 0;
    const safeTotalRoll = totalRoll || 860;

    const turnoutPercentage = safeAccredited > 0
      ? ((safeVoted / safeAccredited) * 100).toFixed(1)
      : '0.0';

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

    return { 
      rows, 
      totalRoll: safeTotalRoll, 
      accreditedVoters: safeAccredited, 
      ballotsCast: safeVoted, 
      turnoutPercentage, 
      error: null 
    };
  } catch (err: any) {
    console.error('[Admin Results Action] Error fetching results:', err.message);
    return {
      rows: [],
      totalRoll: 0,
      accreditedVoters: 0,
      ballotsCast: 0,
      turnoutPercentage: '0.0',
      error: `Database connection error: ${err.message}. Please verify your SUPABASE_SERVICE_ROLE_KEY in .env.local.`,
    };
  }
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

export async function updateCandidate(
  idOrFormData: string | FormData,
  maybeFormData?: FormData
) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const id = typeof idOrFormData === 'string' ? idOrFormData : (idOrFormData.get('id') as string);
  const formData = typeof idOrFormData === 'string' ? maybeFormData! : idOrFormData;

  if (!id) {
    return { error: 'Candidate ID is required.' };
  }

  const fullName = (formData.get('full_name') as string)?.trim();
  const positionId = formData.get('position_id') as string;
  const photoFile = formData.get('photo') as File | null;

  const updates: Record<string, any> = {};
  if (fullName) updates.full_name = fullName;
  if (positionId) updates.position_id = positionId;

  // Handle Photo upload if provided
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split('.').pop() || 'jpg';
    const path = `candidates/${id}-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('voter-documents')
      .upload(path, photoFile, { upsert: true, contentType: photoFile.type });

    if (uploadErr) {
      return { error: `Photo upload failed: ${uploadErr.message}` };
    }

    const { data: urlData } = supabase.storage
      .from('voter-documents')
      .getPublicUrl(path);

    updates.image_url = urlData.publicUrl;
  }

  const { error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', id);

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
  revalidatePath(`/admin/voters/${matricNumber}`);
  return { success: true };
}

export async function getPaginatedVoters({
  page = 1,
  pageSize = 50,
  search = '',
  level = '',
  programme = '',
  status = '',
  sort = 'accredited_desc', // Default to Recently Accredited
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  level?: string;
  programme?: string;
  status?: string;
  sort?: string;
}) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('voters').select('*', { count: 'exact' });

  // Search by matric number or full name
  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`matric_number.ilike.${term},full_name.ilike.${term}`);
  }

  if (level && level !== 'All') {
    query = query.eq('level', level);
  }

  if (programme && programme !== 'All') {
    query = query.eq('programme', programme);
  }

  if (status === 'Voted' || status === 'voted') {
    query = query.eq('has_voted', true);
  } else if (status === 'Pending' || status === 'not_voted') {
    query = query.eq('has_voted', false);
  } else if (status === 'accredited') {
    query = query.not('accredited_at', 'is', null);
  } else if (status === 'unaccredited') {
    query = query.is('accredited_at', null);
  } else if (status === 'flagged') {
    query = query.eq('is_flagged', true);
  }

  // Apply sorting
  switch (sort) {
    case 'name_asc':
      query = query.order('full_name', { ascending: true });
      break;
    case 'name_desc':
      query = query.order('full_name', { ascending: false });
      break;
    case 'matric_asc':
      query = query.order('matric_number', { ascending: true });
      break;
    case 'matric_desc':
      query = query.order('matric_number', { ascending: false });
      break;
    case 'voted_desc':
      query = query.order('voted_at', { ascending: false, nullsFirst: false });
      break;
    case 'accredited_desc':
    case 'updated_desc':
    default:
      // Puts newly accredited students at the top; unaccredited nulls pushed to the bottom
      query = query
        .order('accredited_at', { ascending: false, nullsFirst: false })
        .order('full_name', { ascending: true });
      break;
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error('[getPaginatedVoters Error]:', error);
    return { voters: [], total: 0, totalPages: 0, currentPage: page };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    voters: data || [],
    total,
    totalPages,
    currentPage: page,
  };
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
  revalidatePath('/admin/candidates');
  revalidatePath('/ballot'); // Add this to invalidate ballot path since candidates update
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// Candidate Management Overhaul
// ─────────────────────────────────────────────────────────────────────



// 2. Disqualify Candidate
export async function disqualifyCandidate(candidateId: string, reason: string) {
  await requireAdmin();
  const sanitizedReason = (reason || '').trim();
  if (!sanitizedReason) {
    return { error: 'A mandatory reason for disqualification is required.' };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from('candidates')
    .update({
      is_disqualified: true,
      disqualification_reason: sanitizedReason,
      disqualified_at: new Date().toISOString(),
    })
    .eq('id', candidateId);

  if (error) return { error: error.message };
  revalidatePath('/admin/candidates');
  revalidatePath('/ballot');
  return { success: true };
}

// 3. Reinstate Candidate
export async function reinstateCandidate(candidateId: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from('candidates')
    .update({
      is_disqualified: false,
      disqualification_reason: null,
      disqualified_at: null,
    })
    .eq('id', candidateId);

  if (error) return { error: error.message };
  revalidatePath('/admin/candidates');
  revalidatePath('/ballot');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// Add Voter
// ─────────────────────────────────────────────────────────────────────
export async function flagVoter(matricNumber: string, reason: string) {
  await requireAdmin();
  const sanitizedMatric = (matricNumber || '').trim().toUpperCase();
  const sanitizedReason = (reason || '').trim();

  if (!sanitizedReason) {
    return { error: 'A mandatory reason for flagging is required.' };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from('voters')
    .update({
      is_flagged: true,
      flagged_reason: sanitizedReason,
      flagged_at: new Date().toISOString(),
      flagged_by: 'Electoral Admin',
    })
    .eq('matric_number', sanitizedMatric);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/voters');
  revalidatePath(`/admin/voters/${sanitizedMatric}`);
  return { success: true };
}

export async function unflagVoter(matricNumber: string) {
  await requireAdmin();
  const sanitizedMatric = (matricNumber || '').trim().toUpperCase();
  const supabase = createAdminSupabaseClient();

  const { error } = await supabase
    .from('voters')
    .update({
      is_flagged: false,
      flagged_reason: null,
      flagged_at: null,
      flagged_by: null,
    })
    .eq('matric_number', sanitizedMatric);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/voters');
  revalidatePath(`/admin/voters/${sanitizedMatric}`);
  return { success: true };
}
