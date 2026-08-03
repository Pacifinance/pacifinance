import React, { useEffect, useMemo, useState, useContext } from 'react';
import styled from 'styled-components';
import { BarChart } from 'recharts/lib/chart/BarChart';
import { Bar } from 'recharts/lib/cartesian/Bar';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { YAxis } from 'recharts/lib/cartesian/YAxis';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { Cell } from 'recharts/lib/component/Cell';
import { LabelList } from 'recharts/lib/component/LabelList';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import {
  Repeat,
  CreditCard,
  Banknote,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from '../data/categoryIcons';
import { compactNumber } from '../utils/customGraphsInfo.jsx';
import {
  getAllOutflows, getAllIncomes, getTotalOutflowsCategoryBreakdownPerMonth, getTotalIncomesCategoryBreakdownPerMonth,
  getEntriesForMonthKey, getCategoryBreakdownForEntries, indexToMonthKey, monthKeyToIndex,
} from '../utils/userDataSelectors';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import { translateTag, resolveTagKeyFromLocalized } from '../data/tagTranslations';

/* ═══════════════════════════════════════════════════════════════
   Styled Components — Compact, data-dense design
   ═══════════════════════════════════════════════════════════════ */

const Container = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 16px;
  margin-top: 1.5rem;
  overflow: hidden;
  box-shadow: ${p => p.theme.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.04)'
  };
  @media (max-width: 768px) { border-radius: 12px; margin-top: 1rem; }
`;

const Header = styled.div`
  padding: 1rem 1.25rem 0.75rem;
  text-align: center;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  @media (max-width: 768px) { padding: 0.75rem 1rem 0.6rem; }
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  svg { width: 18px; height: 18px; opacity: 0.6; }
  @media (max-width: 768px) { font-size: 1rem; }
`;

const Subtitle = styled.p`
  font-size: 0.82rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
  margin: 0;
  line-height: 1.4;
  @media (max-width: 768px) { font-size: 0.76rem; }
`;

const MonthSelect = styled.div`
  display: flex;
  justify-content: center;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
  select {
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 500;
    cursor: pointer;
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'};
    color: ${p => p.theme.textColor};
    border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
    transition: all 0.2s;
    &:focus { outline: none; border-color: ${p => p.theme.buttonBackgroundColor}; }
    option {
      background: ${p => p.theme.mode === 'dark' ? '#2d2d2d' : 'white'};
      color: ${p => p.theme.mode === 'dark' ? 'white' : '#1f2937'};
    }
  }
  @media (max-width: 768px) { padding: 0.5rem 0.75rem; select { font-size: 0.75rem; } }
`;

const OverviewStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); }
`;

const OverviewCell = styled.div`
  padding: 0.65rem 0.5rem;
  text-align: center;
  position: relative;
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    height: 60%;
    width: 1px;
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  }
  @media (max-width: 480px) {
    &:nth-child(2)::after { display: none; }
    &:nth-child(1), &:nth-child(2) {
      border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
    }
  }
`;

const CellLabel = styled.div`
  font-size: 0.68rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'};
  margin-bottom: 0.15rem;
  @media (max-width: 768px) { font-size: 0.62rem; }
`;

const CellValue = styled.div`
  font-size: 1rem; font-weight: 700; color: ${p => p.theme.textColor};
  @media (max-width: 768px) { font-size: 0.88rem; }
`;

const CellTrend = styled.span`
  font-size: 0.68rem; font-weight: 600;
  color: ${p => p.$positive ? '#10b981' : p.$neutral ? (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)') : '#ef4444'};
  display: flex; align-items: center; justify-content: center; gap: 0.1rem; margin-top: 0.1rem;
  svg { width: 10px; height: 10px; }
`;

const SectionToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'};
  border: none;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
  cursor: pointer;
  color: ${p => p.theme.textColor};
  transition: background 0.15s;
  &:hover { background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)'}; }
  @media (max-width: 768px) { padding: 0.5rem 0.75rem; }
`;

const SectionLabelStyled = styled.span`
  font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem;
  svg { width: 15px; height: 15px; opacity: 0.5; }
  @media (max-width: 768px) { font-size: 0.78rem; }
`;

const SectionBadge = styled.span`
  font-size: 0.68rem; font-weight: 600;
  background: ${p => p.theme.buttonBackgroundColor}20;
  color: ${p => p.theme.buttonBackgroundColor};
  padding: 0.15rem 0.4rem; border-radius: 6px;
`;

const FilterChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.6rem 1rem 0;
  @media (max-width: 768px) { padding: 0.5rem 0.75rem 0; }
`;

const FilterChip = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${p => p.$active ? p.$color : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')};
  background: ${p => p.$active ? `${p.$color}18` : 'transparent'};
  color: ${p => p.$active ? p.$color : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)')};
  text-decoration: ${p => p.$active ? 'none' : 'line-through'};
  transition: all 0.15s ease;

  &::before {
    content: '';
    width: 7px; height: 7px; border-radius: 50%;
    background: ${p => p.$color};
    opacity: ${p => p.$active ? 1 : 0.4};
    flex-shrink: 0;
  }
`;

const ChartWrap = styled.div`
  padding: 0.5rem 1rem 0.25rem;
  @media (max-width: 768px) { padding: 0.4rem 0.5rem 0.1rem; }
`;

const CatRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 0.8fr 0.8fr;
  align-items: center;
  padding: 0.5rem 1rem;
  gap: 0.5rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
  transition: background 0.15s;
  &:hover { background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'}; }
  @media (max-width: 600px) { grid-template-columns: 1.5fr 1fr 0.7fr 0.7fr; padding: 0.4rem 0.75rem; gap: 0.3rem; }
`;

const CatHeaderRow = styled(CatRow)`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'};
  padding: 0.35rem 1rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  &:hover { background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'}; }
  @media (max-width: 600px) { padding: 0.3rem 0.75rem; }
`;

const CatHeaderText = styled.span`
  font-size: 0.66rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'};
  text-align: ${p => p.$align || 'left'};
  @media (max-width: 768px) { font-size: 0.6rem; }
`;

const CatName = styled.div`
  display: flex; align-items: center; gap: 0.4rem; min-width: 0;
`;

const CatIcon = styled.div`
  width: 24px; height: 24px; border-radius: 6px;
  background: ${p => p.$color}; color: white;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  svg { width: 13px; height: 13px; }
  @media (max-width: 768px) { width: 20px; height: 20px; border-radius: 5px; svg { width: 11px; height: 11px; } }
`;

const CatLabel = styled.div`
  font-size: 0.88rem; font-weight: 600; color: ${p => p.theme.textColor};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  @media (max-width: 768px) { font-size: 0.8rem; }
`;

const CatPercent = styled.span`
  font-size: 0.65rem; font-weight: 500;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'};
  margin-left: 0.2rem;
`;

const CatAmount = styled.div`
  font-size: 0.88rem; font-weight: 600; color: ${p => p.theme.textColor}; text-align: right;
  @media (max-width: 768px) { font-size: 0.8rem; }
`;

const TrendBadge = styled.span`
  display: inline-flex; align-items: center; gap: 0.1rem;
  font-size: 0.73rem; font-weight: 600; padding: 0.1rem 0.3rem; border-radius: 4px;
  text-align: right; justify-content: flex-end;
  ${p => {
    if (p.$trend === 'down') return `color: #10b981; background: #10b98115;`;
    if (p.$trend === 'up') return `color: #ef4444; background: #ef444415;`;
    return `color: ${p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'}; background: transparent;`;
  }}
  svg { width: 10px; height: 10px; }
  @media (max-width: 768px) { font-size: 0.6rem; padding: 0.05rem 0.2rem; }
`;

const ProgressBar = styled.div`
  width: 100%; height: 3px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  border-radius: 2px; margin-top: 0.2rem;
`;

const ProgressFill = styled.div`
  height: 100%; border-radius: 2px; background: ${p => p.$color};
  width: ${p => Math.min(p.$percent, 100)}%; transition: width 0.3s ease;
`;

const PaymentRow = styled(CatRow)``;

const PaymentIconStyled = styled.div`
  width: 24px; height: 24px; border-radius: 6px;
  background: ${p => p.theme.buttonBackgroundColor}15;
  color: ${p => p.theme.buttonBackgroundColor};
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  svg { width: 13px; height: 13px; }
  @media (max-width: 768px) { width: 20px; height: 20px; svg { width: 11px; height: 11px; } }
`;

const RecurringItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 0.6fr;
  align-items: center;
  padding: 0.45rem 1rem;
  gap: 0.5rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
  transition: background 0.15s;
  &:hover { background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'}; }
  @media (max-width: 600px) { grid-template-columns: 1.5fr 1fr 0.6fr; padding: 0.4rem 0.75rem; gap: 0.3rem; }
`;

const RecurringName = styled.div`
  font-size: 0.85rem; font-weight: 600; color: ${p => p.theme.textColor};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  @media (max-width: 768px) { font-size: 0.78rem; }
`;

const RecurringNote = styled.span`
  font-size: 0.62rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px;
`;

const RecurringAmount = styled.div`
  font-size: 0.85rem; font-weight: 600; color: ${p => p.theme.textColor}; text-align: right;
  @media (max-width: 768px) { font-size: 0.78rem; }
`;

const FreqBadge = styled.span`
  font-size: 0.6rem; font-weight: 500;
  color: ${p => p.theme.buttonBackgroundColor};
  background: ${p => p.theme.buttonBackgroundColor}15;
  padding: 0.1rem 0.35rem; border-radius: 4px; text-align: center; white-space: nowrap;
`;

const SummaryFooter = styled.div`
  display: flex; align-items: center; justify-content: center;
  padding: 0.5rem 1rem; font-size: 0.7rem; font-weight: 500;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'};
  border-top: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
  gap: 0.3rem;
  strong { color: ${p => p.theme.textColor}; font-weight: 700; }
`;

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function DetailedOutflowAnalysis({ theme, userData, isHidden = false }) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const t = translations.graphs.statsOutflows.outflowAnalysis;
  const { fetchMonthDetail } = useContext(UserContext) || {};
  const [selectedMonth, setSelectedMonth] = useState(() => indexToMonthKey(0));
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState('expense');
  const [showCategories, setShowCategories] = useState(true);
  const [showPayments, setShowPayments] = useState(false);
  const [showRecurringMonth, setShowRecurringMonth] = useState(false);
  const [showRecurring12M, setShowRecurring12M] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState(() => new Set());
  const [hiddenPaymentMethods, setHiddenPaymentMethods] = useState(() => new Set());

  const fmt = (val) => formatAmount(val, { maximumFractionDigits: 0 });

  // A new month/flow means a fresh breakdown - don't carry over filters from
  // a previous view where they might not even apply to the same categories.
  useEffect(() => {
    setHiddenCategories(new Set());
    setHiddenPaymentMethods(new Set());
  }, [selectedMonth, selectedFlow]);

  const toggleHidden = (setFn) => (key) => {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const toggleCategory = toggleHidden(setHiddenCategories);
  const togglePaymentMethod = toggleHidden(setHiddenPaymentMethods);

  const maxMonth = indexToMonthKey(0);
  const minMonth = indexToMonthKey(120);
  const prevMonthKey = indexToMonthKey(monthKeyToIndex(selectedMonth) + 1);

  // Fetches the selected month and its predecessor on demand if either falls
  // outside the already-loaded window (see fetchMonthDetail in UserContext).
  useEffect(() => {
    if (!userData || !fetchMonthDetail) return;
    const flow = selectedFlow === 'income' ? 'incomes' : 'outflows';
    const keys = [...new Set([selectedMonth, prevMonthKey])]
      .filter((key) => getEntriesForMonthKey(userData, key, flow) === null);
    if (keys.length === 0) return;
    setIsLoadingMonth(true);
    Promise.all(keys.map((key) => {
      const [y, m] = key.split('-').map(Number);
      return fetchMonthDetail(y, m);
    })).finally(() => setIsLoadingMonth(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, selectedMonth, prevMonthKey, selectedFlow]);

  const analysis = useMemo(() => {
    const isIncomeFlow = selectedFlow === 'income';
    const flow = isIncomeFlow ? 'incomes' : 'outflows';
    const allEntries = isIncomeFlow ? getAllIncomes(userData) : getAllOutflows(userData);
    const catPerMonth = isIncomeFlow
      ? getTotalIncomesCategoryBreakdownPerMonth(userData)
      : getTotalOutflowsCategoryBreakdownPerMonth(userData);
    if (!allEntries || allEntries.length === 0 || !catPerMonth) return null;

    const current = getEntriesForMonthKey(userData, selectedMonth, flow) || [];
    const previous = getEntriesForMonthKey(userData, prevMonthKey, flow) || [];
    const last12 = allEntries.slice(0, 12) || [];

    const currentTotal = current.reduce((s, e) => s + e.amount, 0);
    const previousTotal = previous.reduce((s, e) => s + e.amount, 0);
    const last12Total = last12.flat().reduce((s, e) => s + e.amount, 0);
    const avg = last12Total / Math.max(last12.length, 1);
    const monthlyChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    const cats = {};
    const currentCats = getCategoryBreakdownForEntries(current, isIncomeFlow ? 'income' : 'expense');
    const previousCats = getCategoryBreakdownForEntries(previous, isIncomeFlow ? 'income' : 'expense');
    Object.entries(currentCats).forEach(([cat, categoryData]) => {
      const amount = Number(categoryData?.amount) || 0;
      const prevAmt = Number(previousCats[cat]?.amount) || 0;
      let avg12 = 0, months = 0;
      for (let i = 0; i < 12; i++) {
        const monthlyAmount = Number(catPerMonth[i]?.[cat]?.amount) || 0;
        if (monthlyAmount > 0) {
          avg12 += monthlyAmount;
          months++;
        }
      }
      avg12 = months > 0 ? avg12 / months : 0;
      const mChange = prevAmt > 0 ? ((amount - prevAmt) / prevAmt) * 100 : 0;
      const txCount = current.filter(o => {
        const name = translateTag(o.categoryTag?.label, 'en', selectedFlow) || o.categoryTag?.label || 'Other';
        return name === cat;
      }).length;
      cats[cat] = { amount, prevAmt, avg12, mChange, txCount, subcategories: categoryData?.subcategories || {} };
    });

    const payments = {};
    const subs = { total: 0, count: 0 };
    current.forEach(o => {
      const ptKey = (o.paymentType?.label || 'unknown').toLowerCase();
      const ptName = translateTag(o.paymentType?.label, language, 'payment') || o.paymentType?.label || 'Unknown';
      const amt = Number(o.amount) || 0;
      if (!payments[ptKey]) payments[ptKey] = { name: ptName, total: 0, count: 0 };
      payments[ptKey].total += amt;
      payments[ptKey].count += 1;
      if (ptKey === 'subscription') { subs.total += amt; subs.count += 1; }
    });

    const recurring = [];
    current.forEach(o => {
      if (o.amount <= 5) return;
      const catKey = (o.categoryTag?.label || 'other').toLowerCase();
      const ptKey = (o.paymentType?.label || 'unknown').toLowerCase();
      const notes = (o.notes || '').toLowerCase().trim();
      const amt = Number(o.amount) || 0;
      const similar = last12.flat().filter(e => {
        const eCatKey = (e.categoryTag?.label || 'other').toLowerCase();
        const ePtKey = (e.paymentType?.label || 'unknown').toLowerCase();
        const eNotes = (e.notes || '').toLowerCase().trim();
        let notesMatch = false;
        if (notes && eNotes) {
          const w1 = notes.split(/\s+/), w2 = eNotes.split(/\s+/);
          notesMatch = w1.filter(w => w2.includes(w)).length / Math.max(w1.length, w2.length) > 0.6 || notes === eNotes;
        }
        return eCatKey === catKey && ePtKey === ptKey && (notesMatch || !notes) && Math.abs((e.amount || 0) - amt) < 20;
      });
      if (similar.length >= 3) {
        const cat = translateTag(o.categoryTag?.label, language, selectedFlow) || o.categoryTag?.label || 'Other';
        const pt = translateTag(o.paymentType?.label, language, 'payment') || o.paymentType?.label || 'Unknown';
        if (!recurring.find(r => r.catKey === catKey && r.ptKey === ptKey && r.notes === notes)) {
          recurring.push({ category: cat, catKey, amount: amt, frequency: similar.length, paymentType: pt, ptKey, notes, isSub: ptKey === 'subscription' });
        }
      }
    });

    return {
      overview: { currentTotal, previousTotal, avg, txCount: current.length, monthlyChange, subsCount: subs.count, subsTotal: subs.total },
      categories: cats,
      payments,
      recurring: recurring.sort((a, b) => b.amount - a.amount)
    };
  }, [userData, selectedMonth, prevMonthKey, language, selectedFlow]);

  const recurring12M = useMemo(() => {
    const allOutflows = getAllOutflows(userData);
    if (!allOutflows || allOutflows.length === 0) return [];
    const last12 = allOutflows.slice(0, 12);
    const map = new Map();
    last12.flat().forEach(o => {
      if (o.amount <= 5) return;
      const catKey = (o.categoryTag?.label || 'other').toLowerCase();
      const ptKey = (o.paymentType?.label || 'unknown').toLowerCase();
      const notes = (o.notes || '').toLowerCase().trim();
      const key = `${catKey}-${ptKey}-${notes}`;
      if (!map.has(key)) {
        map.set(key, {
          category: translateTag(o.categoryTag?.label, language, selectedFlow) || o.categoryTag?.label || 'Other',
          catKey,
          paymentType: translateTag(o.paymentType?.label, language, 'payment') || o.paymentType?.label || 'Unknown',
          amounts: [], frequency: 0, isSub: ptKey === 'subscription', notes
        });
      }
      map.get(key).amounts.push(Number(o.amount) || 0);
      map.get(key).frequency++;
    });
    return Array.from(map.values())
      .filter(i => i.frequency >= 4)
      .map(i => ({ ...i, amount: i.amounts.reduce((s, v) => s + v, 0) / i.amounts.length }))
      .sort((a, b) => b.amount - a.amount);
  }, [userData, language]);

  if (!analysis) {
    return (
      <Container theme={theme}>
        <Header theme={theme}>
          <Title theme={theme}><BarChart3 />{t.title}</Title>
          <Subtitle theme={theme}>{language === 'it' ? 'Nessun dato disponibile' : 'No data available'}</Subtitle>
        </Header>
      </Container>
    );
  }

  const { overview, categories, payments, recurring } = analysis;

  const getPaymentIcon = (key) => {
    switch (key) {
      case 'subscription': return <Repeat size={13} />;
      case 'single payment': return <CreditCard size={13} />;
      case 'cash': return <Banknote size={13} />;
      case 'installment': return <CalendarDays size={13} />;
      case 'periodic payment': return <Clock size={13} />;
      default: return <CreditCard size={13} />;
    }
  };

  // Payment types aren't expense/income categories, so getCategoryColor() (which
  // falls back to a single green for anything it doesn't recognize) isn't right
  // here - a small fixed palette for the handful of known payment types instead.
  const getPaymentColor = (key) => ({
    subscription: '#6c5ce7',
    'single payment': '#079164',
    cash: '#f39c12',
    installment: '#3498db',
    'periodic payment': '#e74c3c',
  }[key] || '#95a5a6');

  const getTrend = (ch) => ch > 5 ? 'up' : ch < -5 ? 'down' : 'neutral';
  const formatPct = (p) => `${p > 0 ? '+' : ''}${p.toFixed(1)}%`;

  const sortedCats = Object.entries(categories).filter(([c, d]) => c && d && typeof d === 'object').sort((a, b) => b[1].amount - a[1].amount);
  const sortedPayments = Object.entries(payments).filter(([k, d]) => k && d).sort((a, b) => b[1].total - a[1].total);
  const visibleCats = sortedCats.filter(([cat]) => !hiddenCategories.has(cat));
  const visiblePayments = sortedPayments.filter(([key]) => !hiddenPaymentMethods.has(key));

  // Resolved once for both the filter chips and the bar chart below.
  const catMetaList = sortedCats.map(([cat, data]) => {
    const dbKey = resolveTagKeyFromLocalized(cat, null, selectedFlow) || cat;
    const displayName = translateTag(dbKey, language, selectedFlow) || cat;
    return { cat, amount: data.amount, dbKey, displayName, color: getCategoryColor(dbKey) };
  });
  const paymentMetaList = sortedPayments.map(([key, data]) => ({
    key, total: data.total, displayName: data.name || key, color: getPaymentColor(key),
  }));

  const overviewTrendPositive = selectedFlow === 'income' ? overview.monthlyChange >= 5 : overview.monthlyChange <= -5;
  const overviewTrendNeutral = Math.abs(overview.monthlyChange) < 5;

  return (
    <Container theme={theme}>
      <Header theme={theme}>
        <Title theme={theme}><BarChart3 />{t.title}</Title>
        <Subtitle theme={theme}>{t.subtitle}</Subtitle>
      </Header>


      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        padding: '0.6rem 1rem 0',
      }}>
        {[
          { key: 'expense', label: translations.general.outflows || (language === 'it' ? 'Uscite' : 'Outflows') },
          { key: 'income', label: translations.general.incomes || (language === 'it' ? 'Entrate' : 'Incomes') },
        ].map((flow) => {
          const active = selectedFlow === flow.key;
          return (
            <button
              key={flow.key}
              type="button"
              onClick={() => setSelectedFlow(flow.key)}
              style={{
                border: '1px solid ' + (active ? theme.buttonBackgroundColor : (theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)')),
                borderRadius: 999,
                padding: '0.32rem 0.7rem',
                cursor: 'pointer',
                fontSize: '0.76rem',
                fontWeight: 700,
                background: active ? theme.buttonBackgroundColor : 'transparent',
                color: active ? '#fff' : theme.textColor,
              }}
            >
              {flow.label}
            </button>
          );
        })}
      </div>

      <MonthSelect theme={theme}>
        <input
          type="month"
          value={selectedMonth}
          min={minMonth}
          max={maxMonth}
          onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 8,
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
            color: theme.textColor,
            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            colorScheme: theme.mode === 'dark' ? 'dark' : 'light',
            opacity: isLoadingMonth ? 0.6 : 1,
          }}
        />
      </MonthSelect>

      <OverviewStrip theme={theme}>
        <OverviewCell theme={theme}>
          <CellLabel theme={theme}>{t.currentMonthTotal}</CellLabel>
          <CellValue theme={theme}>{isHidden ? '••••' : fmt(overview.currentTotal)}</CellValue>
          <CellTrend theme={theme} $positive={overviewTrendPositive} $neutral={overviewTrendNeutral}>
            {overviewTrendNeutral ? <Minus /> : overviewTrendPositive ? <ArrowDownRight /> : <ArrowUpRight />}
            {isHidden ? '••' : formatPct(overview.monthlyChange)}
          </CellTrend>
        </OverviewCell>
        <OverviewCell theme={theme}>
          <CellLabel theme={theme}>{t.totalTransactions}</CellLabel>
          <CellValue theme={theme}>{isHidden ? '••••' : overview.txCount}</CellValue>
        </OverviewCell>
        <OverviewCell theme={theme}>
          <CellLabel theme={theme}>{t.monthlyAverage12M}</CellLabel>
          <CellValue theme={theme}>{isHidden ? '••••' : fmt(overview.avg)}</CellValue>
        </OverviewCell>
        <OverviewCell theme={theme}>
          <CellLabel theme={theme}>{t.recurringThisMonth}</CellLabel>
          <CellValue theme={theme}>{isHidden ? '••••' : recurring.length}</CellValue>
        </OverviewCell>
      </OverviewStrip>

      {/* Categories */}
      <SectionToggle theme={theme} onClick={() => setShowCategories(!showCategories)}>
        <SectionLabelStyled theme={theme}><PieChart />{language === 'it' ? 'Categorie' : 'Categories'}</SectionLabelStyled>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <SectionBadge theme={theme}>{sortedCats.length}</SectionBadge>
          {showCategories ? <ChevronUp size={14} style={{ opacity: 0.4 }} /> : <ChevronDown size={14} style={{ opacity: 0.4 }} />}
        </div>
      </SectionToggle>

      {showCategories && (
        <div>
          <FilterChipsRow theme={theme}>
            {catMetaList.map(({ cat, displayName, color }) => (
              <FilterChip
                key={cat}
                type="button"
                theme={theme}
                $active={!hiddenCategories.has(cat)}
                $color={color}
                onClick={() => toggleCategory(cat)}
              >
                {displayName}
              </FilterChip>
            ))}
          </FilterChipsRow>

          {visibleCats.length > 0 && (
            <ChartWrap>
              <div style={{ width: '100%', height: Math.max(140, visibleCats.length * 30) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={catMetaList.filter(({ cat }) => !hiddenCategories.has(cat))}
                    margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="displayName"
                      width={100}
                      tick={{ fill: theme.textColor, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [isHidden ? '****' : formatAmount(value, { maximumFractionDigits: 0 }), '']}
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 12, color: '#333' }}
                    />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                      {catMetaList.filter(({ cat }) => !hiddenCategories.has(cat)).map((entry) => (
                        <Cell key={entry.cat} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="amount"
                        position="right"
                        formatter={(v) => (isHidden ? '****' : compactNumber(v))}
                        style={{ fontSize: 10, fill: theme.textColor, opacity: 0.8 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartWrap>
          )}

          <CatHeaderRow theme={theme}>
            <CatHeaderText theme={theme}>{language === 'it' ? 'Categoria' : 'Category'}</CatHeaderText>
            <CatHeaderText theme={theme} $align="right">{language === 'it' ? 'Importo' : 'Amount'}</CatHeaderText>
            <CatHeaderText theme={theme} $align="right">{t.vsPrevMonth}</CatHeaderText>
            <CatHeaderText theme={theme} $align="right">{t.vs12MAvg}</CatHeaderText>
          </CatHeaderRow>
          {visibleCats.map(([cat, data]) => {
            const pct = overview.currentTotal > 0 ? (data.amount / overview.currentTotal * 100) : 0;
            const dbKey = resolveTagKeyFromLocalized(cat, null, selectedFlow) || cat;
            const displayName = translateTag(dbKey, language, selectedFlow) || cat;
            const color = getCategoryColor(dbKey);
            const avgChange = data.avg12 > 0 ? ((data.amount - data.avg12) / data.avg12 * 100) : 0;
            return (
              <React.Fragment key={cat}>
                <CatRow theme={theme}>
                  <CatName>
                    <CatIcon $color={color} theme={theme}>{React.createElement(getCategoryIcon(dbKey), { size: 13 })}</CatIcon>
                    <div style={{ minWidth: 0 }}>
                      <CatLabel theme={theme}>{displayName}<CatPercent theme={theme}>{isHidden ? '' : `${pct.toFixed(0)}%`}</CatPercent></CatLabel>
                      <ProgressBar theme={theme}><ProgressFill $color={color} $percent={pct} /></ProgressBar>
                    </div>
                  </CatName>
                  <CatAmount theme={theme}>{isHidden ? '••••' : fmt(data.amount)}</CatAmount>
                  <div style={{ textAlign: 'right' }}>
                    <TrendBadge $trend={getTrend(data.mChange)} theme={theme}>
                      {getTrend(data.mChange) === 'up' ? <ArrowUpRight /> : getTrend(data.mChange) === 'down' ? <ArrowDownRight /> : <Minus />}
                      {isHidden ? '••' : formatPct(data.mChange)}
                    </TrendBadge>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <TrendBadge $trend={getTrend(avgChange)} theme={theme}>{isHidden ? '••' : formatPct(avgChange)}</TrendBadge>
                  </div>
                </CatRow>
                {!isHidden && Object.entries(data.subcategories || {})
                  .filter(([, amount]) => Number(amount) > 0)
                  .sort((a, b) => Number(b[1]) - Number(a[1]))
                  .map(([subCategory, subAmount]) => {
                    const subPct = data.amount > 0 ? (Number(subAmount) / data.amount * 100) : 0;
                    return (
                      <CatRow key={`${cat}-${subCategory}`} theme={theme} style={{ background: theme.mode === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)' }}>
                        <CatName style={{ paddingLeft: '1.25rem' }}>
                          <div style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: color,
                            opacity: 0.55,
                            flexShrink: 0,
                          }} />
                          <div style={{ minWidth: 0 }}>
                            <CatLabel theme={theme} style={{ fontSize: '0.78rem', fontWeight: 500, opacity: 0.82 }}>
                              ↳ {subCategory}
                              <CatPercent theme={theme}>{`${subPct.toFixed(0)}%`}</CatPercent>
                            </CatLabel>
                          </div>
                        </CatName>
                        <CatAmount theme={theme} style={{ fontSize: '0.78rem', opacity: 0.82 }}>{fmt(Number(subAmount))}</CatAmount>
                        <div />
                        <div />
                      </CatRow>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Payment Methods */}
      <SectionToggle theme={theme} onClick={() => setShowPayments(!showPayments)}>
        <SectionLabelStyled theme={theme}><CreditCard />{t.paymentMethodsTitle || (language === 'it' ? 'Metodi di Pagamento' : 'Payment Methods')}</SectionLabelStyled>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <SectionBadge theme={theme}>{sortedPayments.length}</SectionBadge>
          {showPayments ? <ChevronUp size={14} style={{ opacity: 0.4 }} /> : <ChevronDown size={14} style={{ opacity: 0.4 }} />}
        </div>
      </SectionToggle>

      {showPayments && (
        <div>
          {overview.subsCount > 0 && (
            <OverviewStrip theme={theme}>
              <OverviewCell theme={theme}>
                <CellLabel theme={theme}>{t.activeSubscriptions}</CellLabel>
                <CellValue theme={theme}>{isHidden ? '••••' : overview.subsCount}</CellValue>
              </OverviewCell>
              <OverviewCell theme={theme}>
                <CellLabel theme={theme}>{t.monthlyRecurringSpending}</CellLabel>
                <CellValue theme={theme}>{isHidden ? '••••' : fmt(overview.subsTotal)}</CellValue>
              </OverviewCell>
              <OverviewCell theme={theme}>
                <CellLabel theme={theme}>{t.budgetImpact}</CellLabel>
                <CellValue theme={theme}>{isHidden ? '••••' : overview.currentTotal > 0 ? `${(overview.subsTotal / overview.currentTotal * 100).toFixed(1)}%` : '0%'}</CellValue>
              </OverviewCell>
              <OverviewCell theme={theme} />
            </OverviewStrip>
          )}

          <FilterChipsRow theme={theme}>
            {paymentMetaList.map(({ key, displayName, color }) => (
              <FilterChip
                key={key}
                type="button"
                theme={theme}
                $active={!hiddenPaymentMethods.has(key)}
                $color={color}
                onClick={() => togglePaymentMethod(key)}
              >
                {displayName}
              </FilterChip>
            ))}
          </FilterChipsRow>

          {visiblePayments.length > 0 && (
            <ChartWrap>
              <div style={{ width: '100%', height: Math.max(120, visiblePayments.length * 30) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={paymentMetaList.filter(({ key }) => !hiddenPaymentMethods.has(key))}
                    margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="displayName"
                      width={100}
                      tick={{ fill: theme.textColor, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [isHidden ? '****' : formatAmount(value, { maximumFractionDigits: 0 }), '']}
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 12, color: '#333' }}
                    />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                      {paymentMetaList.filter(({ key }) => !hiddenPaymentMethods.has(key)).map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="total"
                        position="right"
                        formatter={(v) => (isHidden ? '****' : compactNumber(v))}
                        style={{ fontSize: 10, fill: theme.textColor, opacity: 0.8 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartWrap>
          )}

          <CatHeaderRow theme={theme}>
            <CatHeaderText theme={theme}>{language === 'it' ? 'Metodo' : 'Method'}</CatHeaderText>
            <CatHeaderText theme={theme} $align="right">{t.total}</CatHeaderText>
            <CatHeaderText theme={theme} $align="right">% {t.ofTotal}</CatHeaderText>
            <CatHeaderText theme={theme} $align="right">{t.transactions}</CatHeaderText>
          </CatHeaderRow>
          {visiblePayments.map(([key, data]) => {
            const pct = overview.currentTotal > 0 ? (data.total / overview.currentTotal * 100) : 0;
            return (
              <PaymentRow key={key} theme={theme}>
                <CatName>
                  <PaymentIconStyled theme={theme}>{getPaymentIcon(key)}</PaymentIconStyled>
                  <CatLabel theme={theme}>{data.name || key}</CatLabel>
                </CatName>
                <CatAmount theme={theme}>{isHidden ? '••••' : fmt(data.total)}</CatAmount>
                <CatAmount theme={theme}>{isHidden ? '••' : `${pct.toFixed(1)}%`}</CatAmount>
                <CatAmount theme={theme}>{isHidden ? '••' : data.count}</CatAmount>
              </PaymentRow>
            );
          })}
        </div>
      )}

      {/* Recurring This Month */}
      <SectionToggle theme={theme} onClick={() => setShowRecurringMonth(!showRecurringMonth)}>
        <SectionLabelStyled theme={theme}><Repeat />{t.recurringIdentifiedThisMonth || (language === 'it' ? 'Ricorrenti (mese)' : 'Recurring (month)')}</SectionLabelStyled>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <SectionBadge theme={theme}>{recurring.length}</SectionBadge>
          {showRecurringMonth ? <ChevronUp size={14} style={{ opacity: 0.4 }} /> : <ChevronDown size={14} style={{ opacity: 0.4 }} />}
        </div>
      </SectionToggle>

      {showRecurringMonth && (
        <div>
          {recurring.length === 0 ? (
            <SummaryFooter theme={theme}>
              {language === 'it' ? 'Nessun pagamento ricorrente identificato questo mese' : 'No recurring payments identified this month'}
            </SummaryFooter>
          ) : (
            <>
              {recurring.map((r, i) => (
                <RecurringItem key={i} theme={theme}>
                  <CatName>
                    <CatIcon $color={getCategoryColor(r.catKey)} theme={theme}>
                      {r.isSub ? <Repeat size={11} /> : React.createElement(getCategoryIcon(r.catKey), { size: 11 })}
                    </CatIcon>
                    <div style={{ minWidth: 0 }}>
                      <RecurringName theme={theme}>{r.category}</RecurringName>
                      {r.notes && <RecurringNote theme={theme}>{r.notes}</RecurringNote>}
                    </div>
                  </CatName>
                  <RecurringAmount theme={theme}>{isHidden ? '••••' : fmt(r.amount)}</RecurringAmount>
                  <FreqBadge theme={theme}>{r.frequency}x</FreqBadge>
                </RecurringItem>
              ))}
              <SummaryFooter theme={theme}>
                {language === 'it' ? 'Totale ricorrente:' : 'Total recurring:'} <strong>{isHidden ? '••••' : fmt(recurring.reduce((s, r) => s + r.amount, 0))}</strong>
              </SummaryFooter>
            </>
          )}
        </div>
      )}

      {/* Recurring 12M */}
      <SectionToggle theme={theme} onClick={() => setShowRecurring12M(!showRecurring12M)}>
        <SectionLabelStyled theme={theme}><Calendar />{t.recurringIdentifiedLast12M || (language === 'it' ? 'Ricorrenti (12 mesi)' : 'Recurring (12 months)')}</SectionLabelStyled>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <SectionBadge theme={theme}>{recurring12M.length}</SectionBadge>
          {showRecurring12M ? <ChevronUp size={14} style={{ opacity: 0.4 }} /> : <ChevronDown size={14} style={{ opacity: 0.4 }} />}
        </div>
      </SectionToggle>

      {showRecurring12M && (
        <div>
          {recurring12M.length === 0 ? (
            <SummaryFooter theme={theme}>
              {language === 'it' ? 'Nessun pagamento ricorrente negli ultimi 12 mesi' : 'No recurring payments in the last 12 months'}
            </SummaryFooter>
          ) : (
            <>
              {recurring12M.map((r, i) => (
                <RecurringItem key={i} theme={theme}>
                  <CatName>
                    <CatIcon $color={getCategoryColor(r.catKey)} theme={theme}>
                      {r.isSub ? <Repeat size={11} /> : React.createElement(getCategoryIcon(r.catKey), { size: 11 })}
                    </CatIcon>
                    <div style={{ minWidth: 0 }}>
                      <RecurringName theme={theme}>{r.category}</RecurringName>
                      {r.notes && <RecurringNote theme={theme}>{r.notes}</RecurringNote>}
                    </div>
                  </CatName>
                  <RecurringAmount theme={theme}>{isHidden ? '••••' : fmt(r.amount)}</RecurringAmount>
                  <FreqBadge theme={theme}>{r.frequency}x</FreqBadge>
                </RecurringItem>
              ))}
              <SummaryFooter theme={theme}>
                {language === 'it' ? `Media mensile su ${recurring12M.length} ricorrenti` : `Monthly avg across ${recurring12M.length} recurring`}
              </SummaryFooter>
            </>
          )}
        </div>
      )}
    </Container>
  );
}
