import type { CityOption } from "@/app/services/homeData";
import type { CommodityMapping } from "@/app/services/commodityMapping";

export interface CommodityCityPrice {
  cityName: string;
  cityId: string;
  gold_price: number;
  silver_price: number;
  buyWithAddon: number | null;
  sellWithAddon: number | null;
}

export interface CommodityDashboardRate {
  id: number;
  name: string;
  buy: number | null;
  sell: number | null;
  high: number | null;
  low: number | null;
  displayName?: string;
  unit?: string;
  category?: string;
  cityPrices?: CommodityCityPrice[];
}

export interface CommodityRatesPayload {
  rates: CommodityDashboardRate[];
  mapping: CommodityMapping;
  cached?: boolean;
  timestamp?: number;
  total?: number;
}

export interface CarouselImagePayload {
  imageData: string;
}

export interface MetalPricePayload {
  _id: string;
  metal_name: string;
  metal_price: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchCarouselImages(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch("/api/carousel", { signal });
  if (!response.ok) {
    throw new Error(`Carousel request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { images?: CarouselImagePayload[] };
  return (data.images ?? []).map((image) => image.imageData);
}

export async function fetchCities(signal?: AbortSignal): Promise<CityOption[]> {
  const response = await fetch("/api/cities", { signal });

  if (!response.ok) {
    throw new Error(`City request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { cities?: CityOption[] };
  return payload.cities ?? [];
}

export async function fetchMetals(signal?: AbortSignal): Promise<MetalPricePayload[]> {
  const response = await fetch("/api/metals", { signal });

  if (!response.ok) {
    throw new Error(`Metal request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { metals?: MetalPricePayload[] };
  return payload.metals ?? [];
}

export async function fetchCommodityRates(signal?: AbortSignal): Promise<CommodityRatesPayload> {
  const response = await fetch("/api/commodities", { signal });

  if (!response.ok) {
    throw new Error(`Commodity request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Partial<CommodityRatesPayload>;
  return {
    rates: payload.rates ?? [],
    mapping: payload.mapping ?? { indianGoldId: 2753, indianSilverId: 2754 },
    cached: payload.cached,
    timestamp: payload.timestamp,
    total: payload.total,
  };
}
