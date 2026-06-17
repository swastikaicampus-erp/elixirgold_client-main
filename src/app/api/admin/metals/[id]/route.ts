import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

import { authorizeRequest } from '@/lib/auth-request';
import dbConnect from '@/lib/mongodb';
import Metals from '@/models/Metals';

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
			return NextResponse.json({ message: 'Invalid metal ID' }, { status: 400 });
		}

		const body = await request.json();
		const updateData: Record<string, unknown> = {};

		if (body.metal_name !== undefined) {
			updateData.metal_name = String(body.metal_name).trim();
		}

		if (body.metal_price !== undefined) {
			updateData.metal_price = Number(body.metal_price);
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json(
				{ message: 'At least one field is required to update metal' },
				{ status: 400 }
			);
		}

		const metal = await Metals.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

		if (!metal) {
			return NextResponse.json({ message: 'Metal not found' }, { status: 404 });
		}

		return NextResponse.json({ metal }, { status: 200 });
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const auth = getAdminUser(request);
	if ('error' in auth) return auth.error;

	try {
		await dbConnect();
		const { id } = await params;

		if (!isValidObjectId(id)) {
			return NextResponse.json({ message: 'Invalid metal ID' }, { status: 400 });
		}

		const metal = await Metals.findByIdAndDelete(id);

		if (!metal) {
			return NextResponse.json({ message: 'Metal not found' }, { status: 404 });
		}

		return NextResponse.json({ message: 'Metal deleted successfully' }, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: error.message || 'Internal server error' },
			{ status: 500 }
		);
	}
}
