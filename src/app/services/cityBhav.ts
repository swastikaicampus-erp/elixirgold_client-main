import { COMMODITIES, type CommodityConfig } from "@/config/commodities";
import { findCommodityById, type CommodityRate } from "@/lib/commodityParser";
import { DEFAULT_COMMODITY_MAPPING, type CommodityMapping } from "@/app/services/commodityMapping";

export interface BhavCity {
  _id: string;
  cityName: string;
  gold_price: number;
  silver_price: number;
}

export interface ResolvedBhavValue {
  raw: number | null;
}

export interface ResolvedCommodityBhav {
  indianGoldRaw: number | null;
  indianSilverRaw: number | null;
}

export interface EnrichedCommodityRate extends CommodityRate {
  displayName: string;
  unit: string;
  category: CommodityConfig["category"];
  cityPrices: Array<{
    cityName: string;
    cityId: string;
    gold_price: number;
    silver_price: number;
    buyWithAddon: number | null;
    sellWithAddon: number | null;
  }>;
}

export function resolveCommodityBhav(
  commodityRates: CommodityRate[],
  mapping?: CommodityMapping,
  fallback?: Partial<ResolvedCommodityBhav>
): ResolvedCommodityBhav {
  const commodityMapping = mapping ?? DEFAULT_COMMODITY_MAPPING;
  const goldJune = findCommodityById(commodityRates, commodityMapping.indianGoldId);
  const silverJuly = findCommodityById(commodityRates, commodityMapping.indianSilverId);

  return {
    indianGoldRaw: goldJune?.buy ?? fallback?.indianGoldRaw ?? null,
    indianSilverRaw: silverJuly?.buy ?? fallback?.indianSilverRaw ?? null,
  };
}

export function resolveCityBhavValue(baseValue: number | null, cityAddon: number): number | null {
  if (baseValue === null) {
    return null;
  }

  return baseValue + cityAddon;
}

export function getCityAddonForCommodity(commodityName: string, city: BhavCity): number {
  return commodityName.toLowerCase().includes("silver") ? (city.silver_price ?? 0) : (city.gold_price ?? 0);
}

export function enrichCommodityRatesWithCities(
  rates: CommodityRate[],
  cities: BhavCity[],
  mapping: CommodityMapping = DEFAULT_COMMODITY_MAPPING
): EnrichedCommodityRate[] {
  return rates.map((rate) => {
    const commodityConfig = COMMODITIES[rate.id];
    const isMappedIndianGold = rate.id === mapping.indianGoldId;
    const isMappedIndianSilver = rate.id === mapping.indianSilverId;
    const appliesCityAddon =
      commodityConfig?.category === "futures" ||
      commodityConfig?.category === "jewelry" ||
      isMappedIndianGold ||
      isMappedIndianSilver;
    const resolvedDisplayName =
      commodityConfig?.name || (isMappedIndianGold ? "GOLD JUNE" : isMappedIndianSilver ? "SILVER JUL" : rate.name);
    const resolvedCategory = commodityConfig?.category || (appliesCityAddon ? "futures" : "precious_metal");

    return {
      ...rate,
      displayName: resolvedDisplayName,
      unit: commodityConfig?.unit || "₹",
      category: resolvedCategory,
      cityPrices: cities.map((city) => {
        const commodityName = resolvedDisplayName;
        const addon = appliesCityAddon ? getCityAddonForCommodity(commodityName, city) : 0;

        return {
          cityName: city.cityName,
          cityId: city._id,
          gold_price: city.gold_price ?? 0,
          silver_price: city.silver_price ?? 0,
          buyWithAddon: rate.buy == null ? rate.buy : rate.buy + addon,
          sellWithAddon: rate.sell == null ? rate.sell : rate.sell + addon,
        };
      }),
    };
  });
}
