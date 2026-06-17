/**
 * Commodity Configuration
 * Maps commodity IDs to their display names and units
 * Update this config monthly to handle API response format changes
 * Last updated: May 2026
 */

export interface CommodityConfig {
  id: number;
  name: string;
  unit: string;
  category: 'precious_metal' | 'exchange' | 'futures' | 'jewelry';
}

export const COMMODITIES: Record<number, CommodityConfig> = {
  2750: {
    id: 2750,
    name: 'GOLD COMEX($)',
    unit: '$',
    category: 'precious_metal',
  },
  2751: {
    id: 2751,
    name: 'SILVER COMEX($)',
    unit: '$',
    category: 'precious_metal',
  },
  2752: {
    id: 2752,
    name: 'INR EX(₹)',
    unit: '₹',
    category: 'exchange',
  },
  2753: {
    id: 2753,
    name: 'GOLD JUNE',
    unit: '₹',
    category: 'futures',
  },
  2754: {
    id: 2754,
    name: 'SILVER JUL',
    unit: '₹',
    category: 'futures',
  },
  2755: {
    id: 2755,
    name: 'GOLD 99.50-10 GM',
    unit: '₹',
    category: 'jewelry',
  },
  2767: {
    id: 2767,
    name: 'SILVER CUT 9999-1 KG',
    unit: '₹',
    category: 'jewelry',
  },
  3400: {
    id: 3400,
    name: 'SWASTIK SILVER-1 KG',
    unit: '₹',
    category: 'jewelry',
  },
  2967: {
    id: 2967,
    name: 'GOLD JEWAR 18 CT',
    unit: '₹',
    category: 'jewelry',
  },
  3229: {
    id: 3229,
    name: 'GOLD JEWAR 20 CT',
    unit: '₹',
    category: 'jewelry',
  },
  3228: {
    id: 3228,
    name: 'GOLD JEWAR 22 CT',
    unit: '₹',
    category: 'jewelry',
  },
  2766: {
    id: 2766,
    name: 'GOLD 99.50 RTGS 10-GM',
    unit: '₹',
    category: 'jewelry',
  },
  2768: {
    id: 2768,
    name: 'SILVER CUT 9999 RTGS-1 KG',
    unit: '₹',
    category: 'jewelry',
  },
};

export function getCommodityName(id: number): string {
  return COMMODITIES[id]?.name || `Commodity ${id}`;
}

export function getCommodityUnit(id: number): string {
  return COMMODITIES[id]?.unit || '₹';
}

export function getCommodityCategory(id: number) {
  return COMMODITIES[id]?.category || 'precious_metal';
}
