import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import styled from 'styled-components';
import {BarChart} from 'recharts/lib/chart/BarChart';
import {ComposedChart} from 'recharts/lib/chart/ComposedChart';
import {Bar} from 'recharts/lib/cartesian/Bar';
import {Line} from 'recharts/lib/cartesian/Line';
import {CartesianGrid} from 'recharts/lib/cartesian/CartesianGrid';
import {ReferenceLine} from 'recharts/lib/cartesian/ReferenceLine';
import {XAxis} from 'recharts/lib/cartesian/XAxis';
import {YAxis} from 'recharts/lib/cartesian/YAxis';
import {Tooltip} from 'recharts/lib/component/Tooltip';
import {ResponsiveContainer} from 'recharts/lib/component/ResponsiveContainer';
import {Cell} from 'recharts/lib/component/Cell';
import {CSVLink} from 'react-csv';
import {BarChart3, CalendarRange, Columns3, LineChart, Table2, TrendingDown, TrendingUp, WalletCards, X} from 'lucide-react';
import {BsFiletypeCsv} from 'react-icons/bs';
import {RiFileExcel2Line} from 'react-icons/ri';
import {LanguageContext} from '../contexts/LanguageContext';
import {CurrencyContext} from '../contexts/CurrencyContext';
import {UserContext} from '../contexts/UserContext';
import {assetColors} from '../data/assetColors';
import {getCategoryColor} from '../data/categoryColors';
import {resolveTagKeyFromLocalized, translateTag} from '../data/tagTranslations';
import {
  getCategoryBreakdownForEntries,
  getEntriesForMonthKey,
  getIncomesArray,
  getMonthlyTotalsAllTime,
  getOutflowsArray,
  indexToMonthKey,
} from '../utils/userDataSelectors';
import {compactNumber} from '../utils/customGraphsInfo.jsx';
import {downloadExcel} from '../utils/downloadData.jsx';
import {
  buildIncomeOutflowComparison,
  calculateIncomeOutflowKpis,
  normalizeIncomeOutflowRows,
  rankCategoryBreakdown,
  type IncomeOutflowChartRow,
  type IncomeOutflowInputRow,
} from '../utils/incomeOutflowChartAnalytics';
import MonthComparisonModal from './MonthComparisonModal.jsx';

interface InOutChartProps {
  theme: {mode: string; textColor: string; buttonBackgroundColor: string};
  userData: Record<string, unknown> | null | undefined;
  isHidden: boolean;
}

type ViewMode = 'trend' | 'net' | 'categories' | 'table';
type FlowMode = 'outflows' | 'incomes';

const Explorer = styled.section`
  display: grid; gap: 1rem; width: 100%; color: ${(p) => p.theme.textColor};
`;
const Header = styled.div`
  display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; flex-wrap: wrap;
  h2 { margin: 0 0 .25rem; font-size: 1.08rem; }
  p { margin: 0; opacity: .68; font-size: .82rem; }
`;
const KpiGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .65rem;
  @media (max-width: 760px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;
const Kpi = styled.div`
  border: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.1)' : 'rgba(15,23,42,.09)'};
  border-radius: 12px; padding: .72rem; min-width: 0;
  background: ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.035)' : 'rgba(248,250,252,.8)'};
  span, small { display: block; opacity: .65; font-size: .69rem; }
  strong { display: block; margin: .22rem 0; font-size: clamp(.92rem, 2vw, 1.2rem); overflow: hidden; text-overflow: ellipsis; }
`;
const Toolbar = styled.div`
  display: grid; gap: .55rem; padding: .65rem; border-radius: 12px;
  background: ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.04)' : 'rgba(15,23,42,.035)'};
`;
const ToolbarRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; gap: .55rem; flex-wrap: wrap;
`;
const Segments = styled.div`
  display: flex; gap: .3rem; flex-wrap: wrap; align-items: center;
`;
const Segment = styled.button<{$active?: boolean}>`
  display: inline-flex; align-items: center; justify-content: center; gap: .32rem; min-height: 34px;
  border: 1px solid ${(p) => p.$active ? p.theme.buttonBackgroundColor : p.theme.mode === 'dark' ? 'rgba(255,255,255,.14)' : 'rgba(15,23,42,.12)'};
  border-radius: 8px; padding: .4rem .62rem; cursor: pointer; font-size: .72rem; font-weight: 700;
  background: ${(p) => p.$active ? p.theme.buttonBackgroundColor : 'transparent'};
  color: ${(p) => p.$active ? '#fff' : p.theme.textColor};
  svg { width: 15px; height: 15px; }
  &:disabled { opacity: .55; cursor: wait; }
  @media (max-width: 520px) { min-width: 36px; padding: .38rem .48rem; span { display: none; } }
`;
const IconButton = styled.button`
  width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.14)' : 'rgba(15,23,42,.12)'};
  border-radius: 8px; background: transparent; color: ${(p) => p.theme.buttonBackgroundColor}; cursor: pointer;
`;
const RangeRow = styled.div`
  display: flex; justify-content: center; align-items: center; gap: .4rem; flex-wrap: wrap; font-size: .72rem;
  input { min-height: 34px; border-radius: 7px; border: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.15)' : 'rgba(15,23,42,.13)'}; background: transparent; color: ${(p) => p.theme.textColor}; padding: .25rem .4rem; color-scheme: ${(p) => p.theme.mode}; }
`;
const ChartStage = styled.div`
  width: 100%; height: 360px;
  @media (max-width: 760px) { height: 300px; }
`;
const DataTable = styled.div`
  overflow: auto; max-height: 430px; border-radius: 10px;
  table { width: 100%; border-collapse: collapse; min-width: 560px; font-size: .76rem; }
  th { position: sticky; top: 0; z-index: 1; background: ${(p) => p.theme.mode === 'dark' ? '#303030' : '#fff'}; }
  th, td { padding: .58rem; text-align: right; border-bottom: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.07)' : 'rgba(15,23,42,.07)'}; }
  th:first-child, td:first-child { text-align: left; position: sticky; left: 0; background: ${(p) => p.theme.mode === 'dark' ? '#303030' : '#fff'}; }
`;
const InsightGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;
const Insight = styled.div<{$tone: 'positive' | 'negative' | 'neutral'}>`
  display: flex; align-items: flex-start; gap: .5rem; border-radius: 10px; padding: .65rem; font-size: .74rem;
  background: ${(p) => p.$tone === 'positive' ? 'rgba(16,185,129,.1)' : p.$tone === 'negative' ? 'rgba(239,68,68,.1)' : 'rgba(59,130,246,.1)'};
  svg { width: 16px; flex: 0 0 auto; }
`;
const TooltipCard = styled.div`
  min-width: 180px; border-radius: 10px; padding: .65rem; color: ${(p) => p.theme.textColor}; background: ${(p) => p.theme.mode === 'dark' ? 'rgba(24,30,38,.97)' : 'rgba(255,255,255,.97)'}; border: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.12)' : 'rgba(15,23,42,.1)'}; box-shadow: 0 8px 28px rgba(0,0,0,.22);
  h4 { margin: 0 0 .4rem; }
  div { display: flex; justify-content: space-between; gap: 1rem; font-size: .74rem; margin-top: .25rem; }
`;
const MobileSheet = styled.div`
  position: fixed; z-index: 1200; left: .75rem; right: .75rem; bottom: .75rem; border-radius: 16px; padding: 1rem;
  background: ${(p) => p.theme.mode === 'dark' ? '#252525' : '#fff'}; color: ${(p) => p.theme.textColor}; box-shadow: 0 14px 45px rgba(0,0,0,.35);
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; }
  button { border: 0; background: transparent; color: inherit; }
  div { display: flex; justify-content: space-between; gap: 1rem; padding: .28rem 0; font-size: .82rem; }
`;

const PERIODS = ['3m', '6m', '1y', '2y', 'all'] as const;

function InOutChart({theme, userData, isHidden}: InOutChartProps) {
  const {language, translations} = useContext(LanguageContext);
  const {formatAmount, fromEUR} = useContext(CurrencyContext);
  const {fetchAllTimeMonthlyTotals, fetchMonthDetail} = useContext(UserContext) || {};
  const t = translations.graphs.statsOutflows.explorer;
  const hostRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [view, setView] = useState<ViewMode>('trend');
  const [period, setPeriod] = useState<string>('6m');
  const [showRange, setShowRange] = useState(false);
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [fullHistoryLoaded, setFullHistoryLoaded] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [compare, setCompare] = useState(false);
  const [selectedRow, setSelectedRow] = useState<IncomeOutflowChartRow | null>(null);
  const [flow, setFlow] = useState<FlowMode>('outflows');
  const [categoryMonth, setCategoryMonth] = useState(indexToMonthKey(0));
  const [categoryLimit, setCategoryLimit] = useState(5);
  const [categoryUnit, setCategoryUnit] = useState<'value' | 'percent'>('value');
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    if (!hostRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setIsMobile(entry.contentRect.width < 560));
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, []);

  const recentRows = useMemo(() => {
    const incomes = getIncomesArray(userData) || [];
    const outflows = getOutflowsArray(userData) || [];
    const raw: IncomeOutflowInputRow[] = [];
    const now = new Date();
    for (let offset = 11; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      raw.push({
        name: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        incomes: Number(incomes[offset] || 0),
        outflows: Number(outflows[offset] || 0),
      });
    }
    return normalizeIncomeOutflowRows(raw);
  }, [userData]);

  const allRows = useMemo(() => {
    const totals = getMonthlyTotalsAllTime(userData) || [];
    if (totals.length === 0) return recentRows;
    return normalizeIncomeOutflowRows([...totals]
      .sort((a, b) => a.monthStart.localeCompare(b.monthStart))
      .map((row) => ({name: row.monthStart.slice(0, 7), incomes: row.totalIncomes, outflows: row.totalOutflows})));
  }, [recentRows, userData]);

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
  }, [allRows, endMonth, period, startMonth]);

  const kpis = useMemo(() => calculateIncomeOutflowKpis(rows), [rows]);
  const comparisonRows = useMemo(() => buildIncomeOutflowComparison(allRows, rows), [allRows, rows]);
  const previousKpis = useMemo(() => {
    const first = allRows.findIndex((row) => row.name === rows[0]?.name);
    return calculateIncomeOutflowKpis(first >= rows.length ? allRows.slice(first - rows.length, first) : []);
  }, [allRows, rows]);

  useEffect(() => {
    if (view !== 'categories' || !fetchMonthDetail) return;
    const entries = getEntriesForMonthKey(userData, categoryMonth, flow);
    if (entries !== null) return;
    const [year, month] = categoryMonth.split('-').map(Number);
    setLoadingMonth(true);
    fetchMonthDetail(year, month).finally(() => setLoadingMonth(false));
  }, [categoryMonth, fetchMonthDetail, flow, userData, view]);

  const categoryRows = useMemo(() => {
    const categoryType = flow === 'incomes' ? 'income' : 'expense';
    const entries = getEntriesForMonthKey(userData, categoryMonth, flow);
    const breakdown = entries ? getCategoryBreakdownForEntries(entries, categoryType) : null;
    const amounts: Record<string, number> = {};
    Object.entries(breakdown || {}).forEach(([key, value]) => { amounts[key] = Number(value?.amount || 0); });
    return rankCategoryBreakdown(amounts, categoryLimit).map((row) => {
      if (row.key === '__other__') return {...row, name: t.other, chartValue: categoryUnit === 'percent' ? row.percentage : row.value};
      const resolved = resolveTagKeyFromLocalized(row.key, 'en', categoryType);
      return {
        ...row,
        name: resolved ? translateTag(resolved, language, categoryType) : row.key,
        chartValue: categoryUnit === 'percent' ? row.percentage : row.value,
      };
    });
  }, [categoryLimit, categoryMonth, categoryUnit, flow, language, t.other, userData]);

  const ensureFullHistory = async () => {
    if (fullHistoryLoaded || !fetchAllTimeMonthlyTotals) return;
    setLoadingHistory(true);
    try { await fetchAllTimeMonthlyTotals(); setFullHistoryLoaded(true); }
    finally { setLoadingHistory(false); }
  };
  const selectPeriod = async (next: string) => {
    if (next === '2y' || next === 'all') await ensureFullHistory();
    setPeriod(next);
  };

  const locale = language === 'it' ? 'it-IT' : language;
  const monthLabel = (value: string) => {
    const date = new Date(`${value}-01T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale, {month: 'short', year: '2-digit'});
  };
  const money = (value: number) => isHidden ? '••••' : formatAmount(value, {maximumFractionDigits: 0});
  const percent = (value: number | null) => isHidden ? '••••' : value === null ? t.notAvailable : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  const axisMoney = (value: number) => isHidden ? '••••' : compactNumber(Math.round(fromEUR(value)));
  const periodDelta = previousKpis.totalOutflows === 0 ? null : ((kpis.totalOutflows - previousKpis.totalOutflows) / previousKpis.totalOutflows) * 100;

  const tooltip = ({active, payload}: {active?: boolean; payload?: Array<{payload: IncomeOutflowChartRow}>}) => {
    const row = payload?.[0]?.payload;
    if (!active || !row) return null;
    return <TooltipCard theme={theme}><h4>{monthLabel(row.name)}</h4><div style={{color: assetColors.income}}><span>{t.incomes}</span><strong>{money(row.incomes)}</strong></div><div style={{color: assetColors.expense}}><span>{t.outflows}</span><strong>{money(row.outflows)}</strong></div><div style={{color: '#06b6d4'}}><span>{t.net}</span><strong>{money(row.net)}</strong></div><div style={{color: '#a78bfa'}}><span>{t.savingsRate}</span><strong>{percent(row.savingsRate)}</strong></div></TooltipCard>;
  };

  const commonChart = {
    margin: {top: 12, right: isMobile ? 2 : 18, left: isMobile ? -20 : 5, bottom: 12},
    onClick: (state: {activePayload?: Array<{payload: IncomeOutflowChartRow}>; activeLabel?: string}) => {
      const sourceRows = compare && view === 'net' ? comparisonRows : rows;
      const row = state?.activePayload?.[0]?.payload || sourceRows.find((item) => item.name === state?.activeLabel);
      if (row) setSelectedRow(row);
    },
  };
  const axes = <>
    <CartesianGrid vertical={false} strokeDasharray="3 5" stroke={theme.mode === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(15,23,42,.08)'} />
    <XAxis dataKey="name" tickFormatter={monthLabel} minTickGap={26} tick={{fill: theme.textColor, fontSize: isMobile ? 9 : 11}} axisLine={false} tickLine={false} />
    <YAxis tickFormatter={axisMoney} width={isMobile ? 48 : 66} tick={{fill: theme.textColor, fontSize: isMobile ? 9 : 11}} axisLine={false} tickLine={false} />
    <Tooltip content={tooltip} trigger={isMobile ? 'click' : 'hover'} cursor={{fill: theme.mode === 'dark' ? 'rgba(255,255,255,.04)' : 'rgba(15,23,42,.04)'}} />
  </>;

  const renderChart = () => {
    if (view === 'categories') return loadingMonth ? <div aria-live="polite">{t.loading}</div> : <ResponsiveContainer width="100%" height="100%"><BarChart data={categoryRows} layout="vertical" margin={{top: 5, right: 25, left: isMobile ? 2 : 35, bottom: 5}}>
      <CartesianGrid horizontal={false} strokeDasharray="3 5" stroke={theme.mode === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(15,23,42,.08)'} />
      <XAxis type="number" tickFormatter={(value) => categoryUnit === 'percent' ? `${Math.round(value)}%` : axisMoney(value)} tick={{fill: theme.textColor, fontSize: 10}} axisLine={false} tickLine={false} />
      <YAxis type="category" dataKey="name" width={isMobile ? 88 : 130} tick={{fill: theme.textColor, fontSize: isMobile ? 9 : 11}} axisLine={false} tickLine={false} />
      <Tooltip trigger={isMobile ? 'click' : 'hover'} formatter={(value: number) => categoryUnit === 'percent' ? `${value.toFixed(1)}%` : money(value)} contentStyle={{background: theme.mode === 'dark' ? '#181e26' : '#fff', color: theme.textColor, borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,.12)' : 'rgba(15,23,42,.1)', borderRadius: 8, fontSize: 12}} />
      <Bar dataKey="chartValue" radius={[0, 5, 5, 0]}>{categoryRows.map((row) => <Cell key={row.key} fill={row.key === '__other__' ? theme.textColor : getCategoryColor(row.key, language)} />)}</Bar>
    </BarChart></ResponsiveContainer>;
    if (view === 'net') return <ResponsiveContainer width="100%" height="100%"><BarChart data={compare ? comparisonRows : rows} {...commonChart}>{axes}<ReferenceLine y={0} stroke={theme.textColor} strokeOpacity={.5}/>{compare && <Bar dataKey="comparisonNet" fill={theme.textColor} fillOpacity={.2} radius={[4,4,4,4]}/>}<Bar dataKey="net" radius={[4,4,4,4]}>{rows.map((row) => <Cell key={row.name} fill={row.net >= 0 ? assetColors.income : assetColors.expense}/>)}</Bar></BarChart></ResponsiveContainer>;
    return <ResponsiveContainer width="100%" height="100%"><ComposedChart data={rows} {...commonChart}>{axes}<Bar dataKey="incomes" fill={assetColors.income} fillOpacity={.7} radius={[4,4,0,0]}/><Bar dataKey="outflows" fill={assetColors.expense} fillOpacity={.7} radius={[4,4,0,0]}/><Line type="linear" dataKey="net" stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{r: 5}}/>{userData?.limits?.monthlySpendingLimit && <ReferenceLine y={Number(userData.limits.monthlySpendingLimit)} stroke="#f97316" strokeDasharray="6 5"/>}</ComposedChart></ResponsiveContainer>;
  };

  const exportRows = rows.map((row) => ({month: row.name, incomes: row.incomes, outflows: row.outflows, net: row.net, savingsRate: row.savingsRate ?? ''}));
  const headers = [{label: t.month, key: 'month'}, {label: t.incomes, key: 'incomes'}, {label: t.outflows, key: 'outflows'}, {label: t.net, key: 'net'}, {label: t.savingsRate, key: 'savingsRate'}];

  return <Explorer ref={hostRef} theme={theme}>
    <Header><div><h2>{t.title}</h2><p>{t.subtitle}</p></div><Segments><CSVLink data={exportRows} headers={headers} filename="income-outflow-history.csv" aria-label={t.exportCsv}><IconButton as="span" theme={theme}><BsFiletypeCsv/></IconButton></CSVLink><IconButton theme={theme} onClick={() => downloadExcel(exportRows, headers, 'income-outflow-history.xlsx')} aria-label={t.exportExcel}><RiFileExcel2Line/></IconButton></Segments></Header>
    <KpiGrid>
      <Kpi theme={theme}><span>{t.totalIncomes}</span><strong>{money(kpis.totalIncomes)}</strong><small>{t.selectedPeriod}</small></Kpi>
      <Kpi theme={theme}><span>{t.totalOutflows}</span><strong>{money(kpis.totalOutflows)}</strong><small>{periodDelta === null ? t.noComparison : `${periodDelta >= 0 ? '+' : ''}${periodDelta.toFixed(1)}% ${t.vsPrevious}`}</small></Kpi>
      <Kpi theme={theme}><span>{t.netCashFlow}</span><strong style={{color: kpis.net >= 0 ? assetColors.income : assetColors.expense}}>{money(kpis.net)}</strong><small>{t.average}: {money(kpis.averageMonthlyNet)}</small></Kpi>
      <Kpi theme={theme}><span>{t.savingsRate}</span><strong>{percent(kpis.savingsRate)}</strong><small>{kpis.deficitMonths} {t.deficitMonths}</small></Kpi>
    </KpiGrid>
    <Toolbar theme={theme}>
      <ToolbarRow><Segments>
        <Segment theme={theme} $active={view === 'trend'} onClick={() => setView('trend')} aria-label={t.viewTrend}><Columns3/><span>{t.viewTrend}</span></Segment>
        <Segment theme={theme} $active={view === 'net'} onClick={() => setView('net')} aria-label={t.viewNet}><BarChart3/><span>{t.viewNet}</span></Segment>
        <Segment theme={theme} $active={view === 'categories'} onClick={() => setView('categories')} aria-label={t.viewCategories}><LineChart/><span>{t.viewCategories}</span></Segment>
        <Segment theme={theme} $active={view === 'table'} onClick={() => setView('table')} aria-label={t.viewTable}><Table2/><span>{t.viewTable}</span></Segment>
      </Segments><Segments>{PERIODS.map((item) => <Segment key={item} theme={theme} $active={period === item} disabled={(item === '2y' || item === 'all') && loadingHistory} onClick={() => selectPeriod(item)}>{loadingHistory && (item === '2y' || item === 'all') ? '…' : t.periods[item]}</Segment>)}<Segment theme={theme} $active={period === 'custom'} onClick={() => setShowRange((value) => !value)} aria-label={t.customRange}><CalendarRange/></Segment></Segments></ToolbarRow>
      {showRange && <RangeRow theme={theme}><span>{t.from}</span><input type="month" value={startMonth} min={allRows[0]?.name} max={allRows[allRows.length - 1]?.name} onChange={async (event) => {setStartMonth(event.target.value); setPeriod('custom'); await ensureFullHistory();}}/><span>{t.to}</span><input type="month" value={endMonth} min={allRows[0]?.name} max={allRows[allRows.length - 1]?.name} onChange={async (event) => {setEndMonth(event.target.value); setPeriod('custom'); await ensureFullHistory();}}/></RangeRow>}
      {view === 'net' && <ToolbarRow><Segment theme={theme} $active={compare} onClick={() => setCompare((value) => !value)}>{t.comparePrevious}</Segment></ToolbarRow>}
      {view === 'categories' && <ToolbarRow><Segments><Segment theme={theme} $active={flow === 'outflows'} onClick={() => setFlow('outflows')}>{t.outflows}</Segment><Segment theme={theme} $active={flow === 'incomes'} onClick={() => setFlow('incomes')}>{t.incomes}</Segment><Segment theme={theme} $active={categoryUnit === 'value'} onClick={() => setCategoryUnit('value')}>{t.value}</Segment><Segment theme={theme} $active={categoryUnit === 'percent'} onClick={() => setCategoryUnit('percent')}>{t.percentage}</Segment></Segments><Segments><input aria-label={t.month} type="month" value={categoryMonth} max={indexToMonthKey(0)} onChange={(event) => setCategoryMonth(event.target.value)}/><Segment theme={theme} $active={categoryLimit === 5} onClick={() => setCategoryLimit(5)}>{translations.graphs.statsOutflows.outflowAnalysis.topCategories} 5</Segment><Segment theme={theme} $active={categoryLimit === 10} onClick={() => setCategoryLimit(10)}>{translations.graphs.statsOutflows.outflowAnalysis.topCategories} 10</Segment><Segment theme={theme} onClick={() => setShowComparisonModal(true)}>{t.compareMonths}</Segment></Segments></ToolbarRow>}
    </Toolbar>
    {view === 'table' ? <DataTable theme={theme}><table><thead><tr><th>{t.month}</th><th>{t.incomes}</th><th>{t.outflows}</th><th>{t.net}</th><th>{t.savingsRate}</th></tr></thead><tbody>{[...rows].reverse().map((row) => <tr key={row.name}><td>{monthLabel(row.name)}</td><td>{money(row.incomes)}</td><td>{money(row.outflows)}</td><td style={{color: row.net >= 0 ? assetColors.income : assetColors.expense}}>{money(row.net)}</td><td>{percent(row.savingsRate)}</td></tr>)}</tbody></table></DataTable> : <ChartStage>{renderChart()}</ChartStage>}
    <div><strong style={{display: 'block', fontSize: '.78rem', marginBottom: '.5rem'}}>{t.insightsTitle}</strong><InsightGrid>
      <Insight $tone={kpis.net >= 0 ? 'positive' : 'negative'}>{kpis.net >= 0 ? <TrendingUp/> : <TrendingDown/>}<span>{(kpis.net >= 0 ? t.positiveNetInsight : t.negativeNetInsight).replace('{value}', money(Math.abs(kpis.net)))}</span></Insight>
      <Insight $tone={kpis.deficitMonths > 0 ? 'negative' : 'positive'}><WalletCards/><span>{t.deficitInsight.replace('{count}', String(kpis.deficitMonths)).replace('{total}', String(rows.length))}</span></Insight>
      <Insight $tone="neutral"><TrendingUp/><span>{t.rateInsight.replace('{value}', percent(kpis.savingsRate))}</span></Insight>
    </InsightGrid></div>
    {isMobile && selectedRow && <MobileSheet theme={theme} role="dialog" aria-label={t.monthDetails}><header><strong>{monthLabel(selectedRow.name)}</strong><button type="button" onClick={() => setSelectedRow(null)} aria-label={t.closeDetails}><X/></button></header><div style={{color: assetColors.income}}><span>{t.incomes}</span><strong>{money(selectedRow.incomes)}</strong></div><div style={{color: assetColors.expense}}><span>{t.outflows}</span><strong>{money(selectedRow.outflows)}</strong></div><div style={{color: '#06b6d4'}}><span>{t.net}</span><strong>{money(selectedRow.net)}</strong></div><div style={{color: '#a78bfa'}}><span>{t.savingsRate}</span><strong>{percent(selectedRow.savingsRate)}</strong></div></MobileSheet>}
    {showComparisonModal && <MonthComparisonModal theme={theme} userData={userData} isHidden={isHidden} initialFlow={flow} onClose={() => setShowComparisonModal(false)}/>}
  </Explorer>;
}

export default React.memo(InOutChart);
