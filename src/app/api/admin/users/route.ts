import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authorizeRequest } from '@/lib/auth-request';

function getSuperadminUser(request: NextRequest) {
  return authorizeRequest(request, ['superadmin']);
}

export async function GET(request: NextRequest) {
  const auth = getSuperadminUser(request);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();
    // Exclude password from the results
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Normalize the returned shape to always include store fields
    const shaped = users.map((u) => ({
      _id: u._id,
      email: u.email,
      name: u.name,
      storeName: u.storeName || '',
      contactNumber: u.contactNumber || '',
      storeAddress: u.storeAddress || '',
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return NextResponse.json({ users: shaped }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = getSuperadminUser(request);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();

    const { email, name, storeName, contactNumber, storeAddress, password, role } = await request.json();

    

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedStoreName = typeof storeName === 'string' ? storeName.trim() : '';
    const normalizedContactNumber = typeof contactNumber === 'string' ? contactNumber.trim() : '';
    const normalizedStoreAddress = typeof storeAddress === 'string' ? storeAddress.trim() : '';

    if (!normalizedEmail || !normalizedName || !normalizedStoreName || !normalizedContactNumber || !normalizedStoreAddress || !password) {
      return NextResponse.json(
        { message: 'Store name, owner name, number, email, address, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    const user = await User.create({
      email: normalizedEmail,
      password,
      name: normalizedName,
      storeName: normalizedStoreName,
      contactNumber: normalizedContactNumber,
      storeAddress: normalizedStoreAddress,
      role: role || 'customer',
    });

    // Re-fetch saved user to ensure we return the persisted fields consistently
    const saved = await User.findById(user._id).select('-password');

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: saved
          ? {
              _id: saved._id,
              email: saved.email,
              name: saved.name,
              storeName: saved.storeName || '',
              contactNumber: saved.contactNumber || '',
              storeAddress: saved.storeAddress || '',
              role: saved.role,
            }
          : {
              _id: user._id,
              email: user.email,
              name: user.name,
              storeName: user.storeName,
              contactNumber: user.contactNumber,
              storeAddress: user.storeAddress,
              role: user.role,
            },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
