import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { PieChart } from 'recharts/lib/chart/PieChart';
import { Pie } from 'recharts/lib/polar/Pie';
import { Cell } from 'recharts/lib/component/Cell';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { RenderCustomizedLabel } from '../utils/customGraphsInfo';
import { getHoldingValue, getHoldingLabel, paletteColor, OTHER_SLICE_COLOR } from '../utils/holdingsChartHelpers';
import { getRandomGrayscaleColor } from '../utils/colorUtils';
import type { InvestmentHoldingDto, InvestmentAssetKey } from '../types/api';

interface HoldingsBreakdownChartProps {
  theme: any;
  holdings: InvestmentHoldingDto[];
  assetKey: InvestmentAssetKey | null;
  isHidden: boolean;
}

const Title = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${(p) => p.theme.textColor};
  text-align: center;
`;

const Description = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.82rem;
  opacity: 0.6;
  text-align: center;
  color: ${(p) => p.theme.textColor};
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1rem;
  max-height: 180px;
  overflow-y: auto;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: ${(p) => p.theme.textColor};

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pct {
    font-weight: 600;
    flex-shrink: 0;
  }

  .overweight {
    color: #e74c3c;
    font-size: 0.72rem;
    font-weight: 600;
    flex-shrink: 0;
  }
`;

const EmptyState = styled.p`
  text-align: center;
  opacity: 0.6;
  font-size: 0.85rem;
  color: ${(p) => p.theme.textColor};
  padding: 2rem 1rem;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${(p) => p.theme.textColor};
  opacity: 0.55;
  margin: 0.5rem 0 0.1rem 0;

  &:first-child { margin-top: 0; }
`;

const MAX_SLICES = 8;
/** A slice materially larger than an even split flags as an overweight rebalancing cue. */
const OVERWEIGHT_MULTIPLIER = 1.5;

/** Fixed, sensible display order for asset categories — stocks/etf/crypto/bonds/... in
 * roughly "how most people think about their portfolio" order, not alphabetical. */
const CATEGORY_ORDER: InvestmentAssetKey[] = ['stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities'];

export default function HoldingsBreakdownChart({ theme, holdings, assetKey, isHidden }: HoldingsBreakdownChartProps) {
  const { translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const t = translations.graphs.statsHoldings;

  const rows = useMemo(() => {
    const relevant = (assetKey ? holdings.filter((h) => h.assetKey === assetKey) : holdings)
      .map((h) => ({ id: h.id, label: getHoldingLabel(h), value: getHoldingValue(h), assetKey: h.assetKey }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);

    const top = relevant.slice(0, MAX_SLICES);
    const rest = relevant.slice(MAX_SLICES);
    const otherValue = rest.reduce((sum, r) => sum + r.value, 0);

    const withOther = otherValue > 0
      ? [...top, { id: 'other', label: translations.general.other, value: otherValue, isOther: true, assetKey: null as InvestmentAssetKey | null }]
      : top;

    // Only when viewing everything together: cluster slices by asset category
    // (fixed order, "other" always last) instead of pure value order — lets
    // the pie and legend show each category's total share directly (a thicker
    // border between groups, a subtotal per category), even though individual
    // positions still keep their own distinct color. A single category's own
    // view (assetKey set) has no categories to cluster, so it's left as-is.
    if (!assetKey) {
      return withOther.slice().sort((a, b) => {
        if (a.isOther) return 1;
        if (b.isOther) return -1;
        return CATEGORY_ORDER.indexOf(a.assetKey as InvestmentAssetKey) - CATEGORY_ORDER.indexOf(b.assetKey as InvestmentAssetKey);
      });
    }
    return withOther;
  }, [holdings, assetKey, translations.general.other]);

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const overweightThreshold = rows.length > 0 ? (100 / rows.length) * OVERWEIGHT_MULTIPLIER : Infinity;

  const categoryTotals = useMemo(() => {
    if (assetKey) return null;
    const totals = new Map<InvestmentAssetKey, number>();
    for (const row of rows) {
      if (row.isOther || !row.assetKey) continue;
      totals.set(row.assetKey, (totals.get(row.assetKey) ?? 0) + row.value);
    }
    return totals;
  }, [rows, assetKey]);

  // Always one distinct color per position (Tableau-10, same as "all
  // investments") — shading a single asset-class hue used to be the plan for
  // a filtered view, but with more than 2-3 positions the shades become too
  // close to tell apart (e.g. seven stocks all reading as "some red"),
  // exactly when distinguishing positions matters most.
  const colorFor = (row: (typeof rows)[number], index: number): string => {
    if (row.isOther) return theme.mode === 'dark' ? OTHER_SLICE_COLOR.dark : OTHER_SLICE_COLOR.light;
    return paletteColor(index);
  };

  const strokeColor = theme.mode === 'dark' ? '#1e1e2e' : '#ffffff';
  const groupBorderColor = theme.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.65)';

  if (rows.length === 0) {
    return (
      <>
        <Title theme={theme}>{t.breakdownTitle}</Title>
        <EmptyState theme={theme}>{t.noHoldingsDescription}</EmptyState>
      </>
    );
  }

  return (
    <>
      <Title theme={theme}>{t.breakdownTitle}</Title>
      <Description theme={theme}>{t.breakdownDescription}</Description>
      <ResponsiveContainer width="100%" height={isMobileScreen ? 200 : 280}>
        <PieChart>
          <Pie
            data={rows}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={RenderCustomizedLabel}
            outerRadius={isMobileScreen ? 80 : 110}
            dataKey="value"
          >
            {rows.map((row, index) => {
              const prevRow = rows[index - 1];
              const isGroupStart = !assetKey && index > 0 && prevRow?.assetKey !== row.assetKey;
              return (
                <Cell
                  key={row.id}
                  fill={isHidden ? getRandomGrayscaleColor() : colorFor(row, index)}
                  stroke={isGroupStart ? groupBorderColor : strokeColor}
                  strokeWidth={isGroupStart ? 3 : 1}
                />
              );
            })}
          </Pie>
          <Tooltip
            formatter={(value: number, _name: string, entry: any) => [
              isHidden ? '****' : `${formatAmount(value)} (${((value / total) * 100).toFixed(1)}%)`,
              isHidden ? '****' : entry?.payload?.label,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <Legend theme={theme}>
        {rows.map((row, index) => {
          const pct = (row.value / total) * 100;
          const prevRow = rows[index - 1];
          const isGroupStart = !assetKey && row.assetKey && prevRow?.assetKey !== row.assetKey;
          const categoryPct = isGroupStart && categoryTotals && row.assetKey
            ? (categoryTotals.get(row.assetKey)! / total) * 100
            : null;
          return (
            <React.Fragment key={row.id}>
              {categoryPct !== null && row.assetKey && (
                <CategoryHeader theme={theme}>
                  <span>{translations.assets[row.assetKey]}</span>
                  <span>{isHidden ? '****' : `${categoryPct.toFixed(1)}%`}</span>
                </CategoryHeader>
              )}
              <LegendItem theme={theme}>
                <span className="dot" style={{ backgroundColor: isHidden ? getRandomGrayscaleColor() : colorFor(row, index) }} />
                <span className="label">{isHidden ? '****' : row.label}</span>
                {!row.isOther && pct > overweightThreshold && (
                  <span className="overweight" title={t.overweightWarning}>⚠</span>
                )}
                <span className="pct">{isHidden ? '****' : `${pct.toFixed(1)}%`}</span>
              </LegendItem>
            </React.Fragment>
          );
        })}
      </Legend>
    </>
  );
}
