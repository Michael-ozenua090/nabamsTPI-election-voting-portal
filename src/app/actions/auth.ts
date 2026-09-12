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
// Step 1: Check Voter Status (Matric Only)
// ─────────────────────────────────────────────────────────────────────
export async function checkVoterStatus(formData: FormData) {
  const rawMatric = (formData.get('matric_number') as string) ?? '';
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
    return { error: 'Matric number not found on the accredited voter roll. Contact the NABAMS Electoral Committee.' };
  }

  if (voter.level !== 'ND1' && voter.level !== 'HND1') {
    return {
      error: `Only ND1 and HND1 students are eligible to vote. Your level (${voter.level}) is not eligible.`,
    };
  }

  if (voter.has_voted) {
    await setVoterSessionCookie({
      matric_number: voter.matric_number,
      level: voter.level,
      full_name: voter.full_name,
    });
    redirect('/already-voted');
  }

  // Set the base session cookie. They need this to access /accreditation securely.
  await setVoterSessionCookie({
    matric_number: voter.matric_number,
    level: voter.level,
    full_name: voter.full_name,
  });

  if (!voter.voting_pin) {
    // First time accreditation
    redirect('/accreditation');
  }

  // If they have a PIN, prompt the frontend to ask for it
  return { needsPin: true };
}

// ─────────────────────────────────────────────────────────────────────
// Step 1B: Login with PIN
// ─────────────────────────────────────────────────────────────────────
export async function loginVoterWithPin(formData: FormData) {
  const rawMatric = (formData.get('matric_number') as string) ?? '';
  const rawPin = (formData.get('voting_pin') as string) ?? '';
  const matric = rawMatric.trim();
  const pin = rawPin.trim();

  if (!isValidMatric(matric) || pin.length !== 4) {
    return { error: 'Invalid matric number or PIN.' };
  }

  const supabase = createAdminSupabaseClient();
  const { data: voter } = await supabase
    .from('voters')
    .select('*')
    .eq('matric_number', matric)
    .single<Voter>();

  if (!voter) return { error: 'Voter not found.' };

  if (voter.voting_pin !== pin) {
    return { error: 'Incorrect voting PIN. Please try again.' };
  }

  // Session should already be set by checkVoterStatus, but set it again to be safe
  await setVoterSessionCookie({
    matric_number: voter.matric_number,
    level: voter.level,
    full_name: voter.full_name,
  });

  if (!voter.passport_url || !voter.id_card_url) {
    redirect('/accreditation');
  }

  redirect('/ballot');
}

// ─────────────────────────────────────────────────────────────────────
// Step 2: Complete Accreditation (Documents + Profile)
// ─────────────────────────────────────────────────────────────────────
export async function completeAccreditation(formData: FormData) {
  const session = await getVoterSession();
  if (!session) redirect('/');

  const passportFile = formData.get('passport') as File | null;
  const idCardFile = formData.get('id_card') as File | null;
  const phone = (formData.get('phone_number') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const pin = (formData.get('voting_pin') as string)?.trim();

  if (!passportFile || !idCardFile) {
    return { error: 'Both passport photo and ID card are required.' };
  }
  
  if (!phone || !email || !pin || pin.length !== 4) {
    return { error: 'All profile fields (Phone, Email, 4-digit PIN) are required.' };
  }

  const supabaseAdmin = createAdminSupabaseClient();
  const matric = session.matric_number;

  // Auto-create bucket if missing
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.some((b) => b.name === 'voter-documents')) {
    console.log('[Storage] Creating missing voter-documents bucket...');
    await supabaseAdmin.storage.createBucket('voter-documents', {
      public: true,
    });
  }

  // Upload passport
  const passportPath = `${matric}/passport-${Date.now()}.jpg`;
  const { error: passportErr } = await supabaseAdmin.storage
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
  const { error: idErr } = await supabaseAdmin.storage
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
  const { data: passportUrlData } = supabaseAdmin.storage
    .from('voter-documents')
    .getPublicUrl(passportPath);

  const { data: idCardUrlData } = supabaseAdmin.storage
    .from('voter-documents')
    .getPublicUrl(idCardPath);

  // Update voter record with documents AND new profile details
  const { error: updateErr } = await supabaseAdmin
    .from('voters')
    .update({
      passport_url: passportUrlData.publicUrl,
      id_card_url: idCardUrlData.publicUrl,
      phone_number: phone,
      email: email,
      voting_pin: pin,
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
