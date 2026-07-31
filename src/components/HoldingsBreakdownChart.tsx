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
import { getHoldingValue, getHoldingLabel, paletteColor, OTHER_SLICE_COLOR, ASSET_CATEGORY_ORDER } from '../utils/holdingsChartHelpers';
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
  max-height: 240px;
  overflow-y: auto;
`;

const ChartStage = styled.div`
  width: 100%;
  height: 380px;
  @media (max-width: 768px) { height: 240px; }
`;

const CategoryDetails = styled.details`
  border-top: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'};
  padding: 0.35rem 0;

  summary {
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: '›'; margin-left: auto; transition: transform 0.2s ease; }
  &[open] summary::after { transform: rotate(90deg); }

  .category-items { display: flex; flex-direction: column; gap: 0.35rem; padding: 0.45rem 0.2rem 0.25rem; }
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
  margin: 0.15rem 0;

  &:first-child { margin-top: 0; }
  .category-meta { display: flex; gap: 0.65rem; }
  .count { opacity: 0.65; font-weight: 500; text-transform: none; }
`;

const MAX_SLICES = 8;
/** A slice materially larger than an even split flags as an overweight rebalancing cue. */
const OVERWEIGHT_MULTIPLIER = 1.5;

export default function HoldingsBreakdownChart({ theme, holdings, assetKey, isHidden }: HoldingsBreakdownChartProps) {
  const { translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const t = translations.graphs.statsHoldings;

  const allRows = useMemo(() => {
    const relevant = (assetKey ? holdings.filter((h) => h.assetKey === assetKey) : holdings)
      .map((h) => ({ id: h.id, label: getHoldingLabel(h), value: getHoldingValue(h), assetKey: h.assetKey }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);

    return relevant;
  }, [holdings, assetKey]);

  const rows = useMemo(() => {
    const top = allRows.slice(0, MAX_SLICES);
    const rest = allRows.slice(MAX_SLICES);
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
        return ASSET_CATEGORY_ORDER.indexOf(a.assetKey as InvestmentAssetKey) - ASSET_CATEGORY_ORDER.indexOf(b.assetKey as InvestmentAssetKey);
      });
    }
    return withOther;
  }, [allRows, assetKey, translations.general.other]);

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const overweightThreshold = rows.length > 0 ? (100 / rows.length) * OVERWEIGHT_MULTIPLIER : Infinity;

  const categoryTotals = useMemo(() => {
    if (assetKey) return null;
    const totals = new Map<InvestmentAssetKey, number>();
    for (const row of allRows) {
      totals.set(row.assetKey, (totals.get(row.assetKey) ?? 0) + row.value);
    }
    return totals;
  }, [allRows, assetKey]);

  // Always one distinct color per position (Tableau-10, same as "all
  // investments") — shading a single asset-class hue used to be the plan for
  // a filtered view, but with more than 2-3 positions the shades become too
  // close to tell apart (e.g. seven stocks all reading as "some red"),
  // exactly when distinguishing positions matters most.
  const colorFor = (row: (typeof rows)[number], index: number): string => {
    if (row.isOther) return theme.mode === 'dark' ? OTHER_SLICE_COLOR.dark : OTHER_SLICE_COLOR.light;
    const originalIndex = allRows.findIndex((candidate) => candidate.id === row.id);
    return paletteColor(originalIndex >= 0 ? originalIndex : index);
  };

  const strokeColor = theme.mode === 'dark' ? '#1e1e2e' : '#ffffff';
  const groupBorderColor = theme.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.65)';

  const renderLegendItem = (row: (typeof allRows)[number], index: number) => {
    const pct = (row.value / total) * 100;
    return (
      <LegendItem key={row.id} theme={theme}>
        <span className="dot" style={{ backgroundColor: isHidden ? getRandomGrayscaleColor() : paletteColor(index) }} />
        <span className="label">{isHidden ? '****' : row.label}</span>
        {pct > overweightThreshold && <span className="overweight" title={t.overweightWarning}>⚠</span>}
        <span className="pct">{isHidden ? '****' : `${pct.toFixed(1)}%`}</span>
      </LegendItem>
    );
  };

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
      <ChartStage>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
          <Pie
            data={rows}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={RenderCustomizedLabel}
            outerRadius={isMobileScreen ? 88 : 155}
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
      </ChartStage>
      <Legend theme={theme}>
        {assetKey
          ? allRows.map(renderLegendItem)
          : ASSET_CATEGORY_ORDER.map((category) => {
              const categoryRows = allRows.filter((row) => row.assetKey === category);
              if (categoryRows.length === 0) return null;
              const categoryPct = categoryTotals ? ((categoryTotals.get(category) ?? 0) / total) * 100 : 0;
              return (
                <CategoryDetails key={category} theme={theme}>
                  <summary>
                    <CategoryHeader theme={theme}>
                      <span>{translations.assets[category]}</span>
                      <span className="category-meta">
                        <span className="count">{categoryRows.length}</span>
                        <span>{isHidden ? '****' : `${categoryPct.toFixed(1)}%`}</span>
                      </span>
                    </CategoryHeader>
                  </summary>
                  <div className="category-items">
                    {categoryRows.map((row) => renderLegendItem(row, allRows.indexOf(row)))}
                  </div>
                </CategoryDetails>
              );
            })}
      </Legend>
    </>
  );
}
