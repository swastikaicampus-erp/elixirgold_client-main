import { NextRequest, NextResponse } from 'next/server';

import { DEFAULT_COMMODITY_MAPPING, normalizeCommodityMapping } from '@/app/services/commodityMapping';
import { parseCommodityRates } from '@/lib/commodityParser';
import dbConnect from '@/lib/mongodb';
import { authorizeRequest } from '@/lib/auth-request';
import CommodityMapping from '@/models/CommodityMapping';

const COMMODITY_API_URL =
  process.env.COMMODITY_API_URL ||
  'https://bcast.kanhajewellers.in:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/kanha';

function getSuperadminUser(request: NextRequest) {
  return authorizeRequest(request, ['superadmin']);
}

export async function GET(request: NextRequest) {
  const auth = getSuperadminUser(request);
  if ('error' in auth) return auth.error;

  try {
    const view = request.nextUrl.searchParams.get('view') ?? 'mapping';

    if (view === 'raw') {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(`${COMMODITY_API_URL}?_=${timestamp}`, {
        cache: 'no-store',
      });

      const rawText = await response.text();

      if (!response.ok) {
        return NextResponse.json(
          {
            message: 'Failed to fetch raw bcast response',
            status: response.status,
            rawText,
          },
          { status: response.status }
        );
      }

      const parsedRows = parseCommodityRates(rawText);

      return NextResponse.json(
        {
          source: COMMODITY_API_URL,
          timestamp,
          rawText,
          parsedRows,
          rowCount: parsedRows.length,
        },
        { status: 200 }
      );
    }

    await dbConnect();

    const mapping = await CommodityMapping.findOne().lean();
    return NextResponse.json(
      {
        mapping: normalizeCommodityMapping(mapping ?? DEFAULT_COMMODITY_MAPPING),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = getSuperadminUser(request);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();

    const body = await request.json();
    const indianGoldId = Number(body.indianGoldId);
    const indianSilverId = Number(body.indianSilverId);

    if (!Number.isInteger(indianGoldId) || !Number.isInteger(indianSilverId)) {
      return NextResponse.json(
        { message: 'Indian Gold ID and Indian Silver ID must be valid integers' },
        { status: 400 }
      );
    }

    const mapping = await CommodityMapping.findOneAndUpdate(
      {},
      {
        indianGoldId,
        indianSilverId,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json(
      { message: 'Commodity mapping updated successfully', mapping },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = getSuperadminUser(request);
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json().catch(() => ({}));
    const view = String(body.view ?? 'raw');

    if (view !== 'raw') {
      return NextResponse.json({ message: 'Unsupported view' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const response = await fetch(`${COMMODITY_API_URL}?_=${timestamp}`, {
      cache: 'no-store',
    });

    const rawText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: 'Failed to fetch raw bcast response',
          status: response.status,
          rawText,
        },
        { status: response.status }
      );
    }

    const parsedRows = parseCommodityRates(rawText);

    return NextResponse.json(
      {
        source: COMMODITY_API_URL,
        timestamp,
        rawText,
        parsedRows,
        rowCount: parsedRows.length,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}