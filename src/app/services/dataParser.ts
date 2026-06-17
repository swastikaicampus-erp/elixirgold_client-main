export interface ParsedRateRow {
  id: string;
  label: string;
  buy: number | null;
  sell: number | null;
  high: number | null;
  low: number | null;
}

interface ParseOptions {
  minFields?: number;
  maxFields?: number;
  allowPartialData?: boolean;
  logWarnings?: boolean;
}

interface ValidationIssue {
  message: string;
  rowId?: string;
}

export interface ParserDiagnostics {
  rawLength: number;
  rowCount: number;
  issueCount: number;
  issues: ValidationIssue[];
}

const LABEL_ALIASES: Record<string, string[]> = {
  goldComex: ['gold comex', 'gold mcx', 'gold($)'],
  silverComex: ['silver comex', 'silver mcx', 'silver($)'],
  inrExchange: ['inr ex', 'inr exchange', 'inr ex(₹)'],
  goldJune: ['gold june', 'gold in'],
  silverJuly: ['silver jul', 'silver in'],
  gold9950: ['gold 99.50-10 gm', 'gold 995 gwalior', 'gold 99.50'],
  silverCut: ['silver cut 9999-1 kg', 'silver cut 9999'],
  swastikSilver: ['swastik silver-1 kg', 'swastik silver'],
  goldJewar22: ['gold jewar 22 ct'],
};

export function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned || cleaned === '-') return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function splitLine(line: string): string[] {
  return line
    .trim()
    .split(/\t+|\s{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseRates(input: string, options: ParseOptions = {}): ParsedRateRow[] {
  if (!input?.trim()) return [];

  const minFields = options.minFields ?? 3;
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows: ParsedRateRow[] = [];

  for (const line of lines) {
    const fields = splitLine(line);
    if (fields.length < minFields) continue;

    const idField = fields[0] ?? '';
    if (!/^\d+$/.test(idField)) continue;

    const id = idField;
    const buy = toNumberOrNull(fields[2]);
    const sell = toNumberOrNull(fields[3]);
    const high = toNumberOrNull(fields[4]);
    const low = toNumberOrNull(fields[5]);
    const label = fields[1] ?? `RATE ${id}`;

    if (!options.allowPartialData && buy === null && sell === null) {
      continue;
    }

    rows.push({ id, label, buy, sell, high, low });
  }

  return rows;
}

export function validateData(rows: ParsedRateRow[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!rows.length) {
    issues.push({ message: 'No rows parsed from stream data.' });
    return issues;
  }

  for (const row of rows) {
    if (!row.label) {
      issues.push({ message: 'Missing label', rowId: row.id });
    }
    if (row.buy === null && row.sell === null) {
      issues.push({ message: 'Both buy and sell are null', rowId: row.id });
    }
  }

  return issues;
}

export function getParserDiagnostics(
  raw: string,
  rows: ParsedRateRow[],
  issues: ValidationIssue[]
): ParserDiagnostics {
  return {
    rawLength: raw.length,
    rowCount: rows.length,
    issueCount: issues.length,
    issues,
  };
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9₹]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function findByLabel(rows: ParsedRateRow[], key: string): ParsedRateRow | undefined {
  const aliases = LABEL_ALIASES[key] ?? [key];

  return rows.find((row) => {
    const rowLabel = normalize(row.label);
    return aliases.some((alias) => rowLabel.includes(normalize(alias)));
  });
}
