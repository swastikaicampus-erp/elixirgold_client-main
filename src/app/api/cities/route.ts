import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import City from '@/models/City';

export async function GET() {
  try {
    await dbConnect();
    const cities = await City.find().sort({ createdAt: -1 });
    return NextResponse.json({ cities }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
