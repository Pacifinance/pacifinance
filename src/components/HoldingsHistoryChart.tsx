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
import { getHoldingValue, paletteColor, ASSET_CATEGORY_ORDER } from '../utils/holdingsChartHelpers';
import { Eye, EyeOff, Info, ShieldCheck, Users } from 'lucide-react';
import HoldingAssetDetails from './HoldingAssetDetails';
import type { InvestmentDividendSummaryDto, InvestmentHoldingDto, InvestmentHoldingHistoryDto, InvestmentAssetKey } from '../types/api';

interface HoldingsHistoryChartProps {
  theme: any;
  history: InvestmentHoldingHistoryDto[];
  assetKey: InvestmentAssetKey | null;
  isHidden: boolean;
  type?: 'area' | 'bar';
  onContribute?: () => void;
  holdings?: InvestmentHoldingDto[];
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

const PriceTrustCard = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.7rem;
  align-items: center;
  margin: 0 0 1rem;
  padding: 0.75rem;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.24)' : 'rgba(5,150,105,0.2)')};
  border-radius: 12px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.045)')};
  color: ${(p) => p.theme.textColor};

  .copy { min-width: 0; }
  strong { display: block; font-size: 0.78rem; margin-bottom: 0.15rem; }
  p { margin: 0; font-size: 0.7rem; line-height: 1.4; opacity: 0.72; }
  button {
    border: none;
    border-radius: 8px;
    padding: 0.45rem 0.65rem;
    background: ${(p) => p.theme.buttonBackgroundColor};
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
  }

  @media (max-width: 520px) {
    grid-template-columns: auto 1fr;
    button { grid-column: 1 / -1; width: 100%; }
  }
`;

const TrustLegend = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin: 0.45rem 0 0;
  color: ${(p) => p.theme.textColor};
  font-size: 0.68rem;
  opacity: 0.78;

  span { display: inline-flex; align-items: center; gap: 0.35rem; }
  i { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  i.verified { background: #10b981; }
  i.unverified { background: transparent; border: 2px solid #94a3b8; }
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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

const ChartArea = styled.div`position: relative;`;

const CategoryDetails = styled.details`
  border-top: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'};
  padding: .35rem 0;
  summary { display: flex; align-items: center; cursor: pointer; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: '›'; margin-left: auto; transition: transform .2s; color: ${(p) => p.theme.buttonBackgroundColor}; }
  &[open] summary::after { transform: rotate(90deg); }
  .items { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem .9rem; padding: .5rem; }
  .toggle { border: 0; background: transparent; color: ${(p) => p.theme.buttonBackgroundColor}; cursor: pointer; margin-right: .35rem; display: inline-flex; }
`;

const AssetLegendControl = styled.div`
  display: inline-flex; align-items: center; gap: .2rem;
  padding: .15rem .45rem;
  border-right: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.14)' : 'rgba(15,23,42,.12)'};
  &:last-child { border-right: 0; }
  .info { border: 0; background: transparent; color: ${(p) => p.theme.buttonBackgroundColor}; cursor: pointer; padding: .15rem; display: inline-flex; border-radius: 50%; }
  .info:hover { background: ${(p) => p.theme.buttonBackgroundColor}18; }
`;

const ClosedTag = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding: 0.05rem 0.35rem;
  border-radius: 20px;
  background: rgba(148, 163, 184, 0.18);
  color: ${(p) => p.theme.textColor};
  opacity: 0.75;
`;

const CategoryHeader = styled.div`
  flex-basis: 100%;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${(p) => p.theme.textColor};
  opacity: 0.5;
  text-align: center;
  margin-top: 0.3rem;

  &:first-child { margin-top: 0; }
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

export default function HoldingsHistoryChart({ theme, history, assetKey, isHidden, type = 'area', onContribute, holdings = [], dividends = [] }: HoldingsHistoryChartProps) {
  const { translations } = useContext(LanguageContext);
  const { formatAmount, fromEUR } = useContext(CurrencyContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const t = translations.graphs.statsHoldings;
  const [detailHoldingId, setDetailHoldingId] = useState<number | null>(null);

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

  // Only the legend's visual layout groups by category when viewing everything
  // together (fixed order, "other"-less here since every holding has a real
  // category) — the chart lines/colors and the default-visible top N stay
  // ranked purely by value, so switching category filters doesn't reshuffle
  // which lines are shown, only how the legend clusters them.
  const legendOrder = useMemo(() => {
    if (assetKey) return rankedIds;
    return rankedIds.slice().sort((a, b) => {
      const catA = byHolding[a]?.[0]?.assetKey as InvestmentAssetKey | undefined;
      const catB = byHolding[b]?.[0]?.assetKey as InvestmentAssetKey | undefined;
      return ASSET_CATEGORY_ORDER.indexOf(catA as InvestmentAssetKey) - ASSET_CATEGORY_ORDER.indexOf(catB as InvestmentAssetKey);
    });
  }, [rankedIds, byHolding, assetKey]);

  const [lineVisibility, setLineVisibility] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setLineVisibility(Object.fromEntries(rankedIds.map((id, i) => [id, i < DEFAULT_VISIBLE_COUNT])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankedIds.join(',')]);

  const labelFor = (holdingId: string) => {
    const entry = byHolding[holdingId]?.[0];
    return entry?.symbol || entry?.name || `#${holdingId}`;
  };

  // A holding whose most recent recorded month has quantity 0 was fully sold
  // (see InvestmentImportWizard's handleCloseHolding) - it's excluded from
  // the current breakdown/totals since it's no longer active, but its past
  // trajectory (backfilled the same way an open position's is) is still real
  // history worth showing when the user chooses to look at it. Distinguished
  // in the legend so "unchecked because it ranked low" (still held) and
  // "unchecked because it's closed" aren't visually identical.
  const isClosed = (holdingId: string) => {
    const entries = byHolding[holdingId];
    if (!entries || entries.length === 0) return false;
    const latest = entries.reduce((a, b) => (a.userDate > b.userDate ? a : b));
    return latest.quantity === 0;
  };

  const rows = useMemo(() => distinctMonths.map((month) => {
    const row: Record<string, number | string | null> = { name: month };
    for (const holdingId of rankedIds) {
      const entry = byHolding[holdingId].find((e) => e.userDate.slice(0, 7) === month);
      row[holdingId] = entry ? fromEUR(getHoldingValue(entry)) : null;
      row[`${holdingId}Source`] = entry?.priceSource ?? null;
    }
    return row;
  }), [distinctMonths, rankedIds, byHolding, fromEUR]);

  const handleLegendClick = (holdingId: string) => {
    setLineVisibility((prev) => ({ ...prev, [holdingId]: !prev[holdingId] }));
  };

  const toggleCategory = (categoryIds: string[]) => {
    const shouldHide = categoryIds.some((id) => lineVisibility[id]);
    setLineVisibility((previous) => ({ ...previous, ...Object.fromEntries(categoryIds.map((id) => [id, !shouldHide])) }));
  };

  const trustCard = (
    <PriceTrustCard theme={theme}>
      <Users size={19} color={theme.buttonBackgroundColor} />
      <div className="copy">
        <strong>{t.communityDataTitle}</strong>
        <p>{t.communityDataDescription}</p>
      </div>
      {onContribute && <button type="button" onClick={onContribute} data-umami-event="holdings-history-contribute-price">{t.communityDataAction}</button>}
    </PriceTrustCard>
  );

  if (distinctMonths.length <= 1) {
    return (
      <>
        <Title theme={theme}>{t.historyTitle}</Title>
        {trustCard}
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
          const source = entry.payload?.[`${id}Source`];
          const verified = source === 'provider' || source === 'community';
          return (
            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ color: paletteColor(rankedIds.indexOf(id)) }}>{isHidden ? '****' : labelFor(id)}</span>
              <span>{isHidden ? '****' : `${formatAmount(entry.value, { minimumFractionDigits: 0 })} · ${verified ? t.verifiedShort : t.unverifiedShort}`}</span>
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
      {trustCard}
      <ChartArea>
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
                  dot={(props: { cx?: number; cy?: number; payload?: Record<string, number | string | null> }) => {
                    if (props.cx == null || props.cy == null) return <></>;
                    const source = props.payload?.[`${id}Source`];
                    const verified = source === 'provider' || source === 'community';
                    return <circle cx={props.cx} cy={props.cy} r={verified ? 4 : 3.5} fill={verified ? '#10b981' : theme.backgroundColor} stroke={verified ? '#10b981' : '#94a3b8'} strokeWidth={verified ? 1 : 2} />;
                  }}
                  connectNulls={false}
                />
              )
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
      {detailHoldingId != null && (() => {
        const holding = holdings.find((item) => item.id === detailHoldingId);
        if (!holding) return null;
        return <HoldingAssetDetails holding={holding} dividend={dividends.find((item) => item.instrumentId === holding.instrument?.id)} formatAmount={formatAmount} labels={t.assetDetailLabels} onClose={() => setDetailHoldingId(null)} />;
      })()}
      </ChartArea>
      <TrustLegend theme={theme}>
        <span><i className="verified" /><ShieldCheck size={12} />{t.verifiedPoint}</span>
        <span><i className="unverified" /><Info size={12} />{t.unverifiedPoint}</span>
      </TrustLegend>
      <Legend theme={theme}>
        {(assetKey ? [assetKey] : ASSET_CATEGORY_ORDER).map((category) => {
          const categoryIds = legendOrder.filter((id) => byHolding[id]?.[0]?.assetKey === category);
          if (categoryIds.length === 0) return null;
          const enabled = categoryIds.some((id) => lineVisibility[id]);
          return <CategoryDetails key={category} theme={theme} open={Boolean(assetKey)}>
            <summary>
              <button type="button" className="toggle" onClick={(event) => { event.preventDefault(); toggleCategory(categoryIds); }} aria-label={t.toggleCategory}>{enabled ? <Eye size={16} /> : <EyeOff size={16} />}</button>
              <CategoryHeader theme={theme}>{translations.assets[category]} · {categoryIds.length}</CategoryHeader>
            </summary>
            <div className="items">{categoryIds.map((id) => (
              <AssetLegendControl key={id} theme={theme}>
                <LegendItem theme={theme} $active={lineVisibility[id]} onClick={() => handleLegendClick(id)} type="button">
                  <span className="dot" style={{ backgroundColor: paletteColor(rankedIds.indexOf(id)) }} />
                  {isHidden ? '****' : labelFor(id)}
                  {!isHidden && isClosed(id) && <ClosedTag>{t.closedTag || 'closed'}</ClosedTag>}
                </LegendItem>
                {!isHidden && <button type="button" className="info" aria-label={t.assetDetails} onClick={() => setDetailHoldingId(Number(id))}><Info size={13} /></button>}
              </AssetLegendControl>
            ))}</div>
          </CategoryDetails>;
        })}
      </Legend>
    </>
  );
}
