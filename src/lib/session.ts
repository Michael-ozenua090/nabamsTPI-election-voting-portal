import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { AdminSessionPayload, VoterSessionPayload } from '@/types/database';

// ─── Secret key ──────────────────────────────────────────────────────
export function getSecret(): Uint8Array {
  const SECRET_STRING =
    process.env.SESSION_SECRET ||
    process.env.JWT_SECRET ||
    'nabams-tpi-default-fallback-dev-secret-key-32-chars-min';

  if (!process.env.SESSION_SECRET && !process.env.JWT_SECRET) {
    console.warn(
      '[Session] WARNING: Neither SESSION_SECRET nor JWT_SECRET is set in .env.local. Using fallback key.'
    );
  }

  // Ensure the secret is at least 32 characters by repeating if necessary, then encode
  const PADDED_SECRET = SECRET_STRING.padEnd(32, '0');
  return new TextEncoder().encode(PADDED_SECRET);
}

// ─── Cookie names ────────────────────────────────────────────────────
export const VOTER_COOKIE = 'voter_session';
export const ADMIN_COOKIE = 'admin_session';
export const AGENT_COOKIE = 'agent_session';

// ─── Cookie options ──────────────────────────────────────────────────
const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// ─── Voter session ───────────────────────────────────────────────────

export async function signVoterSession(payload: VoterSessionPayload): Promise<string> {
  return new SignJWT({ ...payload, role: 'voter' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(getSecret());
}

export async function verifyVoterSession(
  token: string
): Promise<VoterSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== 'voter') return null;
    return payload as unknown as VoterSessionPayload;
  } catch {
    return null;
  }
}

export async function getVoterSession(): Promise<VoterSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(VOTER_COOKIE)?.value;
  if (!token) return null;
  return verifyVoterSession(token);
}

export async function setVoterSessionCookie(payload: VoterSessionPayload): Promise<void> {
  const token = await signVoterSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(VOTER_COOKIE, token, {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 4, // 4 hours
  });
}

export async function clearVoterSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(VOTER_COOKIE);
}

// ─── Admin session ───────────────────────────────────────────────────

export async function signAdminSession(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getSecret());
}

export async function verifyAdminSession(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== 'admin' && payload.role !== 'superadmin') return null;
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSession(token);
}

export async function setAdminSessionCookie(payload: AdminSessionPayload): Promise<void> {
  const token = await signAdminSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    ...COOKIE_BASE,
    maxAge: 60 * 60, // 1 hour
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

// ─── Agent session ───────────────────────────────────────────────────

export async function signAgentSession(): Promise<string> {
  return new SignJWT({ role: 'agent' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret());
}

export async function verifyAgentSession(
  token: string
): Promise<{ role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== 'agent' && payload.role !== 'admin' && payload.role !== 'superadmin') return null;
    return payload as unknown as { role: string };
  } catch {
    return null;
  }
}

export async function getAgentSession(): Promise<{ role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AGENT_COOKIE)?.value || cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAgentSession(token);
}

export async function setAgentSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AGENT_COOKIE, token, {
    ...COOKIE_BASE,
    maxAge: 8 * 60 * 60, // 8 hours
  });
}

export async function clearAgentSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AGENT_COOKIE);
}
