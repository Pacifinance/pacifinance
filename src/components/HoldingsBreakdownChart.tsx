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

const MAX_SLICES = 8;
/** A slice materially larger than an even split flags as an overweight rebalancing cue. */
const OVERWEIGHT_MULTIPLIER = 1.5;

export default function HoldingsBreakdownChart({ theme, holdings, assetKey, isHidden }: HoldingsBreakdownChartProps) {
  const { translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const t = translations.graphs.statsHoldings;

  const rows = useMemo(() => {
    const relevant = (assetKey ? holdings.filter((h) => h.assetKey === assetKey) : holdings)
      .map((h) => ({ id: h.id, label: getHoldingLabel(h), value: getHoldingValue(h) }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);

    const top = relevant.slice(0, MAX_SLICES);
    const rest = relevant.slice(MAX_SLICES);
    const otherValue = rest.reduce((sum, r) => sum + r.value, 0);

    return otherValue > 0
      ? [...top, { id: 'other', label: translations.general.other, value: otherValue, isOther: true }]
      : top;
  }, [holdings, assetKey, translations.general.other]);

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const overweightThreshold = rows.length > 0 ? (100 / rows.length) * OVERWEIGHT_MULTIPLIER : Infinity;

  // Always one distinct color per position (Tableau-10, same as "all
  // investments") — shading a single asset-class hue used to be the plan for
  // a filtered view, but with more than 2-3 positions the shades become too
  // close to tell apart (e.g. seven stocks all reading as "some red"),
  // exactly when distinguishing positions matters most.
  const colorFor = (row: (typeof rows)[number], index: number): string => {
    if (row.isOther) return theme.mode === 'dark' ? OTHER_SLICE_COLOR.dark : OTHER_SLICE_COLOR.light;
    return paletteColor(index);
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
            {rows.map((row, index) => (
              <Cell key={row.id} fill={isHidden ? getRandomGrayscaleColor() : colorFor(row, index)} />
            ))}
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
          return (
            <LegendItem key={row.id} theme={theme}>
              <span className="dot" style={{ backgroundColor: isHidden ? getRandomGrayscaleColor() : colorFor(row, index) }} />
              <span className="label">{isHidden ? '****' : row.label}</span>
              {!row.isOther && pct > overweightThreshold && (
                <span className="overweight" title={t.overweightWarning}>⚠</span>
              )}
              <span className="pct">{isHidden ? '****' : `${pct.toFixed(1)}%`}</span>
            </LegendItem>
          );
        })}
      </Legend>
    </>
  );
}
