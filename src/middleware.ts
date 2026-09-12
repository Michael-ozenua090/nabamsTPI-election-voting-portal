import { NextRequest, NextResponse } from 'next/server';
import { VOTER_COOKIE, ADMIN_COOKIE, verifyVoterSession, verifyAdminSession } from '@/lib/session';

const VOTER_PROTECTED = ['/ballot', '/receipt', '/already-voted', '/accreditation'];
const ADMIN_PROTECTED = '/admin';
const ADMIN_LOGIN = '/admin/login';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin route protection ──────────────────────────────────────────
  if (pathname.startsWith(ADMIN_PROTECTED) && pathname !== ADMIN_LOGIN) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const session = token ? await verifyAdminSession(token) : null;
    if (!session) {
      const loginUrl = new URL(ADMIN_LOGIN, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Admin login — redirect away if already authed ──────────────────
  if (pathname === ADMIN_LOGIN) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const session = token ? await verifyAdminSession(token) : null;
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // ── Voter route protection ─────────────────────────────────────────
  const isVoterProtected = VOTER_PROTECTED.some((p) => pathname.startsWith(p));
  if (isVoterProtected) {
    const token = request.cookies.get(VOTER_COOKIE)?.value;
    const session = token ? await verifyVoterSession(token) : null;
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/ballot/:path*',
    '/receipt/:path*',
    '/already-voted/:path*',
    '/accreditation/:path*',
    '/admin/:path*',
  ],
};
