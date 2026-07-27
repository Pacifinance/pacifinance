/**
 * Locale-aware value normalizers for broker/exchange CSV exports.
 *
 * Every quirk handled here is documented with real-world examples in
 * docs/INVESTMENT_IMPORT_RESEARCH.md (decimal commas, embedded currency
 * symbols, dd-MM-yyyy dates, ...). Pure functions — no I/O.
 */

/**
 * Parses a numeric cell that may use either European ("1.431,00") or
 * Anglo ("4,581.91") separators, and may embed a currency symbol/code
 * (Coinbase "€3343.11", Revolut "-$30.93" / "50.00 SEK").
 * Returns null for empty/unparseable cells (never NaN).
 */
export function parseImportNumber(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  // Strip currency symbols, codes, spaces (incl. non-breaking) and quotes
  let cleaned = String(raw).replace(/[^\d.,\-+]/g, '').trim();
  if (cleaned === '' || cleaned === '-' || cleaned === '+') return null;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  if (lastComma !== -1 && lastDot !== -1) {
    // Both present: the rightmost one is the decimal separator
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    // Only commas: decimal if it looks like one (1-2 trailing digits or a
    // single comma); thousands separator when digits come in groups of 3
    const commaCount = (cleaned.match(/,/g) || []).length;
    const digitsAfter = cleaned.length - lastComma - 1;
    if (commaCount === 1 && digitsAfter !== 3) {
      cleaned = cleaned.replace(',', '.');
    } else if (commaCount === 1 && digitsAfter === 3) {
      // Ambiguous ("1,234"): treat as thousands — matches every researched
      // export, where decimals never come in exactly-3-digit form without
      // an explicit decimal point elsewhere in the column
      cleaned = cleaned.replace(',', '');
    } else {
      // Multiple commas: thousands separators
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * Parses the date formats seen across researched exports into "YYYY-MM-DD"
 * (date-only — timezone fidelity is deliberately not promised; see research
 * doc). Returns null when unrecognized. Never uses toISOString().split
 * (UTC-midnight bug, CLAUDE.md).
 */
export function parseImportDate(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const value = String(raw).trim();
  if (value === '') return null;

  const pad = (n: string | number) => String(n).padStart(2, '0');

  // ISO first: "2023-12-18 14:30:03.613", "2019-12-02T08:23:08.459586Z", "2025-01-17 16:57:02 UTC"
  let m = value.match(/^(\d{4})-(\d{2})-(\d{2})([T ]|$)/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  // Compact IBKR Flex: "20230522"
  m = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  // European day-first: "27-12-2024", "12.04.2024 13:01:45", "02/01/2024 00:10:33"
  m = value.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})([ T]|$)/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    if (month > 12 || month < 1 || day > 31 || day < 1) return null;
    return `${m[3]}-${pad(month)}-${pad(day)}`;
  }

  return null;
}

/** True if the value is shaped like an ISIN (2 letters + 9 alphanumerics + check digit). */
export function looksLikeIsin(value: string | null | undefined): boolean {
  return /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(String(value ?? '').trim().toUpperCase());
}

/**
 * Detects the delimiter of a CSV header line: semicolon-delimited exports
 * (DEGIRO, XTB, Scalable, pytr) vs comma-delimited ones.
 */
export function detectDelimiter(headerLine: string): ',' | ';' {
  const semicolons = (headerLine.match(/;/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;
  return semicolons > commas ? ';' : ',';
}

/**
 * Minimal CSV line splitter honoring double-quoted fields (RFC-4180 style,
 * including "" escapes). Enough for the researched exports — none of them
 * embed newlines inside fields.
 */
export function splitCsvLine(line: string, delimiter: ',' | ';'): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else current += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

/**
 * Splits raw CSV text into non-empty lines and locates the header row —
 * some exports (Directa: ~9 preamble lines) put metadata before it. The
 * header is the first line containing at least `minHeaderColumns` cells once
 * split with its own sniffed delimiter.
 */
export function extractCsvRows(rawText: string, minHeaderColumns = 3): {
  header: string[]; rows: string[][]; delimiter: ',' | ';';
} | null {
  const lines = rawText.split(/\r?\n/).filter((line) => line.trim() !== '');
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const delimiter = detectDelimiter(lines[i]);
    const cells = splitCsvLine(lines[i], delimiter);
    if (cells.filter((c) => c !== '').length >= minHeaderColumns) {
      const rows = lines.slice(i + 1).map((line) => splitCsvLine(line, delimiter));
      return { header: cells, rows, delimiter };
    }
  }
  return null;
}
