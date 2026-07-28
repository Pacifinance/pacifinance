/**
 * Human-readable labels for the Bloomberg/OpenFIGI exchange codes (`exchCode`)
 * shown next to instrument search results and saved holdings — raw codes like
 * "UW" or "GR" mean nothing to most users. Deliberately not exhaustive:
 * Bloomberg's exchange code list runs into the hundreds, most of which a
 * retail user searching a stocks/ETF panel will never encounter. Unmapped
 * codes fall back to the raw code (see getExchangeName) rather than being
 * hidden, so nothing silently disappears.
 *
 * @module data/exchangeNames
 */
export const EXCHANGE_NAMES: Readonly<Record<string, string>> = {
  US: 'NYSE / Nasdaq',
  UN: 'NYSE',
  UW: 'Nasdaq',
  LN: 'London Stock Exchange',
  GR: 'Xetra (Frankfurt)',
  FP: 'Euronext Paris',
  IM: 'Euronext Milan',
  NA: 'Euronext Amsterdam',
  SW: 'SIX Swiss Exchange',
  DC: 'Nasdaq Copenhagen',
};

/** Maps an exchange code to its readable name, or returns the raw code unchanged if unmapped. */
export function getExchangeName(exchangeCode: string | null | undefined): string | null {
  if (!exchangeCode) return null;
  return EXCHANGE_NAMES[exchangeCode.toUpperCase()] ?? exchangeCode;
}
