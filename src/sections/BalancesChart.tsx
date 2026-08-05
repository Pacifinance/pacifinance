import React, {useContext, useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';
import {AreaChart} from 'recharts/lib/chart/AreaChart';
import {BarChart} from 'recharts/lib/chart/BarChart';
import {Area} from 'recharts/lib/cartesian/Area';
import {Bar} from 'recharts/lib/cartesian/Bar';
import {Line} from 'recharts/lib/cartesian/Line';
import {ComposedChart} from 'recharts/lib/chart/ComposedChart';
import {CartesianGrid} from 'recharts/lib/cartesian/CartesianGrid';
import {ReferenceLine} from 'recharts/lib/cartesian/ReferenceLine';
import {XAxis} from 'recharts/lib/cartesian/XAxis';
import {YAxis} from 'recharts/lib/cartesian/YAxis';
import {Tooltip} from 'recharts/lib/component/Tooltip';
import {ResponsiveContainer} from 'recharts/lib/component/ResponsiveContainer';
import {CSVLink} from 'react-csv';
import {BsCalendarRange, BsFiletypeCsv} from 'react-icons/bs';
import {RiFileExcel2Line} from 'react-icons/ri';
import {BarChart3, Layers3, LineChart, Table2, TrendingDown, TrendingUp, WalletCards} from 'lucide-react';
import {LanguageContext} from '../contexts/LanguageContext';
import {CurrencyContext} from '../contexts/CurrencyContext';
import {UserContext} from '../contexts/UserContext';
import {MediaQueryContext} from '../contexts/MediaQueryContext';
import {downloadExcel} from '../utils/downloadData.jsx';
import {getAssetColor} from '../data/assetColors.js';
import {getBalanceChartData} from '../utils/userDataSelectors.js';
import {compactNumber} from '../utils/customGraphsInfo.jsx';
import {
  BALANCE_ASSET_GROUPS,
  BALANCE_ASSET_KEYS,
  buildBalanceChanges,
  buildPercentageComposition,
  buildPreviousPeriodComparison,
  calculateBalanceKpis,
  generateBalanceInsights,
  type BalanceChartRow,
} from '../utils/balanceChartAnalytics';

type ViewMode = 'trend' | 'composition' | 'changes' | 'table';
type CompositionUnit = 'value' | 'percent';

interface BalancesChartProps {
  theme: Record<string, string> & {mode: string};
  userData: Record<string, unknown> | null;
  isHidden: boolean;
}

const Explorer = styled.section`
  display: grid;
  gap: 1rem;
  color: ${({theme}) => theme.textColor};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.div`
  h2 { margin: 0; font-size: clamp(1.15rem, 2vw, 1.45rem); letter-spacing: -0.02em; }
  p { margin: 0.25rem 0 0; opacity: 0.62; font-size: 0.82rem; }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  @media (max-width: 760px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const Kpi = styled.div`
  padding: 0.85rem 0.95rem;
  border-radius: 12px;
  border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.1)' : 'rgba(15,23,42,.08)'};
  background: ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.045)' : 'rgba(248,250,252,.82)'};
  min-width: 0;
  span { display: block; opacity: 0.62; font-size: 0.72rem; margin-bottom: 0.3rem; }
  strong { display: block; font-size: clamp(1rem, 2vw, 1.3rem); overflow: hidden; text-overflow: ellipsis; }
  small { display: block; margin-top: 0.2rem; opacity: 0.65; font-size: 0.68rem; }
`;

const Toolbar = styled.div`
  display: grid;
  gap: 0.6rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: ${({theme}) => theme.mode === 'dark' ? 'rgba(0,0,0,.14)' : 'rgba(241,245,249,.72)'};
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
  flex-wrap: wrap;
`;

const Segments = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
`;

const Segment = styled.button<{$active?: boolean}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 34px;
  padding: 0.38rem 0.68rem;
  border-radius: 8px;
  border: 1px solid ${({theme, $active}) => $active ? theme.buttonBackgroundColor : theme.mode === 'dark' ? 'rgba(255,255,255,.13)' : 'rgba(15,23,42,.1)'};
  color: ${({theme, $active}) => $active ? '#fff' : theme.textColor};
  background: ${({theme, $active}) => $active ? theme.buttonBackgroundColor : 'transparent'};
  font-size: 0.75rem;
  font-weight: 650;
  cursor: pointer;
  svg { width: 15px; height: 15px; }
  &:focus-visible { outline: 2px solid ${({theme}) => theme.buttonBackgroundColor}; outline-offset: 2px; }
  @media (max-width: 520px) { padding: 0.36rem 0.52rem; span { display: none; } }
`;

const IconButton = styled.button`
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border-radius: 8px;
  border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.13)' : 'rgba(15,23,42,.1)'};
  color: ${({theme}) => theme.buttonBackgroundColor};
  background: transparent;
  cursor: pointer;
`;

const AssetFilters = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const AssetChip = styled.button<{$active: boolean; $color: string}>`
  border: 1px solid ${({$color, $active}) => $active ? $color : 'transparent'};
  background: ${({$color, $active}) => $active ? `${$color}20` : 'transparent'};
  color: ${({theme}) => theme.textColor};
  opacity: ${({$active}) => $active ? 1 : 0.48};
  border-radius: 999px;
  padding: 0.28rem 0.55rem;
  font-size: 0.68rem;
  cursor: pointer;
  &::before { content: ''; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${({$color}) => $color}; margin-right: 0.35rem; }
`;

const ChartStage = styled.div`
  height: 410px;
  min-width: 0;
  @media (max-width: 760px) { height: 315px; }
`;

const TooltipCard = styled.div`
  min-width: 220px;
  max-width: 290px;
  padding: 0.75rem;
  border-radius: 11px;
  border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.13)' : 'rgba(15,23,42,.1)'};
  background: ${({theme}) => theme.mode === 'dark' ? 'rgba(20,25,32,.96)' : 'rgba(255,255,255,.97)'};
  color: ${({theme}) => theme.textColor};
  box-shadow: 0 12px 32px rgba(0,0,0,.22);
  h4 { margin: 0 0 0.5rem; font-size: 0.82rem; }
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.15rem 0;
  font-size: 0.7rem;
  span:first-child { opacity: 0.76; }
  strong { white-space: nowrap; }
`;

const InsightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
  @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 520px) { grid-template-columns: 1fr; }
`;

const Insight = styled.div<{$kind: string}>`
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.7rem;
  border-radius: 10px;
  background: ${({$kind}) => $kind === 'positive' ? 'rgba(7,145,100,.1)' : $kind === 'negative' ? 'rgba(220,53,69,.1)' : 'rgba(99,102,241,.09)'};
  font-size: 0.72rem;
  line-height: 1.4;
  svg { width: 16px; flex: 0 0 16px; margin-top: 1px; }
`;

const DataTable = styled.div`
  overflow: auto;
  max-height: 430px;
  table { width: 100%; border-collapse: collapse; font-size: 0.73rem; }
  th { position: sticky; top: 0; z-index: 1; text-align: right; padding: 0.65rem; background: ${({theme}) => theme.mode === 'dark' ? '#292d32' : '#f8fafc'}; }
  th:first-child, td:first-child { text-align: left; position: sticky; left: 0; background: ${({theme}) => theme.mode === 'dark' ? '#292d32' : '#fff'}; }
  td { text-align: right; padding: 0.58rem 0.65rem; border-top: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.07)' : 'rgba(15,23,42,.07)'}; white-space: nowrap; }
`;

const RangeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  input { border-radius: 7px; border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.15)' : 'rgba(15,23,42,.12)'}; background: transparent; color: ${({theme}) => theme.textColor}; padding: 0.3rem; color-scheme: ${({theme}) => theme.mode}; }
`;

const MobileSheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  max-height: min(68vh, 520px);
  overflow: auto;
  padding: 0.8rem 1rem calc(1rem + env(safe-area-inset-bottom));
  border-radius: 18px 18px 0 0;
  border-top: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.14)' : 'rgba(15,23,42,.12)'};
  background: ${({theme}) => theme.mode === 'dark' ? '#20262d' : '#fff'};
  box-shadow: 0 -18px 50px rgba(0,0,0,.28);
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  button { border: 0; background: transparent; color: ${({theme}) => theme.textColor}; font-size: 1.35rem; cursor: pointer; }
`;

const PERIODS = ['3m', '6m', '1y', '2y', 'all'] as const;

function BalancesChart({theme, userData, isHidden}: BalancesChartProps) {
  const {translations, language} = useContext(LanguageContext);
  const {formatAmount, fromEUR} = useContext(CurrencyContext);
  const {fetchAllTimeBalances} = useContext(UserContext) || {};
  const media = useContext(MediaQueryContext);
  const isMobile = media?.isMobileScreen ?? false;
  const t = translations.graphs.balanceExplorer;
  const [allRows, setAllRows] = useState<BalanceChartRow[]>([]);
  const [period, setPeriod] = useState<string>('6m');
  const [view, setView] = useState<ViewMode>('trend');
  const [unit, setUnit] = useState<CompositionUnit>('value');
  const [compare, setCompare] = useState(false);
  const [showRange, setShowRange] = useState(false);
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [fullHistoryLoaded, setFullHistoryLoaded] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [enabledAssets, setEnabledAssets] = useState<Set<string>>(() => new Set(BALANCE_ASSET_KEYS));
  const [selectedMonth, setSelectedMonth] = useState<BalanceChartRow | null>(null);

  useEffect(() => {
    if (!userData) return;
    const months = Math.max(((userData as {balances?: unknown[]}).balances || []).length, 12);
    const source = getBalanceChartData(userData, months);
    setAllRows(source.map((monthData) => {
      const row: BalanceChartRow = {
        name: monthData.month,
        total: 0,
        bank: monthData.bankReal,
        cash: monthData.cashReal,
        digitalServices: monthData.digitalServicesReal,
        emergencyFund: monthData.emergencyFundReal || 0,
        stocks: monthData.stocksReal,
        etf: monthData.etfReal,
        bonds: monthData.bondsReal || 0,
        funds: monthData.fundsReal || 0,
        commodities: monthData.commoditiesReal || 0,
        bitcoin: monthData.bitcoinReal,
        crypto: monthData.cryptoReal,
      };
      row.total = BALANCE_ASSET_KEYS.reduce((sum, key) => sum + Number(row[key] || 0), 0);
      return row;
    }));
  }, [userData]);

  const ensureFullHistory = async () => {
    if (fullHistoryLoaded || !fetchAllTimeBalances) return;
    setLoadingHistory(true);
    try { await fetchAllTimeBalances(); setFullHistoryLoaded(true); }
    finally { setLoadingHistory(false); }
  };

  const selectPeriod = async (next: string) => {
    if (next === 'all') await ensureFullHistory();
    setPeriod(next);
  };

  const rows = useMemo(() => {
    if (period === 'custom') {
      const from = startMonth || allRows[0]?.name;
      const to = endMonth || allRows[allRows.length - 1]?.name;
      if (!from || !to) return allRows;
      const [min, max] = from <= to ? [from, to] : [to, from];
      return allRows.filter((row) => row.name >= min && row.name <= max);
    }
    const sizes: Record<string, number> = { '3m': 3, '6m': 6, '1y': 12, '2y': 24 };
    return sizes[period] ? allRows.slice(-sizes[period]) : allRows;
  }, [allRows, period, startMonth, endMonth]);

  const visibleAssets = useMemo(() => BALANCE_ASSET_KEYS.filter((key) => (
    enabledAssets.has(key) && rows.some((row) => Number(row[key] || 0) !== 0)
  )), [enabledAssets, rows]);
  const kpis = useMemo(() => calculateBalanceKpis(rows), [rows]);
  const insights = useMemo(() => generateBalanceInsights(rows), [rows]);
  const chartRows = useMemo(() => {
    if (view === 'changes') return buildBalanceChanges(rows);
    if (view === 'composition' && unit === 'percent') return buildPercentageComposition(rows);
    if (view === 'trend' && compare) return buildPreviousPeriodComparison(allRows, rows);
    return rows;
  }, [allRows, compare, rows, unit, view]);

  const locale = language === 'it' ? 'it-IT' : language;
  const monthLabel = (value: string) => {
    const date = new Date(`${value}-01T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale, {month: 'short', year: '2-digit'});
  };
  const displayMoney = (value: number) => isHidden ? '••••' : formatAmount(value);
  const displayPercent = (value: number | null) => isHidden ? '••••' : value === null ? t.notAvailable : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  const axisValue = (value: number) => unit === 'percent' && view === 'composition' ? `${Math.round(value)}%` : isHidden ? '••••' : compactNumber(Math.round(fromEUR(value)));
  const currentRow = rows[rows.length - 1];

  const toggleAsset = (key: string) => setEnabledAssets((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const toggleGroup = (keys: readonly string[]) => setEnabledAssets((current) => {
    const next = new Set(current);
    const allEnabled = keys.every((key) => next.has(key));
    keys.forEach((key) => allEnabled ? next.delete(key) : next.add(key));
    return next;
  });

  const tooltip = ({active, payload, label}: {active?: boolean; payload?: Array<{payload: BalanceChartRow}>; label?: string}) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    return <TooltipCard theme={theme}>
      <h4>{monthLabel(String(label))}</h4>
      <TooltipRow><span style={{color: theme.buttonBackgroundColor}}>{t.totalAssets}</span><strong style={{color: theme.buttonBackgroundColor}}>{displayMoney(Number(row.rawTotal ?? row.total ?? 0))}</strong></TooltipRow>
      {view === 'changes' && <TooltipRow><span style={{color: Number(row.total || 0) >= 0 ? '#10b981' : '#ef4444'}}>{t.monthlyChange}</span><strong style={{color: Number(row.total || 0) >= 0 ? '#10b981' : '#ef4444'}}>{displayMoney(Number(row.total || 0))}</strong></TooltipRow>}
      {view !== 'trend' && visibleAssets.map((key) => {
        const raw = Number(row[`raw_${key}`] ?? row[key] ?? 0);
        const assetColor = getAssetColor(key, theme.mode);
        return <TooltipRow key={key}><span style={{color: assetColor}}>{translations.assets[key]}</span><strong style={{color: assetColor}}>{unit === 'percent' && view === 'composition' ? `${Number(row[key] || 0).toFixed(1)}%` : displayMoney(raw)}</strong></TooltipRow>;
      })}
    </TooltipCard>;
  };

  const commonChart = {
    data: chartRows,
    margin: {top: 12, right: isMobile ? 4 : 18, bottom: isMobile ? 20 : 8, left: isMobile ? -18 : 4},
    onClick: (state: {activePayload?: Array<{payload: BalanceChartRow}>; activeLabel?: string}) => {
      const row = state?.activePayload?.[0]?.payload || chartRows.find((item) => item.name === state?.activeLabel);
      if (row) setSelectedMonth(row);
    },
  };
  const axes = <>
    <CartesianGrid vertical={false} strokeDasharray="3 5" stroke={theme.mode === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(15,23,42,.08)'} />
    <XAxis dataKey="name" tickFormatter={monthLabel} minTickGap={28} tick={{fill: theme.textColor, fontSize: isMobile ? 9 : 11}} axisLine={false} tickLine={false} />
    <YAxis tickFormatter={axisValue} tick={{fill: theme.textColor, fontSize: isMobile ? 9 : 11}} axisLine={false} tickLine={false} width={isMobile ? 48 : 64} domain={view === 'composition' && unit === 'percent' ? [0, 100] : ['auto', 'auto']} />
    <Tooltip content={tooltip} trigger={isMobile ? 'click' : 'hover'} cursor={{stroke: theme.buttonBackgroundColor, strokeOpacity: 0.45}} />
  </>;

  const renderChart = () => {
    if (view === 'trend') return <ComposedChart {...commonChart}>
      {axes}
      <Area type="linear" dataKey="total" fill={theme.buttonBackgroundColor} fillOpacity={0.1} stroke="none" />
      {compare && <Line type="linear" dataKey="comparisonTotal" stroke={theme.textColor} strokeOpacity={0.38} strokeDasharray="5 5" dot={false} connectNulls={false} />}
      <Line type="linear" dataKey="total" stroke={theme.buttonBackgroundColor} strokeWidth={3} dot={false} activeDot={{r: 5}} />
    </ComposedChart>;
    if (view === 'composition') return <AreaChart {...commonChart} stackOffset={unit === 'percent' ? 'none' : undefined}>
      {axes}
      {visibleAssets.map((key) => <Area key={key} type="linear" dataKey={key} stackId="composition" stroke={getAssetColor(key, theme.mode)} fill={getAssetColor(key, theme.mode)} fillOpacity={0.72} />)}
    </AreaChart>;
    return <BarChart {...commonChart}>
      {axes}
      <ReferenceLine y={0} stroke={theme.textColor} strokeOpacity={0.45} />
      {visibleAssets.length > 1
        ? visibleAssets.map((key) => <Bar key={key} dataKey={key} stackId="changes" fill={getAssetColor(key, theme.mode)} />)
        : <Bar dataKey={visibleAssets[0] || 'total'} fill={visibleAssets[0] ? getAssetColor(visibleAssets[0], theme.mode) : theme.buttonBackgroundColor} radius={[4, 4, 4, 4]} />}
    </BarChart>;
  };

  const headers = [
    {label: translations.general.month, key: 'name'},
    {label: t.totalAssets, key: 'total'},
    ...visibleAssets.map((key) => ({label: translations.assets[key], key})),
  ];

  const insightText = (insight: ReturnType<typeof generateBalanceInsights>[number]) => {
    if (insight.key === 'periodGrowth') return t.insightGrowth.replace('{value}', insight.value.toFixed(1));
    if (insight.key === 'periodDecline') return t.insightDecline.replace('{value}', insight.value.toFixed(1));
    if (insight.key === 'periodGrowthAmount') return t.insightGrowthAmount.replace('{value}', displayMoney(insight.value));
    if (insight.key === 'periodDeclineAmount') return t.insightDeclineAmount.replace('{value}', displayMoney(insight.value));
    if (insight.key === 'liquidityShare') return t.insightLiquidity.replace('{value}', insight.value.toFixed(1));
    if (insight.key === 'largestDriver') return t.insightDriver.replace('{asset}', translations.assets[insight.assetKey || 'bank']).replace('{value}', displayMoney(insight.value));
    return t.insightPeak.replace('{month}', monthLabel(insight.month || '')).replace('{value}', displayMoney(insight.value));
  };

  return <Explorer theme={theme}>
    <Header>
      <Title><h2>{t.title}</h2><p>{t.subtitle}</p></Title>
      <Segments>
        <CSVLink data={rows} headers={headers} filename="balance-history.csv" aria-label={t.exportCsv}><IconButton as="span" theme={theme}><BsFiletypeCsv /></IconButton></CSVLink>
        <IconButton theme={theme} onClick={() => downloadExcel(rows, headers, 'balance-history.xlsx')} aria-label={t.exportExcel}><RiFileExcel2Line /></IconButton>
      </Segments>
    </Header>

    <KpiGrid>
      <Kpi theme={theme}><span>{t.currentAssets}</span><strong>{displayMoney(kpis.currentTotal)}</strong><small>{currentRow ? monthLabel(currentRow.name) : t.notAvailable}</small></Kpi>
      <Kpi theme={theme}><span>{t.periodChange}</span><strong style={{color: kpis.absoluteChange >= 0 ? '#079164' : '#dc3545'}}>{displayMoney(kpis.absoluteChange)}</strong><small>{displayPercent(kpis.percentChange)}</small></Kpi>
      <Kpi theme={theme}><span>{t.availableLiquidity}</span><strong>{displayMoney(kpis.liquidityValue)}</strong><small>{kpis.liquidityPercent.toFixed(1)}%</small></Kpi>
      <Kpi theme={theme}><span>{t.investedAssets}</span><strong>{displayMoney(kpis.investedValue)}</strong><small>{kpis.investedPercent.toFixed(1)}%</small></Kpi>
    </KpiGrid>

    <Toolbar theme={theme}>
      <ToolbarRow>
        <Segments>
          <Segment theme={theme} $active={view === 'trend'} onClick={() => setView('trend')} aria-label={t.viewTrend}><LineChart/><span>{t.viewTrend}</span></Segment>
          <Segment theme={theme} $active={view === 'composition'} onClick={() => setView('composition')} aria-label={t.viewComposition}><Layers3/><span>{t.viewComposition}</span></Segment>
          <Segment theme={theme} $active={view === 'changes'} onClick={() => setView('changes')} aria-label={t.viewChanges}><BarChart3/><span>{t.viewChanges}</span></Segment>
          <Segment theme={theme} $active={view === 'table'} onClick={() => setView('table')} aria-label={t.viewTable}><Table2/><span>{t.viewTable}</span></Segment>
        </Segments>
        <Segments>
          {PERIODS.map((item) => <Segment key={item} theme={theme} $active={period === item} disabled={item === 'all' && loadingHistory} onClick={() => selectPeriod(item)}>{item === 'all' && loadingHistory ? '…' : t.periods[item]}</Segment>)}
          <Segment theme={theme} $active={period === 'custom'} onClick={() => setShowRange((value) => !value)} aria-label={t.customRange}><BsCalendarRange/></Segment>
        </Segments>
      </ToolbarRow>
      {(view === 'composition' || view === 'trend') && <ToolbarRow>
        {view === 'composition' ? <Segments>
          <Segment theme={theme} $active={unit === 'value'} onClick={() => setUnit('value')}>{t.value}</Segment>
          <Segment theme={theme} $active={unit === 'percent'} onClick={() => setUnit('percent')}>{t.percentage}</Segment>
        </Segments> : <Segment theme={theme} $active={compare} onClick={() => setCompare((value) => !value)}>{t.comparePrevious}</Segment>}
      </ToolbarRow>}
      {showRange && <RangeRow theme={theme}><span>{t.from}</span><input type="month" value={startMonth} min={allRows[0]?.name} max={allRows[allRows.length - 1]?.name} onChange={async (event) => {setStartMonth(event.target.value); setPeriod('custom'); await ensureFullHistory();}}/><span>{t.to}</span><input type="month" value={endMonth} min={allRows[0]?.name} max={allRows[allRows.length - 1]?.name} onChange={async (event) => {setEndMonth(event.target.value); setPeriod('custom'); await ensureFullHistory();}}/></RangeRow>}
      {view !== 'trend' && view !== 'table' && <>
        <ToolbarRow><strong style={{fontSize: '0.72rem'}}>{t.visibleAssets}</strong><Segments>
          {Object.entries(BALANCE_ASSET_GROUPS).map(([group, keys]) => <Segment key={group} theme={theme} $active={keys.some((key) => enabledAssets.has(key))} onClick={() => toggleGroup(keys)}>{t.groups[group]}</Segment>)}
        </Segments></ToolbarRow>
        <AssetFilters>{BALANCE_ASSET_KEYS.filter((key) => rows.some((row) => Number(row[key] || 0) !== 0)).map((key) => <AssetChip key={key} theme={theme} $active={enabledAssets.has(key)} $color={getAssetColor(key, theme.mode)} onClick={() => toggleAsset(key)}>{translations.assets[key]}</AssetChip>)}</AssetFilters>
      </>}
    </Toolbar>

    {view === 'table' ? <DataTable theme={theme}><table><thead><tr><th>{translations.general.month}</th><th>{t.totalAssets}</th>{visibleAssets.map((key) => <th key={key}>{translations.assets[key]}</th>)}</tr></thead><tbody>{[...rows].reverse().map((row) => <tr key={row.name}><td>{monthLabel(row.name)}</td><td><strong>{displayMoney(row.total)}</strong></td>{visibleAssets.map((key) => <td key={key}>{displayMoney(Number(row[key] || 0))}</td>)}</tr>)}</tbody></table></DataTable> : <ChartStage><ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer></ChartStage>}

    {isMobile && selectedMonth && <MobileSheet theme={theme} role="dialog" aria-label={t.monthDetails}><SheetHeader theme={theme}><strong>{monthLabel(selectedMonth.name)}</strong><button type="button" onClick={() => setSelectedMonth(null)} aria-label={t.closeDetails}>×</button></SheetHeader><TooltipRow><span style={{color: theme.buttonBackgroundColor}}>{t.totalAssets}</span><strong style={{color: theme.buttonBackgroundColor}}>{displayMoney(Number(selectedMonth.rawTotal ?? selectedMonth.total))}</strong></TooltipRow>{visibleAssets.map((key) => { const assetColor = getAssetColor(key, theme.mode); return <TooltipRow key={key}><span style={{color: assetColor}}>{translations.assets[key]}</span><strong style={{color: assetColor}}>{displayMoney(Number(selectedMonth[`raw_${key}`] ?? selectedMonth[key] ?? 0))}</strong></TooltipRow>; })}</MobileSheet>}

    <div><strong style={{display: 'block', fontSize: '0.78rem', marginBottom: '0.5rem'}}>{t.insightsTitle}</strong><InsightGrid>{insights.map((insight, index) => <Insight key={`${insight.key}-${index}`} $kind={insight.kind}>{insight.kind === 'positive' ? <TrendingUp/> : insight.kind === 'negative' ? <TrendingDown/> : <WalletCards/>}<span>{insightText(insight)}</span></Insight>)}</InsightGrid></div>
  </Explorer>;
}

export default React.memo(BalancesChart);
