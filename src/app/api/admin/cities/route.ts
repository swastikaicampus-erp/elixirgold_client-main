import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import City from '@/models/City';
import { authorizeRequest } from '@/lib/auth-request';

function getAdminUser(request: NextRequest) {
  return authorizeRequest(request, ['admin', 'superadmin']);
}

export async function GET(request: NextRequest) {
  const auth = getAdminUser(request);
  if ('error' in auth) return auth.error;

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

export async function POST(request: NextRequest) {
  const auth = getAdminUser(request);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();

    const body = await request.json();
    console.log('📥 POST request body:', body);

    const { cityName, gold_price, silver_price } = body;

    if (!cityName || gold_price === undefined || gold_price === null || silver_price === undefined || silver_price === null) {
      console.log('❌ Validation failed - missing fields');
      return NextResponse.json(
        { message: 'City name, gold price, and silver price are required' },
        { status: 400 }
      );
    }

    console.log(`✅ Creating city: ${cityName} (Gold: ${gold_price}, Silver: ${silver_price})`);

    const city = await City.create({
      cityName: cityName.trim(),
      gold_price: Number(gold_price),
      silver_price: Number(silver_price),
    });

    console.log('✅ City created:', city);

    return NextResponse.json({ city }, { status: 201 });
  } catch (error: any) {
    console.error('❌ POST Error:', error.message, error);
    
    if (error?.code === 11000) {
      return NextResponse.json(
        { message: 'City already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
