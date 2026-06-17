import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CarouselImage from '@/models/CarouselImage';

export async function GET() {
  try {
    await dbConnect();
    const images = await CarouselImage.find().sort({ createdAt: -1 });
    return NextResponse.json({ images }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
