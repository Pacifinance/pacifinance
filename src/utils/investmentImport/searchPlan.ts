import type { InvestmentKind, InvestmentSearchSource } from '../../types/api';
import type { ImportPlatform } from './parsers';

export interface ImportInstrumentSearchStep {
  source: InvestmentSearchSource;
  kind?: InvestmentKind;
}

const CRYPTO_PLATFORMS = new Set<ImportPlatform>(['ledger', 'binance', 'cryptocom']);

export const getImportInstrumentSearchPlan = (
  platform: ImportPlatform,
): ImportInstrumentSearchStep[] => CRYPTO_PLATFORMS.has(platform)
  ? [{ source: 'coingecko', kind: 'crypto' }]
  : [{ source: 'figi' }, { source: 'coingecko', kind: 'crypto' }];
