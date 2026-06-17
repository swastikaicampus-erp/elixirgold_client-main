import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CarouselImage from '@/models/CarouselImage';
import { authorizeRequest } from '@/lib/auth-request';

function getAdminUser(request: NextRequest) {
  return authorizeRequest(request, ['admin', 'superadmin']);
}

export async function GET(request: NextRequest) {
  const auth = getAdminUser(request);
  if ('error' in auth) return auth.error;

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

export async function POST(request: NextRequest) {
  const auth = getAdminUser(request);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const { imageData } = body;

    if (!imageData) {
      return NextResponse.json(
        { message: 'Image data is required' },
        { status: 400 }
      );
    }

    const image = await CarouselImage.create({ imageData });
    return NextResponse.json({ image }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
