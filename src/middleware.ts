import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_STRING =
  process.env.SESSION_SECRET ||
  process.env.JWT_SECRET ||
  'nabams-tpi-default-fallback-dev-secret-key-32-chars-min';
const JWT_SECRET = new TextEncoder().encode(SECRET_STRING.padEnd(32, '0'));

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return !!payload;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle /admin/login explicitly
  if (pathname === '/admin/login') {
    const adminToken = request.cookies.get('admin_session')?.value;
    const valid = await isValidToken(adminToken);
    
    // Only redirect to /admin if token is genuinely valid!
    if (valid) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // If token is invalid or missing, ALLOW them to see the login page!
    const response = NextResponse.next();
    if (adminToken && !valid) {
      response.cookies.delete('admin_session'); // Clean up bad cookie
    }
    return response;
  }

  // 2. Protect all other /admin/* routes
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_session')?.value;
    const valid = await isValidToken(adminToken);

    if (!valid) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      if (adminToken) {
        response.cookies.delete('admin_session'); // Clean up invalid cookie
      }
      return response;
    }
  }

  // 3. Protect voter routes (/ballot, /receipt)
  if (pathname.startsWith('/ballot') || pathname.startsWith('/receipt')) {
    const voterToken = request.cookies.get('voter_session')?.value;
    const valid = await isValidToken(voterToken);

    if (!valid) {
      const response = NextResponse.redirect(new URL('/', request.url));
      if (voterToken) {
        response.cookies.delete('voter_session');
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/ballot/:path*', '/receipt/:path*'],
};
