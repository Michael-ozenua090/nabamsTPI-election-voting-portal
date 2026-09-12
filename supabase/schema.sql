-- ===================================================
-- NABAMS TPI EXECUTIVE ELECTION SCHEMA
-- Target: Supabase (PostgreSQL 15+)
-- ===================================================

-- ===================================================
-- 1. ELECTION CONTROL (singleton row)
-- ===================================================
CREATE TABLE IF NOT EXISTS election_config (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'open', 'paused', 'closed')),
    updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO election_config (id, status) VALUES (1, 'pending')
    ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- 2. POSITIONS TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================
-- 3. CANDIDATES TABLE
-- ===================================================
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================
-- 4. VOTERS TABLE (ND1 & HND1 only; Full-Time & DPP)
-- ===================================================
CREATE TABLE IF NOT EXISTS voters (
    matric_number VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    level VARCHAR(10) NOT NULL CHECK (level IN ('ND1', 'HND1')),
    programme VARCHAR(20) NOT NULL DEFAULT 'Full Time'
        CHECK (programme IN ('Full Time', 'DPP')),
    passport_url TEXT,
    id_card_url TEXT,
    has_voted BOOLEAN NOT NULL DEFAULT false,
    voted_at TIMESTAMPTZ,
    voting_pin VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================
-- 5. VOTES TABLE (Secret Ballot — NO matric stored)
-- ===================================================
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================
-- 6. CANDIDATE ADJUSTMENTS (Integrity-safe admin overrides)
--    Raw votes are NEVER modified; adjustments are additive.
--    Final Tally = COUNT(votes) + COALESCE(SUM(adjustment_votes), 0)
-- ===================================================
CREATE TABLE IF NOT EXISTS candidate_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    adjustment_votes INT NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    authorized_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================

-- votes: NO public access whatsoever (prevents console snooping)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "no_public_access_votes" ON votes;
CREATE POLICY "no_public_access_votes" ON votes FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- candidate_adjustments: server-only via service role key
ALTER TABLE candidate_adjustments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "no_public_access_adj" ON candidate_adjustments;
CREATE POLICY "no_public_access_adj" ON candidate_adjustments FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- voters: no public access (prevents matric enumeration from browser)
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "no_public_access_voters" ON voters;
CREATE POLICY "no_public_access_voters" ON voters FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- positions: public read-only
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_positions" ON positions;
CREATE POLICY "public_read_positions" ON positions FOR SELECT TO anon, authenticated USING (true);

-- candidates: public read-only
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_candidates" ON candidates;
CREATE POLICY "public_read_candidates" ON candidates FOR SELECT TO anon, authenticated USING (true);

-- election_config: public read-only (so ballot page can check if election is open)
ALTER TABLE election_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_election_config" ON election_config;
CREATE POLICY "public_read_election_config" ON election_config FOR SELECT TO anon, authenticated USING (true);

-- ===================================================
-- ATOMIC BALLOT CASTING RPC
-- SECURITY DEFINER runs as postgres (bypasses RLS)
-- This is the ONLY write path to the votes table.
-- ===================================================
CREATE OR REPLACE FUNCTION cast_ballot(
    p_matric_number TEXT,
    p_ballot JSONB
    -- p_ballot: [{"position_id": "uuid", "candidate_id": "uuid|null"}]
    --           candidate_id = null means abstention (row is skipped)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_voted BOOLEAN;
    v_voter_level TEXT;
    v_item JSONB;
    v_reference_code TEXT;
    v_election_status TEXT;
    v_candidate_id TEXT;
BEGIN
    -- Trim and sanitize matric number
    p_matric_number := TRIM(p_matric_number);

    -- 1. Check election is open
    SELECT status INTO v_election_status FROM election_config WHERE id = 1;
    IF v_election_status IS DISTINCT FROM 'open' THEN
        RAISE EXCEPTION 'Ballot rejected: Election is not currently open (status: %).', COALESCE(v_election_status, 'unknown');
    END IF;

    -- 2. Lock the voter row to prevent concurrent race-condition voting
    SELECT has_voted, level INTO v_has_voted, v_voter_level
    FROM voters
    WHERE matric_number = p_matric_number
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voter % is not found on the accredited voter roll.', p_matric_number;
    END IF;

    -- 3. Eligibility guard (ND1 and HND1 only)
    IF v_voter_level NOT IN ('ND1', 'HND1') THEN
        RAISE EXCEPTION 'Voter % is not eligible to vote (level: %).', p_matric_number, v_voter_level;
    END IF;

    -- 4. Double-vote guard
    IF v_has_voted THEN
        RAISE EXCEPTION 'Ballot rejected: Voter % has already cast a vote.', p_matric_number;
    END IF;

    -- 5. Insert selections — skip abstentions (null/empty candidate_id) gracefully
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_ballot)
    LOOP
        v_candidate_id := v_item->>'candidate_id';
        IF v_candidate_id IS NOT NULL AND v_candidate_id <> '' THEN
            INSERT INTO votes (position_id, candidate_id, created_at)
            VALUES (
                (v_item->>'position_id')::UUID,
                v_candidate_id::UUID,
                now()
            );
        END IF;
    END LOOP;

    -- 6. Mark voter as voted
    UPDATE voters
    SET has_voted = true,
        voted_at  = now()
    WHERE matric_number = p_matric_number;

    -- 7. Generate NABAMS-XXXXXXXX reference code
    --    Uses MD5 + SUBSTRING (no regex lookbehind — iOS 12 safe)
    v_reference_code := 'NABAMS-' || UPPER(SUBSTRING(MD5(p_matric_number || now()::TEXT) FROM 1 FOR 8));

    RETURN jsonb_build_object(
        'success',        true,
        'reference_code', v_reference_code,
        'voted_at',       now()
    );
END;
$$;

-- Grant execute to the anon / authenticated roles so the server action can call it
-- (actual row-level protection is inside the function itself)
GRANT EXECUTE ON FUNCTION cast_ballot(TEXT, JSONB) TO anon, authenticated;
