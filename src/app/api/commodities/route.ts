import { NextResponse } from 'next/server';
import { parseCommodityRates, CommodityRate } from '@/lib/commodityParser';
import City from '@/models/City';
import CommodityMapping from '@/models/CommodityMapping';
import dbConnect from '@/lib/mongodb';
import { enrichCommodityRatesWithCities, type BhavCity } from '@/app/services/cityBhav';
import { DEFAULT_COMMODITY_MAPPING, normalizeCommodityMapping } from '@/app/services/commodityMapping';

// Cache for commodity rates to avoid excessive API calls
let cachedRates: { rates: CommodityRate[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 1 minute

// Commodity API endpoint - can be configured to different sources
const COMMODITY_API_URL = process.env.COMMODITY_API_URL || 
  'https://bcast.kanhajewellers.in:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/kanha';

async function fetchCommodityRates(): Promise<CommodityRate[]> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await fetch(`${COMMODITY_API_URL}?_=${timestamp}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const text = await response.text();
    const rates = parseCommodityRates(text);

    if (rates.length === 0) {
      throw new Error('No rates parsed from API response');
    }

    // Update cache
    cachedRates = { rates, timestamp: Date.now() };
    return rates;
  } catch (error) {
    console.error('Failed to fetch commodity rates:', error);
    
    // Return cached data if available
    if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION * 5) {
      console.log('Using cached commodity rates');
      return cachedRates.rates;
    }

    throw error;
  }
}

export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    const useCachedRates = Boolean(cachedRates && now - cachedRates.timestamp < CACHE_DURATION);
    const rates = useCachedRates ? cachedRates!.rates : await fetchCommodityRates();

    if (!useCachedRates) {
      cachedRates = { rates, timestamp: now };
    }

    // Connect to DB to fetch city data
    await dbConnect();
    const cities = await City.find().lean();
    const mappingDoc = await CommodityMapping.findOne().lean();
    const mapping = normalizeCommodityMapping(mappingDoc ?? DEFAULT_COMMODITY_MAPPING);

    const enrichedRates = enrichCommodityRatesWithCities(
      rates,
      cities.map((city) => ({
        _id: String(city._id),
        cityName: city.cityName,
        gold_price: city.gold_price ?? 0,
        silver_price: city.silver_price ?? 0,
      })) satisfies BhavCity[],
      mapping
    );

    return NextResponse.json({
      rates: enrichedRates,
      mapping,
      cached: useCachedRates,
      timestamp: now,
      total: enrichedRates.length,
    }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown commodity API error';
    console.error('Commodity API error:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch commodity rates',
        error: message,
      },
      { status: 500 }
    );
  }
}
