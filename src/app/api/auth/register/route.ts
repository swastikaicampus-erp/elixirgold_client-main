import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, name, storeName, contactNumber, storeAddress } = await request.json();

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedStoreName = typeof storeName === 'string' ? storeName.trim() : '';
    const normalizedContactNumber = typeof contactNumber === 'string' ? contactNumber.trim() : '';
    const normalizedStoreAddress = typeof storeAddress === 'string' ? storeAddress.trim() : '';

    if (
      !normalizedEmail ||
      !password ||
      !normalizedName ||
      !normalizedStoreName ||
      !normalizedContactNumber ||
      !normalizedStoreAddress
    ) {
      return NextResponse.json(
        { message: 'Name, store name, contact number, store address, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new user for self-registration. Role is always customer.
    const user = await User.create({
      email: normalizedEmail,
      password, // In production, hash the password with bcrypt!
      name: normalizedName,
      storeName: normalizedStoreName,
      contactNumber: normalizedContactNumber,
      storeAddress: normalizedStoreAddress,
      role: 'customer',
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
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
