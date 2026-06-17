import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authorizeRequest } from '@/lib/auth-request';

/**
 * Set user role to admin
 * Requires valid JWT token from authenticated admin/superadmin user
 */
export async function POST(request: NextRequest) {
  try {
    const auth = authorizeRequest(request, ['superadmin']);
    if ('error' in auth) return auth.error;

    await dbConnect();

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { message: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['superadmin', 'admin', 'customer'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update user role
    const user = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `User role updated to ${role}`, user: { email: user.email, role: user.role } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
