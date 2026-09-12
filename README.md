# NABAMS TPI Executive Election Portal

**Official voting portal for the National Association of Business Administration and Management Students (NABAMS), The Polytechnic, Ibadan (TPI), Oyo State, Nigeria.**

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL 15) |
| Storage | Supabase Storage (`voter-documents` bucket) |
| Styling | Tailwind CSS |
| Auth | `jose` (signed HTTP-only cookies) |
| Hosting | Vercel |

---

## Setup Guide

### 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon key** (Settings → API)
3. Also copy the **service_role** key (keep this absolutely secret)
4. In **SQL Editor**, run `supabase/schema.sql` then `supabase/seed.sql`

### 2. Supabase Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Create bucket named: `voter-documents`
3. Set bucket to **Public** (so candidate photos and voter docs are accessible via URL)
4. Add the following RLS policy to allow authenticated uploads:
   ```sql
   CREATE POLICY "allow_authenticated_upload"
   ON storage.objects FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'voter-documents');
   ```
   > Note: Server actions use the service_role key which bypasses RLS, so this policy is primarily for future use.

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Server-only — NEVER prefix with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL=hod@polytechnicibadan.edu.ng
ADMIN_PASSWORD=StrongPassword123!
SESSION_SECRET=minimum_32_chars_random_secret_here_change_me
```

> Generate a SESSION_SECRET: `openssl rand -hex 32` or any 32+ char random string.

### 4. Seeding the Voter Roll

The 9 executive positions are seeded via `supabase/seed.sql`. 

To add student voters, run SQL like:

```sql
INSERT INTO voters (matric_number, full_name, level, programme, voting_pin) VALUES
  ('2025231010270', 'Adewale Bakare', 'ND1', 'Full Time', 'PIN12345'),
  ('2024231010180', 'Chisom Eze', 'HND1', 'DPP', 'PIN67890');
```

Or use the **Admin → Voter Roll → Add Voter** UI for individual late accreditations.

### 5. Running Locally

```bash
npm run dev
```

Visit: `http://localhost:3000`

Admin portal: `http://localhost:3000/admin/login`

### 6. Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_EMAIL
vercel env add ADMIN_PASSWORD
vercel env add SESSION_SECRET
```

---

## Application Flow

### Student Voter Flow
```
/ (Login: matric + PIN)
  → /accreditation (Upload passport + ID card — mandatory)
    → /ballot (Select 1 candidate per position, review, confirm)
      → /receipt (NABAMS-XXXXXXXX reference code + print)
```

### Admin Flow
```
/admin/login
  → /admin (Dashboard: election status toggle, stats)
  → /admin/results (Live tally: raw votes + adjustments + final)
  → /admin/candidates (Add/delete candidates + photos)
  → /admin/voters (Voter roll: search, add late accreditation, reset)
  → /admin/adjustments (Record integrity adjustments with mandatory reason)
  → /admin/settings (Danger zone: wipe test data)
```

---

## Security Architecture

| Feature | Implementation |
|---|---|
| Admin credentials | Server-only env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) — never in client bundle |
| Admin session | Signed JWT (`jose`) → HTTP-only cookie, `Secure`, `SameSite=Lax`, 1-hour TTL |
| Voter session | Signed JWT → HTTP-only cookie, 4-hour TTL |
| Vote secrecy | `votes` table has **no** `matric_number` column — ballots are anonymous |
| RLS | `votes`, `voters`, `candidate_adjustments` — NO public access at all |
| Double-vote | `SELECT FOR UPDATE` row lock in `cast_ballot` RPC prevents race conditions |
| Vote integrity | `votes` table is immutable; admin overrides go to `candidate_adjustments` only |
| iOS compat | No regex lookbehind; polyfills for `Object.hasOwn`, `Array.at`, `crypto.randomUUID` |

---

## Database Tables

| Table | Purpose |
|---|---|
| `election_config` | Singleton row: election status (pending/open/paused/closed) |
| `positions` | 9 executive offices in display order |
| `candidates` | Registered candidates per position |
| `voters` | Accredited students (ND1 + HND1, Full Time + DPP) |
| `votes` | Anonymous ballots — no matric stored |
| `candidate_adjustments` | Admin-approved vote deltas with mandatory reasons |

---

## Results Formula

```
Final Tally = COUNT(votes WHERE candidate_id = X)
            + COALESCE(SUM(adjustment_votes WHERE candidate_id = X), 0)
```

The Admin Results page shows all three columns: **Raw** | **Adj** | **Final**.

---

## iOS / Safari Compatibility (iOS 12+)

- `.browserslistrc` targets iOS ≥ 12
- `transpilePackages` in `next.config.js` for `lucide-react`, `@supabase/supabase-js`, `@supabase/ssr`
- `src/app/polyfills.ts` imported as line 1 of layout.tsx
- **Zero regex lookbehind assertions** in any source file

---

## Eligible Electorate

Only students with `level IN ('ND1', 'HND1')` can log in and vote.  
Both `Full Time` and `DPP` streams are eligible.
