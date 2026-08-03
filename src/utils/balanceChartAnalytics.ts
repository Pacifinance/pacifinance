export const BALANCE_ASSET_GROUPS = {
  liquidity: ['bank', 'cash', 'digitalServices', 'emergencyFund'],
  investments: ['stocks', 'etf', 'bonds', 'funds', 'commodities'],
  crypto: ['bitcoin', 'crypto'],
} as const;

export const BALANCE_ASSET_KEYS = Object.values(BALANCE_ASSET_GROUPS).flat();

export interface BalanceChartRow {
  name: string;
  total: number;
  [key: string]: string | number;
}

export interface BalanceChartKpis {
  currentTotal: number;
  absoluteChange: number;
  percentChange: number | null;
  liquidityValue: number;
  liquidityPercent: number;
  investedValue: number;
  investedPercent: number;
  peakValue: number;
  peakMonth: string | null;
}

const sumKeys = (row: BalanceChartRow | undefined, keys: readonly string[]) => (
  keys.reduce((sum, key) => sum + Number(row?.[key] || 0), 0)
);

export function calculateBalanceKpis(rows: BalanceChartRow[]): BalanceChartKpis {
  const first = rows[0];
  const current = rows[rows.length - 1];
  const currentTotal = Number(current?.total || 0);
  const firstTotal = Number(first?.total || 0);
  const absoluteChange = currentTotal - firstTotal;
  const percentChange = firstTotal === 0 ? null : (absoluteChange / Math.abs(firstTotal)) * 100;
  const liquidityValue = sumKeys(current, BALANCE_ASSET_GROUPS.liquidity);
  const investedValue = sumKeys(current, [...BALANCE_ASSET_GROUPS.investments, ...BALANCE_ASSET_GROUPS.crypto]);
  const peak = rows.reduce<BalanceChartRow | null>((best, row) => (
    best === null || Number(row.total) > Number(best.total) ? row : best
  ), null);

  return {
    currentTotal,
    absoluteChange,
    percentChange,
    liquidityValue,
    liquidityPercent: currentTotal === 0 ? 0 : (liquidityValue / currentTotal) * 100,
    investedValue,
    investedPercent: currentTotal === 0 ? 0 : (investedValue / currentTotal) * 100,
    peakValue: Number(peak?.total || 0),
    peakMonth: peak?.name || null,
  };
}

export function buildBalanceChanges(rows: BalanceChartRow[]): BalanceChartRow[] {
  return rows.map((row, index) => {
    const previous = rows[index - 1];
    const changed: BalanceChartRow = {
      name: row.name,
      total: previous ? Number(row.total) - Number(previous.total) : 0,
      rawTotal: Number(row.total),
    };
    BALANCE_ASSET_KEYS.forEach((key) => {
      changed[key] = previous ? Number(row[key] || 0) - Number(previous[key] || 0) : 0;
    });
    return changed;
  });
}

export function buildPercentageComposition(rows: BalanceChartRow[]): BalanceChartRow[] {
  return rows.map((row) => {
    const total = Number(row.total || 0);
    const normalized: BalanceChartRow = {...row, total: total === 0 ? 0 : 100, rawTotal: total};
    BALANCE_ASSET_KEYS.forEach((key) => {
      normalized[`raw_${key}`] = Number(row[key] || 0);
      normalized[key] = total === 0 ? 0 : (Number(row[key] || 0) / total) * 100;
    });
    return normalized;
  });
}

export function buildPreviousPeriodComparison(
  allRows: BalanceChartRow[], visibleRows: BalanceChartRow[],
): Array<BalanceChartRow & { comparisonTotal: number | null }> {
  if (visibleRows.length === 0) return [];
  const firstIndex = allRows.findIndex((row) => row.name === visibleRows[0].name);
  return visibleRows.map((row, index) => {
    const comparisonIndex = firstIndex - visibleRows.length + index;
    return {
      ...row,
      comparisonTotal: comparisonIndex >= 0 ? Number(allRows[comparisonIndex]?.total || 0) : null,
    };
  });
}

export interface BalanceInsight {
  kind: 'positive' | 'negative' | 'neutral';
  key: 'periodGrowth' | 'periodDecline' | 'periodGrowthAmount' | 'periodDeclineAmount' | 'liquidityShare' | 'largestDriver' | 'peak';
  value: number;
  assetKey?: string;
  month?: string | null;
}

export function generateBalanceInsights(rows: BalanceChartRow[]): BalanceInsight[] {
  if (rows.length === 0) return [];
  const kpis = calculateBalanceKpis(rows);
  const changes = buildBalanceChanges(rows);
  const latestChange = changes[changes.length - 1];
  const largestDriver = BALANCE_ASSET_KEYS.reduce<{key: string; value: number} | null>((best, key) => {
    const value = Number(latestChange?.[key] || 0);
    return best === null || Math.abs(value) > Math.abs(best.value) ? {key, value} : best;
  }, null);
  const hasPercentChange = kpis.percentChange !== null;
  const insights: BalanceInsight[] = [{
    kind: kpis.absoluteChange >= 0 ? 'positive' : 'negative',
    key: kpis.absoluteChange >= 0
      ? (hasPercentChange ? 'periodGrowth' : 'periodGrowthAmount')
      : (hasPercentChange ? 'periodDecline' : 'periodDeclineAmount'),
    value: Math.abs(hasPercentChange ? Number(kpis.percentChange) : kpis.absoluteChange),
  }];
  insights.push({kind: 'neutral', key: 'liquidityShare', value: kpis.liquidityPercent});
  if (largestDriver && largestDriver.value !== 0) {
    insights.push({
      kind: largestDriver.value >= 0 ? 'positive' : 'negative',
      key: 'largestDriver',
      value: largestDriver.value,
      assetKey: largestDriver.key,
    });
  }
  insights.push({kind: 'neutral', key: 'peak', value: kpis.peakValue, month: kpis.peakMonth});
  return insights;
}
