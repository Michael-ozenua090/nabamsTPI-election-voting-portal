'use server';

import { redirect } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { getVoterSession } from '@/lib/session';
import type { BallotItem, CastBallotResult } from '@/types/database';

// ─────────────────────────────────────────────────────────────────────
// Cast Ballot — calls the atomic cast_ballot RPC
// ─────────────────────────────────────────────────────────────────────
export async function castBallot(ballot: BallotItem[]): Promise<{
  success?: boolean;
  referenceCode?: string;
  votedAt?: string;
  error?: string;
}> {
  const session = await getVoterSession();
  if (!session) {
    return { error: 'Session expired. Please log in again.' };
  }

  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase.rpc('cast_ballot', {
    p_matric_number: session.matric_number,
    p_ballot: ballot,
  });

  if (error) {
    // Extract human-readable message from Postgres exception
    const msg = error.message
      .replace(/^.*EXCEPTION: /, '')
      .replace(/^ERROR: /, '');
    return { error: msg };
  }

  const result = data as CastBallotResult;

  return {
    success: true,
    referenceCode: result.reference_code,
    votedAt: result.voted_at,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Get voter's receipt data (called on /receipt page)
// ─────────────────────────────────────────────────────────────────────
export async function getVoterReceipt(): Promise<{
  matric_number?: string;
  full_name?: string;
  voted_at?: string | null;
  error?: string;
}> {
  const session = await getVoterSession();
  if (!session) return { error: 'Not authenticated' };

  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('voters')
    .select('matric_number, full_name, voted_at, has_voted')
    .eq('matric_number', session.matric_number)
    .single();

  if (error || !data) return { error: 'Could not fetch voter data.' };
  if (!data.has_voted) redirect('/ballot');

  return {
    matric_number: data.matric_number as string,
    full_name: data.full_name as string,
    voted_at: data.voted_at as string | null,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Check election status (used by ballot page)
// ─────────────────────────────────────────────────────────────────────
export async function getElectionStatus(): Promise<string> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from('election_config')
    .select('status')
    .eq('id', 1)
    .single();
  return (data?.status as string) ?? 'pending';
}
