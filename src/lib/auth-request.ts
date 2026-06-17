import { NextRequest, NextResponse } from 'next/server';

import { verifyToken, type TokenPayload } from '@/lib/jwt';

export function getRequestAuthToken(request: NextRequest): string | null {
  const authorizationHeader = request.headers.get('authorization');

  if (authorizationHeader?.startsWith('Bearer ')) {
    return authorizationHeader.slice(7).trim();
  }

  return request.cookies.get('token')?.value ?? null;
}

function createAuthError(message: string, status: number) {
  return { error: NextResponse.json({ message }, { status }) };
}

export function authorizeRequest(
  request: NextRequest,
  allowedRoles: string[] = []
): { user: TokenPayload } | { error: NextResponse } {
  const token = getRequestAuthToken(request);

  if (!token) {
    return createAuthError('Unauthorized', 401);
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return createAuthError('Invalid or expired token', 401);
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
    return createAuthError('Forbidden', 403);
  }

  return { user: decoded };
}