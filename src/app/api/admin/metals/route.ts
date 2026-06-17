import { NextRequest, NextResponse } from 'next/server';

import { authorizeRequest } from '@/lib/auth-request';
import dbConnect from '@/lib/mongodb';
import Metals from '@/models/Metals';

function getAdminUser(request: NextRequest) {
	return authorizeRequest(request, ['admin', 'superadmin']);
}

export async function GET(request: NextRequest) {
	const auth = getAdminUser(request);
	if ('error' in auth) return auth.error;

	try {
		await dbConnect();
		const metals = await Metals.find().sort({ createdAt: -1 }).lean();

		return NextResponse.json({ metals }, { status: 200 });
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
		const { metal_name, metal_price } = body;

		if (!metal_name || metal_price === undefined || metal_price === null) {
			return NextResponse.json(
				{ message: 'Metal name and metal price are required' },
				{ status: 400 }
			);
		}

		const metal = await Metals.create({
			metal_name: String(metal_name).trim(),
			metal_price: Number(metal_price),
		});

		return NextResponse.json({ metal }, { status: 201 });
	} catch (error: any) {
		if (error?.code === 11000) {
			return NextResponse.json({ message: 'Metal already exists' }, { status: 400 });
		}

		return NextResponse.json(
			{ message: error.message || 'Internal server error' },
			{ status: 500 }
		);
	}
}
