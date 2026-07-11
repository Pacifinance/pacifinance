import React, { useContext, useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart } from 'recharts/lib/chart/LineChart';
import { Line } from 'recharts/lib/cartesian/Line';
import { BarChart } from 'recharts/lib/chart/BarChart';
import { Bar } from 'recharts/lib/cartesian/Bar';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { YAxis } from 'recharts/lib/cartesian/YAxis';
import { CartesianGrid } from 'recharts/lib/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { CustomTick, compactNumber } from '../utils/customGraphsInfo';
import { getHoldingValue, paletteColor } from '../utils/holdingsChartHelpers';
import type { InvestmentHoldingHistoryDto, InvestmentAssetKey } from '../types/api';

interface HoldingsHistoryChartProps {
  theme: any;
  history: InvestmentHoldingHistoryDto[];
  assetKey: InvestmentAssetKey | null;
  isHidden: boolean;
  type?: 'area' | 'bar';
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
  flex-wrap: wrap;
  gap: 0.5rem 0.9rem;
  margin-top: 1rem;
  justify-content: center;
`;

const LegendItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.78rem;
  color: ${(p) => p.theme.textColor};
  opacity: ${(p) => (p.$active ? 1 : 0.4)};
  text-decoration: ${(p) => (p.$active ? 'none' : 'line-through')};
  padding: 0;

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;

  h5 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    opacity: 0.85;
    color: ${(p) => p.theme.textColor};
  }

  p {
    font-size: 0.85rem;
    opacity: 0.6;
    margin: 0;
    color: ${(p) => p.theme.textColor};
  }
`;

const DEFAULT_VISIBLE_COUNT = 6;

export default function HoldingsHistoryChart({ theme, history, assetKey, isHidden, type = 'area' }: HoldingsHistoryChartProps) {
  const { translations } = useContext(LanguageContext);
  const { formatAmount, fromEUR } = useContext(CurrencyContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const t = translations.graphs.statsHoldings;

  const relevantHistory = useMemo(
    () => (assetKey ? history.filter((h) => h.assetKey === assetKey) : history),
    [history, assetKey],
  );

  const distinctMonths = useMemo(
    () => Array.from(new Set(relevantHistory.map((h) => h.userDate.slice(0, 7)))).sort(),
    [relevantHistory],
  );

  const byHolding = useMemo(() => {
    const map: Record<string, InvestmentHoldingHistoryDto[]> = {};
    for (const entry of relevantHistory) {
      if (entry.holdingId === null) continue;
      (map[entry.holdingId] ||= []).push(entry);
    }
    return map;
  }, [relevantHistory]);

  const rankedIds = useMemo(() => {
    const ids = Object.keys(byHolding);
    const latestValue = (id: string) => {
      const entries = byHolding[id];
      const latest = entries.reduce((a, b) => (a.userDate > b.userDate ? a : b));
      return getHoldingValue(latest);
    };
    return ids.sort((a, b) => latestValue(b) - latestValue(a));
  }, [byHolding]);

  const [lineVisibility, setLineVisibility] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setLineVisibility(Object.fromEntries(rankedIds.map((id, i) => [id, i < DEFAULT_VISIBLE_COUNT])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankedIds.join(',')]);

  const labelFor = (holdingId: string) => {
    const entry = byHolding[holdingId]?.[0];
    return entry?.symbol || entry?.name || `#${holdingId}`;
  };

  const rows = useMemo(() => distinctMonths.map((month) => {
    const row: Record<string, number | string | null> = { name: month };
    for (const holdingId of rankedIds) {
      const entry = byHolding[holdingId].find((e) => e.userDate.slice(0, 7) === month);
      row[holdingId] = entry ? fromEUR(getHoldingValue(entry)) : null;
    }
    return row;
  }), [distinctMonths, rankedIds, byHolding, fromEUR]);

  const handleLegendClick = (holdingId: string) => {
    setLineVisibility((prev) => ({ ...prev, [holdingId]: !prev[holdingId] }));
  };

  if (distinctMonths.length <= 1) {
    return (
      <>
        <Title theme={theme}>{t.historyTitle}</Title>
        <EmptyState theme={theme}>
          <h5>{t.sparseHistoryTitle}</h5>
          <p>{t.sparseHistoryDescription}</p>
        </EmptyState>
      </>
    );
  }

  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div style={{
        background: theme.mode === 'dark' ? '#1e293b' : '#ffffff',
        border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
        borderRadius: 8, padding: '0.6rem 0.8rem', fontSize: '0.78rem', color: theme.textColor,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{isHidden ? '****' : label}</div>
        {rankedIds.filter((id) => lineVisibility[id]).map((id) => {
          const entry = payload.find((p: any) => p.dataKey === id);
          if (!entry || entry.value === null || entry.value === undefined) return null;
          return (
            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ color: paletteColor(rankedIds.indexOf(id)) }}>{isHidden ? '****' : labelFor(id)}</span>
              <span>{isHidden ? '****' : formatAmount(entry.value, { minimumFractionDigits: 0 })}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const ChartComponent = type === 'bar' ? BarChart : LineChart;

  return (
    <>
      <Title theme={theme}>{t.historyTitle}</Title>
      <Description theme={theme}>{t.historyDescription}</Description>
      <ResponsiveContainer width="100%" height={isMobileScreen ? 220 : 320}>
        <ChartComponent data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
          <XAxis
            dataKey="name"
            tick={(props: any) => <CustomTick {...props} fill={theme.textColor} fontSize={11} />}
          />
          <YAxis
            tick={(props: any) => <CustomTick {...props} fill={theme.textColor} fontSize={11} />}
            tickFormatter={(v) => (isHidden ? '' : compactNumber(v))}
          />
          <Tooltip content={renderTooltip} />
          {rankedIds.map((id, index) => (
            lineVisibility[id] && (
              type === 'bar' ? (
                <Bar key={id} dataKey={id} name={labelFor(id)} fill={isHidden ? '#999' : paletteColor(index)} radius={[2, 2, 0, 0]} />
              ) : (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  name={labelFor(id)}
                  stroke={isHidden ? '#999' : paletteColor(index)}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
              )
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
      <Legend theme={theme}>
        {rankedIds.map((id, index) => (
          <LegendItem key={id} theme={theme} $active={lineVisibility[id]} onClick={() => handleLegendClick(id)} type="button">
            <span className="dot" style={{ backgroundColor: paletteColor(index) }} />
            {isHidden ? '****' : labelFor(id)}
          </LegendItem>
        ))}
      </Legend>
    </>
  );
}
