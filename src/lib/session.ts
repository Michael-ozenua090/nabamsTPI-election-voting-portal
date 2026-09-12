import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { AdminSessionPayload, VoterSessionPayload } from '@/types/database';

// ─── Secret key ──────────────────────────────────────────────────────
function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET env var must be at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

// ─── Cookie names ────────────────────────────────────────────────────
export const VOTER_COOKIE = 'voter_session';
export const ADMIN_COOKIE = 'admin_session';

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
    if (payload.role !== 'admin') return null;
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
