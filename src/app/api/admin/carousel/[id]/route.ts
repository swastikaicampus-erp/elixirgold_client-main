import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CarouselImage from '@/models/CarouselImage';
import { authorizeRequest } from '@/lib/auth-request';

function getAdminUser(request: NextRequest) {
  return authorizeRequest(request, ['admin', 'superadmin']);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAdminUser(request);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const image = await CarouselImage.findByIdAndDelete(id);

    if (!image) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Image deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
