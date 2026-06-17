export interface CommodityMapping {
  indianGoldId: number;
  indianSilverId: number;
}

export const DEFAULT_COMMODITY_MAPPING: CommodityMapping = {
  indianGoldId: 2753,
  indianSilverId: 2754,
};

export function normalizeCommodityMapping(
  mapping?: Partial<CommodityMapping> | null
): CommodityMapping {
  return {
    indianGoldId: Number.isFinite(mapping?.indianGoldId)
      ? Number(mapping?.indianGoldId)
      : DEFAULT_COMMODITY_MAPPING.indianGoldId,
    indianSilverId: Number.isFinite(mapping?.indianSilverId)
      ? Number(mapping?.indianSilverId)
      : DEFAULT_COMMODITY_MAPPING.indianSilverId,
  };
}