// =====================================================================
// TypeScript types mirroring the Supabase database schema
// =====================================================================

export type ElectionStatus = 'pending' | 'open' | 'paused' | 'closed';

export interface ElectionConfig {
  id: 1;
  status: ElectionStatus;
  updated_at: string;
}

export interface Position {
  id: string;
  title: string;
  display_order: number;
  created_at: string;
}

export interface Candidate {
  id: string;
  position_id: string;
  full_name: string;
  image_url: string;
  created_at: string;
}

export interface Voter {
  matric_number: string;
  full_name: string;
  level: 'ND1' | 'HND1';
  programme: 'Full Time' | 'DPP';
  passport_url: string | null;
  id_card_url: string | null;
  has_voted: boolean;
  voted_at: string | null;
  voting_pin: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  position_id: string;
  candidate_id: string;
  created_at: string;
}

export interface CandidateAdjustment {
  id: string;
  candidate_id: string;
  adjustment_votes: number;
  reason: string;
  authorized_by: string;
  created_at: string;
}

// ─── Ballot casting ──────────────────────────────────────────────────

/** One item in the ballot array sent to cast_ballot RPC */
export interface BallotItem {
  position_id: string;
  candidate_id: string | null; // null = abstention
}

export interface CastBallotResult {
  success: boolean;
  reference_code: string;
  voted_at: string;
}

// ─── Session payloads ────────────────────────────────────────────────

export interface VoterSessionPayload {
  matric_number: string;
  level: 'ND1' | 'HND1';
  full_name: string;
}

export interface AdminSessionPayload {
  email: string;
  role: 'admin';
}

// ─── Results view ────────────────────────────────────────────────────

/** Computed row for the results dashboard */
export interface ResultsRow {
  candidate_id: string;
  full_name: string;
  image_url: string;
  position_id: string;
  position_title: string;
  raw_votes: number;
  adjustment_votes: number;
  final_tally: number;
  adjustments: Pick<CandidateAdjustment, 'id' | 'adjustment_votes' | 'reason' | 'authorized_by' | 'created_at'>[];
}

export interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}
