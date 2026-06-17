import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuthToken } from '@/lib/auth-request';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/auth/me
 * Returns the decoded token payload for the authenticated user.
 * Supports Authorization: Bearer <token> or cookie `token`.
 */
export async function GET(request: NextRequest) {
  try {
    const token = getRequestAuthToken(request);
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    // Return minimal user info
    return NextResponse.json({ user: { userId: decoded.userId, email: decoded.email, name: decoded.name, role: decoded.role } }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Internal server error' }, { status: 500 });
  }
}
