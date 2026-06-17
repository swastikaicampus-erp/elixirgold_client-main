/**
 * Commodity Data Parser
 * Handles various API response formats and extracts structured data
 * Flexible to handle format changes
 */

export interface CommodityRate {
  id: number;
  name: string;
  buy: number | null;
  sell: number | null;
  high: number | null;
  low: number | null;
}

/**
 * Parse commodity rates from raw API response
 * Handles tab-separated, space-separated, and other delimited formats
 * Format: ID NAME BUY SELL HIGH LOW
 */
export function parseCommodityRates(rawData: string): CommodityRate[] {
  if (!rawData || typeof rawData !== 'string') {
    return [];
  }

  const rates: CommodityRate[] = [];
  const lines = rawData.split('\n').filter(line => line.trim());

  for (const line of lines) {
    try {
      // Try multiple delimiters: tab, multiple spaces, comma
      const parts = line
        .trim()
        .split(/[\t]+|[\s]{2,}|,/)
        .filter(p => p.trim());

      if (parts.length < 3) continue;

      const id = parseInt(parts[0]?.trim(), 10);
      if (isNaN(id)) continue;

      // Parse numeric values with flexible format handling
      const buy = parseFloat(parts[2]?.trim()) || null;
      const sell = parseFloat(parts[3]?.trim()) || null;
      const high = parts[4] ? parseFloat(parts[4].trim()) || null : null;
      const low = parts[5] ? parseFloat(parts[5].trim()) || null : null;

      // Get name from parts, handle multi-word names
      const nameStart = parts.slice(1, 2).join(' ').trim();
      
      rates.push({
        id,
        name: nameStart || `Commodity ${id}`,
        buy,
        sell,
        high,
        low,
      });
    } catch (error) {
      console.warn(`Failed to parse line: ${line}`, error);
      continue;
    }
  }

  return rates;
}

/**
 * Find a commodity rate by ID
 */
export function findCommodityById(rates: CommodityRate[], id: number): CommodityRate | undefined {
  return rates.find(rate => rate.id === id);
}

/**
 * Filter commodities by category
 */
export function filterByCategory(
  rates: CommodityRate[],
  category: string,
  commodityMap: Record<number, { category: string }>
): CommodityRate[] {
  return rates.filter(rate => commodityMap[rate.id]?.category === category);
}

/**
 * Format number for display
 */
export function formatPrice(value: number | null, decimals = 2): string {
  if (value === null || isNaN(value)) {
    return '-';
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Add city addon price to commodity price
 */
export function addCityPrice(commodityPrice: number | null, cityAddonPrice: number): number | null {
  if (commodityPrice === null) return null;
  return commodityPrice + cityAddonPrice;
}
