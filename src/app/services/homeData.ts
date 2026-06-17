import type { ParsedRateRow } from "@/app/services/dataParser";
import { findCommodityById, type CommodityRate } from "@/lib/commodityParser";
import { DEFAULT_COMMODITY_MAPPING, type CommodityMapping } from "@/app/services/commodityMapping";

export interface CityOption {
  _id: string;
  cityName: string;
  gold_price: number;
  silver_price: number;
}

export interface LegacyBhav {
  goldMcx: string;
  goldMcxRaw: number | null;
  goldJuneBuy: string;
  goldJuneBuyRaw: number | null;
  goldGwalior: string;
  goldGwaliorRaw: number | null;
  silverMcx: string;
  silverMcxRaw: number | null;
  silverJulyBuy: string;
  silverJulyBuyRaw: number | null;
  silverGwalior: string;
  silverGwaliorRaw: number | null;
}

export interface AdminRateCard {
  title: string;
  value: string;
  rawValue: number | null;
}

export interface CommodityBhav {
  indianGold: string;
  indianGoldRaw: number | null;
  indianSilver: string;
  indianSilverRaw: number | null;
}

export interface BhavStreamFallback {
  indianGoldRaw: number | null;
  indianSilverRaw: number | null;
}

export const formatValue = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: value % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const parseDisplayNumber = (value: string) => {
  if (value === "-") {
    return null;
  }

  const numericValue = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const formatOffsetValue = (value: string, offset: number) => {
  const numericValue = parseDisplayNumber(value);
  return numericValue === null ? "-" : `₹ ${formatValue(numericValue + offset)}`;
};

export const buildLegacyBhav = (rates: ParsedRateRow[]): LegacyBhav => {
  const findByLabel = (key: string) => {
    const aliases: Record<string, string[]> = {
      goldComex: ["gold comex", "gold mcx", "gold($)"],
      silverComex: ["silver comex", "silver mcx", "silver($)"],
      goldJune: ["gold june", "gold in"],
      silverJuly: ["silver jul", "silver in"],
      gold9950: ["gold 99.50-10 gm", "gold 995 gwalior", "gold 99.50"],
      silverCut: ["silver cut 9999-1 kg", "silver cut 9999"],
      swastikSilver: ["swastik silver-1 kg", "swastik silver"],
      goldJewar22: ["gold jewar 22 ct"],
    };

    const normalize = (input: string) => input.toLowerCase().replace(/[^a-z0-9₹]/g, " ").replace(/\s+/g, " ").trim();
    const keyAliases = aliases[key] ?? [key];

    return rates.find((row) => {
      const rowLabel = normalize(row.label);
      return keyAliases.some((alias) => rowLabel.includes(normalize(alias)));
    });
  };

  const goldComex = findByLabel("goldComex");
  const goldJune = findByLabel("goldJune");
  const silverComex = findByLabel("silverComex");
  const silverJuly = findByLabel("silverJuly");
  const goldGwalior = findByLabel("gold9950") || findByLabel("goldJewar22");
  const silverGwalior = findByLabel("silverCut") || findByLabel("swastikSilver");

  return {
    goldMcx: goldComex ? formatValue(goldComex.sell) : "-",
    goldMcxRaw: goldComex?.sell ?? null,
    goldJuneBuy: goldJune ? formatValue(goldJune.buy) : "-",
    goldJuneBuyRaw: goldJune?.buy ?? null,
    goldGwalior: goldGwalior ? formatValue(goldGwalior.sell) : "-",
    goldGwaliorRaw: goldGwalior?.sell ?? null,
    silverMcx: silverComex ? formatValue(silverComex.sell) : "-",
    silverMcxRaw: silverComex?.sell ?? null,
    silverJulyBuy: silverJuly ? formatValue(silverJuly.buy) : "-",
    silverJulyBuyRaw: silverJuly?.buy ?? null,
    silverGwalior: silverGwalior ? formatValue(silverGwalior.sell) : "-",
    silverGwaliorRaw: silverGwalior?.sell ?? null,
  };
};

export const buildAdminRateCards = (legacyBhav: LegacyBhav): AdminRateCard[] => [
  { title: "Gold Spot", value: `$ ${legacyBhav.goldMcx}`, rawValue: legacyBhav.goldMcxRaw },
  { title: "Silver Spot", value: `$ ${legacyBhav.silverMcx}`, rawValue: legacyBhav.silverMcxRaw },
  { title: "Gold Indian", value: `₹ ${legacyBhav.goldJuneBuy}`, rawValue: legacyBhav.goldJuneBuyRaw },
  { title: "Silver Indian", value: `₹ ${legacyBhav.silverJulyBuy}`, rawValue: legacyBhav.silverJulyBuyRaw },
];

export const buildStreamFallback = (
  rates: ParsedRateRow[],
  mapping: CommodityMapping = DEFAULT_COMMODITY_MAPPING
): BhavStreamFallback => {
  const findByLabel = (key: string) => {
    const aliases: Record<string, string[]> = {
      goldJune: ["gold june", "gold in", String(mapping.indianGoldId)],
      silverJuly: ["silver jul", "silver in", String(mapping.indianSilverId)],
    };

    const normalize = (input: string) => input.toLowerCase().replace(/[^a-z0-9₹]/g, " ").replace(/\s+/g, " ").trim();
    const keyAliases = aliases[key] ?? [key];

    return rates.find((row) => {
      const rowLabel = normalize(row.label);
      const rowId = String(row.id);
      return (
        keyAliases.some((alias) => rowLabel.includes(normalize(alias))) ||
        (key === "goldJune" && rowId === String(mapping.indianGoldId)) ||
        (key === "silverJuly" && rowId === String(mapping.indianSilverId))
      );
    });
  };

  const goldJune = findByLabel("goldJune");
  const silverJuly = findByLabel("silverJuly");

  return {
    indianGoldRaw: goldJune?.buy ?? null,
    indianSilverRaw: silverJuly?.buy ?? null,
  };
};

export const buildCommodityBhav = (
  rates: CommodityRate[],
  mapping: CommodityMapping = DEFAULT_COMMODITY_MAPPING
): CommodityBhav => {
  const goldJune = findCommodityById(rates, mapping.indianGoldId);
  const silverJuly = findCommodityById(rates, mapping.indianSilverId);

  return {
    indianGold: goldJune ? formatValue(goldJune.buy) : "-",
    indianGoldRaw: goldJune?.buy ?? null,
    indianSilver: silverJuly ? formatValue(silverJuly.buy) : "-",
    indianSilverRaw: silverJuly?.buy ?? null,
  };
};

export const getSelectedCity = (cities: CityOption[], selectedCityId: string) =>
  cities.find((city) => city._id === selectedCityId) ?? null;
