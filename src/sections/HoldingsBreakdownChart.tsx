import React, { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BarChart } from 'recharts/lib/chart/BarChart';
import { Bar } from 'recharts/lib/cartesian/Bar';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { YAxis } from 'recharts/lib/cartesian/YAxis';
import { CartesianGrid } from 'recharts/lib/cartesian/CartesianGrid';
import { Cell } from 'recharts/lib/component/Cell';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { compactNumber } from '../utils/customGraphsInfo';
import { getHoldingValue, getHoldingLabel, paletteColor, OTHER_SLICE_COLOR, ASSET_CATEGORY_ORDER } from '../utils/holdingsChartHelpers';
import { getRandomGrayscaleColor } from '../utils/colorUtils';
import HoldingAssetDetails from '../components/HoldingAssetDetails';
import { Eye, EyeOff, Info } from 'lucide-react';
import type { InvestmentDividendSummaryDto, InvestmentHoldingDto, InvestmentAssetKey } from '../types/api';

interface HoldingsBreakdownChartProps {
  theme: any;
  holdings: InvestmentHoldingDto[];
  assetKey: InvestmentAssetKey | null;
  isHidden: boolean;
  positionLimitPercent?: number | null;
  categoryLimitPercent?: number | null;
  dividends?: InvestmentDividendSummaryDto[];
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
  position: relative;
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
  summary::after { content: '›'; margin-left: auto; transition: transform 0.2s ease; color: ${(p) => p.theme.buttonBackgroundColor}; }
  &[open] summary::after { transform: rotate(90deg); }

  .category-items { display: flex; flex-direction: column; gap: 0.35rem; padding: 0.45rem 0.2rem 0.25rem; }
  .category-toggle { border: 0; background: transparent; color: ${(p) => p.theme.buttonBackgroundColor}; cursor: pointer; padding: .2rem; display: inline-flex; }
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
  button { border: 0; background: transparent; color: inherit; cursor: pointer; padding: 2px; display: inline-flex; }
  button.info { color: ${(p) => p.theme.buttonBackgroundColor}; margin-left: .15rem; padding-left: .45rem; border-left: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.16)' : 'rgba(15,23,42,.14)'}; }
  &.inactive { opacity: .4; text-decoration: line-through; }
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

export default function HoldingsBreakdownChart({ theme, holdings, assetKey, isHidden, positionLimitPercent, categoryLimitPercent, dividends = [] }: HoldingsBreakdownChartProps) {
  const { translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const t = translations.graphs.statsHoldings;
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [detailId, setDetailId] = useState<number | null>(null);

  const allRows = useMemo(() => {
    const relevant = (assetKey ? holdings.filter((h) => h.assetKey === assetKey) : holdings)
      .map((h) => ({ id: h.id, label: getHoldingLabel(h), value: getHoldingValue(h), assetKey: h.assetKey }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);

    return relevant;
  }, [holdings, assetKey]);

  const rows = useMemo(() => {
    const visibleRows = allRows.filter((row) => !hiddenIds.has(row.id));
    const top = visibleRows.slice(0, MAX_SLICES);
    const rest = visibleRows.slice(MAX_SLICES);
    const otherValue = rest.reduce((sum, r) => sum + r.value, 0);

    const withOther = otherValue > 0
      ? [...top, { id: 'other', label: translations.general.other, value: otherValue, isOther: true, assetKey: null as InvestmentAssetKey | null }]
      : top;

    return withOther;
  }, [allRows, translations.general.other, hiddenIds]);

  const portfolioTotal = allRows.reduce((sum, r) => sum + r.value, 0);
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const overweightThreshold = positionLimitPercent ?? (rows.length > 0 ? (100 / rows.length) * OVERWEIGHT_MULTIPLIER : Infinity);

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

  const renderLegendItem = (row: (typeof allRows)[number], index: number) => {
    const pct = portfolioTotal > 0 ? (row.value / portfolioTotal) * 100 : 0;
    const inactive = hiddenIds.has(row.id);
    return (
      <LegendItem key={row.id} theme={theme} className={inactive ? 'inactive' : ''}>
        <span className="dot" style={{ backgroundColor: isHidden ? getRandomGrayscaleColor() : paletteColor(index) }} />
        <button className="label" type="button" onClick={() => setHiddenIds((previous) => { const next = new Set(previous); if (next.has(row.id)) next.delete(row.id); else next.add(row.id); return next; })}>{isHidden ? '****' : row.label}</button>
        {pct > overweightThreshold && <span className="overweight" title={t.overweightWarning}>⚠</span>}
        <span className="pct">{isHidden ? '****' : `${pct.toFixed(1)}%`}</span>
        {!isHidden && <button className="info" type="button" aria-label={t.assetDetails} onClick={() => setDetailId(row.id)}><Info size={14} /></button>}
      </LegendItem>
    );
  };

  if (allRows.length === 0) {
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
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 6 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 5" stroke={theme.mode === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(15,23,42,.08)'}/>
            <XAxis type="number" tickFormatter={(value) => isHidden ? '••••' : compactNumber(value)} tick={{fill: theme.textColor, fontSize: 10}} axisLine={false} tickLine={false}/>
            <YAxis type="category" dataKey="label" width={92} tick={{fill: theme.textColor, fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(value) => isHidden ? '••••' : String(value)}/>
            <Tooltip formatter={(value: number) => [isHidden ? '••••' : `${formatAmount(value)} (${total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'}%)`, t.breakdownValue]}/>
            <Bar dataKey="value" radius={[0, 5, 5, 0]}>
              {rows.map((row, index) => <Cell key={row.id} onClick={() => typeof row.id === 'number' && setDetailId(row.id)} style={{cursor: typeof row.id === 'number' && !isHidden ? 'pointer' : 'default'}} fill={isHidden ? getRandomGrayscaleColor() : colorFor(row, index)}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {detailId != null && (() => {
          const holding = holdings.find((item) => item.id === detailId);
          if (!holding) return null;
          return <HoldingAssetDetails holding={holding} dividend={dividends.find((item) => item.instrumentId === holding.instrument?.id)} formatAmount={formatAmount} labels={t.assetDetailLabels} onClose={() => setDetailId(null)} />;
        })()}
      </ChartStage>
      <Legend theme={theme}>
        {assetKey
          ? allRows.map(renderLegendItem)
          : ASSET_CATEGORY_ORDER.map((category) => {
              const categoryRows = allRows.filter((row) => row.assetKey === category);
              if (categoryRows.length === 0) return null;
              const categoryPct = categoryTotals && portfolioTotal > 0 ? ((categoryTotals.get(category) ?? 0) / portfolioTotal) * 100 : 0;
              const categoryEnabled = categoryRows.some((row) => !hiddenIds.has(row.id));
              const toggleCategory = (event: React.MouseEvent) => {
                event.preventDefault();
                setHiddenIds((previous) => {
                  const next = new Set(previous);
                  categoryRows.forEach((row) => categoryEnabled ? next.add(row.id) : next.delete(row.id));
                  return next;
                });
              };
              return (
                <CategoryDetails key={category} theme={theme}>
                  <summary>
                    <button type="button" className="category-toggle" onClick={toggleCategory} aria-label={t.toggleCategory}>{categoryEnabled ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                    <CategoryHeader theme={theme}>
                      <span>{translations.assets[category]}</span>
                      <span className="category-meta">
                        <span className="count">{categoryRows.length}</span>
                        <span>{isHidden ? '****' : `${categoryPct.toFixed(1)}%${categoryLimitPercent != null && categoryPct > categoryLimitPercent ? ' ⚠' : ''}`}</span>
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
