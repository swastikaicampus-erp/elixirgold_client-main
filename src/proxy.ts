import { NextRequest, NextResponse } from 'next/server';

import { decodeAuthToken } from '@/lib/auth-token';

/**
 * Proxy handler replacing deprecated middleware convention.
 * Accepts bearer tokens for API routes and cookie tokens for browser navigation.
 */
function clearTokenAndRedirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/auth/login', request.url));
  response.cookies.delete('token');
  return response;
}

function clearTokenAndReturnUnauthorized() {
  const response = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  response.cookies.delete('token');
  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authorizationHeader = request.headers.get('authorization');
  const token = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice(7).trim()
    : request.cookies.get('token')?.value;

  // Redirect authenticated users away from login/signup pages
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')) {
    if (token) {
      const decoded = decodeAuthToken(token);
      if (decoded) {
        if (decoded.role === 'admin' || decoded.role === 'superadmin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Clear stale/expired token cookie on auth screens
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // Protect admin API routes and auto-clear expired/invalid token
  if (pathname.startsWith('/api/admin')) {
    if (!token) return clearTokenAndReturnUnauthorized();

    const decoded = decodeAuthToken(token);
    if (!decoded) return clearTokenAndReturnUnauthorized();

    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) return clearTokenAndRedirectToLogin(request);

    const decoded = decodeAuthToken(token);
    if (!decoded) return clearTokenAndRedirectToLogin(request);

    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return NextResponse.rewrite(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*', '/api/admin/:path*'],
};
