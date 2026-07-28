import type { InvestmentInstrumentDto } from '../types/api';
import { getExchangeName } from '../data/exchangeNames';

/**
 * Compact "exchange · currency · ISIN" detail line used to tell apart search
 * results (and saved holdings) that share the same ticker and name — e.g. the
 * many "AAPL / Apple Inc" listings across exchanges/CEDEARs.
 */
export const formatInstrumentDetails = (
  instrument: Pick<InvestmentInstrumentDto, 'exchange' | 'currency' | 'isin'> | null | undefined,
): string => {
  if (!instrument) return '';
  return [getExchangeName(instrument.exchange), instrument.currency, instrument.isin]
    .filter((part) => part != null && part !== '')
    .join(' · ');
};
