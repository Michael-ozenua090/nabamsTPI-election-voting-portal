'use server';

import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { signAgentSession, setAgentSessionCookie, clearAgentSessionCookie } from '@/lib/session';

// 1. Agent Authentication
export async function loginAgent(formData: FormData) {
  const code = (formData.get('access_code') as string || '').trim();
  const expectedCode = (process.env.AGENT_ACCESS_CODE || 'nabams2026agent').trim();

  if (!code) {
    return { error: 'Please enter the agent access code.' };
  }

  if (code !== expectedCode) {
    return { error: 'Invalid agent access code. Contact the Electoral Committee.' };
  }

  const token = await signAgentSession();
  await setAgentSessionCookie(token);

  return { success: true };
}

export async function logoutAgent() {
  await clearAgentSessionCookie();
  return { success: true };
}

// 2. Sanitized Live Results (Final Tally ONLY)
export async function getAgentLiveResults() {
  try {
    const supabase = createAdminSupabaseClient();

    const [posRes, candRes, votesRes, adjRes, votersRes, votedRes] = await Promise.all([
      supabase.from('positions').select('*').order('display_order'),
      supabase.from('candidates').select('*'),
      supabase.from('votes').select('candidate_id'),
      supabase.from('candidate_adjustments').select('candidate_id, adjustment_votes'),
      supabase.from('voters').select('*', { count: 'exact', head: true }),
      supabase.from('voters').select('*', { count: 'exact', head: true }).eq('has_voted', true),
    ]);

    // Map votes
    const rawCounts: Record<string, number> = {};
    votesRes.data?.forEach((v) => {
      rawCounts[v.candidate_id] = (rawCounts[v.candidate_id] || 0) + 1;
    });

    const adjCounts: Record<string, number> = {};
    adjRes.data?.forEach((a) => {
      adjCounts[a.candidate_id] = (adjCounts[a.candidate_id] || 0) + a.adjustment_votes;
    });

    // Positions and sanitized candidates
    const positions = posRes.data || [];
    const candidates = (candRes.data || []).map((cand) => {
      const raw = rawCounts[cand.id] || 0;
      const adj = adjCounts[cand.id] || 0;
      const finalVotes = Math.max(0, raw + adj);

      // NOTICE: Do NOT include raw or adj in the returned object!
      return {
        id: cand.id,
        position_id: cand.position_id,
        full_name: cand.full_name,
        image_url: cand.image_url,
        is_disqualified: cand.is_disqualified || false,
        finalVotes,
      };
    });

    return {
      positions,
      candidates,
      totalVoters: votersRes.count || 0,
      totalVoted: votedRes.count || 0,
      error: null,
    };
  } catch (err: any) {
    console.error('[Agent Results Error]:', err);
    return {
      positions: [],
      candidates: [],
      totalVoters: 0,
      totalVoted: 0,
      error: 'Failed to fetch live results.',
    };
  }
}
