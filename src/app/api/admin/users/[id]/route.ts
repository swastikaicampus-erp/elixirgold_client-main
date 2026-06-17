import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authorizeRequest } from '@/lib/auth-request';

function getSuperadminUser(request: NextRequest) {
  return authorizeRequest(request, ['superadmin']);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getSuperadminUser(request);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { role, newPassword, name, storeName, contactNumber, storeAddress } = body;

    const normalizedName = typeof name === 'string' ? name.trim() : name;
    const normalizedStoreName = typeof storeName === 'string' ? storeName.trim() : storeName;
    const normalizedContactNumber = typeof contactNumber === 'string' ? contactNumber.trim() : contactNumber;
    const normalizedStoreAddress = typeof storeAddress === 'string' ? storeAddress.trim() : storeAddress;

    if (role && !['admin', 'customer'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role provided' },
        { status: 400 }
      );
    }

    if (contactNumber !== undefined && String(normalizedContactNumber).trim().length === 0) {
      return NextResponse.json(
        { message: 'Number cannot be empty' },
        { status: 400 }
      );
    }
    
    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent changing role/password of another superadmin
    if (targetUser.role === 'superadmin') {
      return NextResponse.json(
        { message: 'Cannot modify a superadmin' },
        { status: 403 }
      );
    }

    if (role) targetUser.role = role;
    if (name !== undefined) targetUser.name = normalizedName;
    if (storeName !== undefined) targetUser.storeName = normalizedStoreName;
    if (contactNumber !== undefined) targetUser.contactNumber = normalizedContactNumber;
    if (storeAddress !== undefined) targetUser.storeAddress = normalizedStoreAddress;
    if (newPassword) targetUser.password = newPassword;
    
    await targetUser.save();

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: {
          _id: targetUser._id,
          email: targetUser.email,
          name: targetUser.name,
          storeName: targetUser.storeName,
          contactNumber: targetUser.contactNumber,
          storeAddress: targetUser.storeAddress,
          role: targetUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getSuperadminUser(request);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'superadmin') {
      return NextResponse.json(
        { message: 'Cannot delete a superadmin' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
