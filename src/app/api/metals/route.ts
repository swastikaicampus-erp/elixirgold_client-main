import { NextResponse } from 'next/server';
import Metals from '@/models/Metals';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    const metals = await Metals.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ metals, total: metals.length }, { status: 200 });
  } catch (error: unknown) {
    console.error('Metals API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Failed to fetch metals', error: message }, { status: 500 });
  }
}
