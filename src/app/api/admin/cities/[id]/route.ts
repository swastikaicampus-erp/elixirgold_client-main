import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId ,ObjectId} from 'mongoose';
import dbConnect from '@/lib/mongodb';
import City from '@/models/City';
import { authorizeRequest } from '@/lib/auth-request';
import { convertServerPatchToFullTree } from 'next/dist/client/components/segment-cache/navigation';

function getAdminUser(request: NextRequest) {
  return authorizeRequest(request, ['admin', 'superadmin']);
}



export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAdminUser(request);
  if ('error' in auth) return auth.error;
  
  try {
    await dbConnect();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid city ID' },
        { status: 400 }
      );
    }
    const { gold_price, silver_price } = await request.json();

    // At least one price must be provided
    if ((gold_price === undefined || gold_price === null) && (silver_price === undefined || silver_price === null)) {
      return NextResponse.json(
        { message: 'At least one price (gold_price or silver_price) is required' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = { $inc: {} };
    if (gold_price !== undefined && gold_price !== null) {
      updateData.$inc.gold_price = Number(gold_price);
    }
    if (silver_price !== undefined && silver_price !== null) {
      updateData.$inc.silver_price = Number(silver_price);
    }

    const city = await City.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!city) {
      return NextResponse.json(
        { message: 'City not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ city }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAdminUser(request);
  if ('error' in auth) return auth.error;
  
  try {
    await dbConnect();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid city ID' },
        { status: 400 }
      );
    }
    
    const city = await City.findByIdAndDelete(id);
    
    if (!city) {
      return NextResponse.json(
        { message: 'City not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'City deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
