'use server';

import { redirect } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import {
  setVoterSessionCookie,
  clearVoterSessionCookie,
  getVoterSession,
} from '@/lib/session';
import type { Voter } from '@/types/database';

// ─────────────────────────────────────────────────────────────────────
// Validate matric number format: 13-digit numeric string
// No regex lookbehind — iOS 12 safe
// ─────────────────────────────────────────────────────────────────────
function isValidMatric(matric: string): boolean {
  const trimmed = matric.trim();
  if (trimmed.length !== 13) return false;
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if (code < 48 || code > 57) return false; // '0'–'9'
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────
// Login Voter
// ─────────────────────────────────────────────────────────────────────
export async function loginVoter(formData: FormData) {
  const rawMatric = (formData.get('matric_number') as string) ?? '';
  const pin = (formData.get('voting_pin') as string) ?? '';

  const matric = rawMatric.trim();

  if (!isValidMatric(matric)) {
    return { error: 'Invalid matric number. Must be exactly 13 digits.' };
  }

  const supabase = createAdminSupabaseClient();

  const { data: voter, error: dbError } = await supabase
    .from('voters')
    .select('*')
    .eq('matric_number', matric)
    .single<Voter>();

  if (dbError || !voter) {
    return { error: 'Matric number not found on the accredited voter roll.' };
  }

  // Level check
  if (voter.level !== 'ND1' && voter.level !== 'HND1') {
    return {
      error: `Only ND1 and HND1 students are eligible to vote. Your level (${voter.level}) is not eligible.`,
    };
  }

  // PIN check
  if (!voter.voting_pin || voter.voting_pin.trim() !== pin.trim()) {
    return { error: 'Incorrect voting PIN. Please try again.' };
  }

  // Already voted?
  if (voter.has_voted) {
    await setVoterSessionCookie({
      matric_number: voter.matric_number,
      level: voter.level,
      full_name: voter.full_name,
    });
    redirect('/already-voted');
  }

  // Set session cookie
  await setVoterSessionCookie({
    matric_number: voter.matric_number,
    level: voter.level,
    full_name: voter.full_name,
  });

  // If uploads are missing — redirect to accreditation
  if (!voter.passport_url || !voter.id_card_url) {
    redirect('/accreditation');
  }

  redirect('/ballot');
}

// ─────────────────────────────────────────────────────────────────────
// Upload Voter Documents
// Client must compress images to <500 KB before calling this action.
// ─────────────────────────────────────────────────────────────────────
export async function uploadVoterDocuments(formData: FormData) {
  const session = await getVoterSession();
  if (!session) redirect('/');

  const passportFile = formData.get('passport') as File | null;
  const idCardFile = formData.get('id_card') as File | null;

  if (!passportFile || !idCardFile) {
    return { error: 'Both passport photo and ID card are required.' };
  }

  const supabase = createAdminSupabaseClient();
  const matric = session.matric_number;

  // Upload passport
  const passportPath = `${matric}/passport-${Date.now()}.jpg`;
  const { error: passportErr } = await supabase.storage
    .from('voter-documents')
    .upload(passportPath, passportFile, {
      cacheControl: '3600',
      upsert: true,
      contentType: passportFile.type,
    });

  if (passportErr) {
    return { error: `Passport upload failed: ${passportErr.message}` };
  }

  // Upload ID card
  const idCardPath = `${matric}/id-card-${Date.now()}.jpg`;
  const { error: idErr } = await supabase.storage
    .from('voter-documents')
    .upload(idCardPath, idCardFile, {
      cacheControl: '3600',
      upsert: true,
      contentType: idCardFile.type,
    });

  if (idErr) {
    return { error: `ID card upload failed: ${idErr.message}` };
  }

  // Get public URLs
  const { data: passportUrlData } = supabase.storage
    .from('voter-documents')
    .getPublicUrl(passportPath);

  const { data: idCardUrlData } = supabase.storage
    .from('voter-documents')
    .getPublicUrl(idCardPath);

  // Update voter record
  const { error: updateErr } = await supabase
    .from('voters')
    .update({
      passport_url: passportUrlData.publicUrl,
      id_card_url: idCardUrlData.publicUrl,
    })
    .eq('matric_number', matric);

  if (updateErr) {
    return { error: `Failed to update voter record: ${updateErr.message}` };
  }

  redirect('/ballot');
}

// ─────────────────────────────────────────────────────────────────────
// Logout Voter
// ─────────────────────────────────────────────────────────────────────
export async function logoutVoter() {
  await clearVoterSessionCookie();
  redirect('/');
}
