/**
 * Shared helpers for the Portfolio Holdings charts (HoldingsBreakdownChart,
 * HoldingsHistoryChart) - value/label extraction and a fixed categorical
 * palette for individual holdings (there's no per-symbol color anywhere else
 * in the app, only per asset-category - see src/data/assetColors.ts).
 *
 * @module utils/holdingsChartHelpers
 */
import type { InvestmentHoldingDto, InvestmentHoldingHistoryDto } from '../types/api';

export const getHoldingValue = (
  holding: Pick<InvestmentHoldingDto, 'currentValue' | 'investedAmount'> | Pick<InvestmentHoldingHistoryDto, 'currentValue' | 'investedAmount'> | null | undefined,
): number => Number(holding?.currentValue ?? holding?.investedAmount ?? 0) || 0;

export const getHoldingLabel = (holding: InvestmentHoldingDto | null | undefined): string =>
  holding?.instrument?.symbol || holding?.instrument?.name || holding?.notes || `Holding #${holding?.id}`;

/**
 * Fixed, colorblind-considerate categorical palette (Tableau 10) - never
 * auto-generate hues for an unbounded number of holdings. Cycled by rank, not
 * reused for the "Other" bucket (always a neutral grey).
 */
export const HOLDINGS_CHART_PALETTE: readonly string[] = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
];

export function paletteColor(index: number): string {
  return HOLDINGS_CHART_PALETTE[index % HOLDINGS_CHART_PALETTE.length];
}

export const OTHER_SLICE_COLOR = { light: '#bbbbbb', dark: '#666666' } as const;
