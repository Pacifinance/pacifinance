import React, { useEffect, useState, useContext, useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight, Minus, ArrowRightLeft } from 'lucide-react';
import styled from 'styled-components';
import { BarChart } from 'recharts/lib/chart/BarChart';
import { Bar } from 'recharts/lib/cartesian/Bar';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { Cell } from 'recharts/lib/component/Cell';
import { LabelList } from 'recharts/lib/component/LabelList';
import { getEntriesForMonthKey, indexToMonthKey, monthKeyToIndex } from '../utils/userDataSelectors';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import { compactNumber } from '../utils/customGraphsInfo.jsx';

/* ─── Styled Components ─── */

const Container = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.92)'
  };
  border: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${p => p.theme.mode === 'dark'
      ? '0 6px 20px rgba(0, 0, 0, 0.25)'
      : '0 6px 20px rgba(0, 0, 0, 0.06)'
    };
  }

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const Header = styled.div`
  padding: 0.85rem 1rem 0.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'
  };

  @media (max-width: 768px) {
    padding: 0.7rem 0.75rem 0.5rem;
  }
`;

const HeaderTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    font-size: 0.88rem;
  }
`;

/* ─── Summary Row (top 3 cells) ─── */

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'
  };
`;

const SummaryCell = styled.div`
  padding: 0.7rem 0.75rem;
  text-align: center;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    height: 60%;
    width: 1px;
    background: ${p => p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.04)'
    };
  }

  @media (max-width: 768px) {
    padding: 0.55rem 0.4rem;
  }
`;

const SummaryCellLabel = styled.div`
  font-size: 0.73rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${p => p.$color || (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)')};
  margin-bottom: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.65rem;
  }
`;

const SummaryCellValue = styled.div`
  font-size: 1.08rem;
  font-weight: 700;
  color: ${p => p.theme.textColor};
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 0.92rem;
  }
`;

const MetricChartCell = styled.div`
  padding: 0.6rem 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 10%;
    height: 80%;
    width: 1px;
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'};
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.4rem 0.6rem;
  }
`;

const MetricName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};

  @media (max-width: 768px) {
    font-size: 0.78rem;
    gap: 0.25rem;
  }
`;

const ColorDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${p => p.$color};
  flex-shrink: 0;
`;

const CaptionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.5rem;
`;

const ChangeAmount = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${p => p.$isPositive ? '#27ae60' : p.$isNeutral ? (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)') : '#e74c3c'};
  display: flex;
  align-items: center;
  gap: 0.2rem;

  svg {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
  }

  span {
    font-weight: 400;
    opacity: 0.55;
    color: ${p => p.theme.textColor};
  }

  @media (max-width: 768px) {
    font-size: 0.64rem;
  }
`;

/* ─── Helper functions ─── */

function getCleanPercentage(currentValue, previousValue, type) {
  if (isNaN(currentValue) || isNaN(previousValue) || previousValue === 0 || 
      currentValue === null || previousValue === null) {
    return null;
  }

  if (type === 'saved') {
    const diff = currentValue - previousValue;
    if ((currentValue >= 0 && previousValue >= 0) || (currentValue < 0 && previousValue < 0)) {
      return ((diff / Math.abs(previousValue)) * 100).toFixed(1);
    }
    const absPct = ((Math.abs(diff) / Math.abs(previousValue)) * 100).toFixed(1);
    return diff > 0 ? absPct : -absPct;
  }

  return (((currentValue - previousValue) / previousValue) * 100).toFixed(1);
}

function isPositiveChange(current, comparison, type) {
  if (current === comparison) return null; // neutral
  if (type === 'income' || type === 'saved') return current > comparison;
  return current < comparison; // outflows: less is better
}

/** hex -> rgba string, so the same metric color can fade in across the three bars. */
function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ─── Component ─── */

const sumEntries = (userData, monthKey, flow) => {
  const entries = getEntriesForMonthKey(userData, monthKey, flow);
  return entries === null ? null : entries.reduce((s, e) => s + (Number(e?.amount) || 0), 0);
};

function InOutStats({ theme, userData, isHidden }) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const { fetchMonthDetail } = useContext(UserContext) || {};
  const fmt = (val) => formatAmount(val);

  const [selectedMonth, setSelectedMonth] = useState(() => indexToMonthKey(0));
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const maxMonth = indexToMonthKey(0);
  const minMonth = indexToMonthKey(120);

  const prevMonthKey = indexToMonthKey(monthKeyToIndex(selectedMonth) + 1);
  const prevYearKey = indexToMonthKey(monthKeyToIndex(selectedMonth) + 12);

  // Fetches whichever of the three months (selected / -1 / -12) isn't already
  // loaded, on demand (see fetchMonthDetail in UserContext).
  useEffect(() => {
    if (!userData || !fetchMonthDetail) return;
    const keys = [...new Set([selectedMonth, prevMonthKey, prevYearKey])]
      .filter((key) => getEntriesForMonthKey(userData, key, 'incomes') === null || getEntriesForMonthKey(userData, key, 'outflows') === null);
    if (keys.length === 0) return;
    setIsLoadingMonth(true);
    Promise.all(keys.map((key) => {
      const [y, m] = key.split('-').map(Number);
      return fetchMonthDetail(y, m);
    })).finally(() => setIsLoadingMonth(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, selectedMonth, prevMonthKey, prevYearKey]);

  const data = useMemo(() => {
    if (!userData) return null;
    const ic = sumEntries(userData, selectedMonth, 'incomes');
    const oc = sumEntries(userData, selectedMonth, 'outflows');
    const im = sumEntries(userData, prevMonthKey, 'incomes');
    const om = sumEntries(userData, prevMonthKey, 'outflows');
    const iy = sumEntries(userData, prevYearKey, 'incomes');
    const oy = sumEntries(userData, prevYearKey, 'outflows');
    return {
      incomesCurrent: ic ?? 0, outflowsCurrent: oc ?? 0, savedCurrent: (ic ?? 0) - (oc ?? 0),
      incomesMonth: im, outflowsMonth: om, savedMonth: im !== null && om !== null ? im - om : null,
      incomesYear: iy, outflowsYear: oy, savedYear: iy !== null && oy !== null ? iy - oy : null,
    };
  }, [userData, selectedMonth, prevMonthKey, prevYearKey]);

  const tGeneral = translations?.general || {};

  // Short, locale-aware labels for each of the three periods shown per metric
  // (mini bar chart x-axis + "vs X" captions).
  const monthShortLabels = useMemo(() => {
    const shortLabel = (key) => {
      const [y, m] = key.split('-').map(Number);
      const locale = language === 'it' ? 'it-IT' : 'en-US';
      return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'short', year: '2-digit' });
    };
    return {
      year: shortLabel(prevYearKey),
      month: shortLabel(prevMonthKey),
      current: shortLabel(selectedMonth),
    };
  }, [language, selectedMonth, prevMonthKey, prevYearKey]);

  if (!data) return null;

  const selectedMonthLabel = (() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const locale = language === 'it' ? 'it-IT' : 'en-US';
    const label = new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  })();

  const metrics = [
    {
      key: 'income',
      label: tGeneral.incomes || 'Incomes',
      color: '#27ae60',
      current: data.incomesCurrent,
      prevMonth: data.incomesMonth,
      prevYear: data.incomesYear,
      type: 'income',
    },
    {
      key: 'outflow',
      label: tGeneral.outflows || 'Outflows',
      color: '#e74c3c',
      current: data.outflowsCurrent,
      prevMonth: data.outflowsMonth,
      prevYear: data.outflowsYear,
      type: 'expense',
    },
    {
      key: 'saved',
      label: tGeneral.saved || 'Saved',
      color: '#3498db',
      current: data.savedCurrent,
      prevMonth: data.savedMonth,
      prevYear: data.savedYear,
      type: 'saved',
    },
  ];

  const renderCaption = (current, comparison, type, label) => {
    if (comparison === null) return null; // that period hasn't loaded yet
    const positive = isPositiveChange(current, comparison, type);
    const pct = getCleanPercentage(current, comparison, type);
    const isNeutral = positive === null;
    const TrendIcon = isNeutral ? Minus : positive ? ArrowUpRight : ArrowDownRight;
    const formattedPct = pct !== null ? `${pct > 0 ? '+' : ''}${pct}%` : 'N/A';

    return (
      <ChangeAmount $isPositive={positive} $isNeutral={isNeutral} theme={theme}>
        <TrendIcon />
        {isHidden ? '••••' : formattedPct}
        <span>vs {label}</span>
      </ChangeAmount>
    );
  };

  return (
    <Container theme={theme}>
      {/* Header */}
      <Header theme={theme}>
        {/* The section title ("Panoramica Finanziaria") is already shown by the
            page above this card - repeating it here would be redundant, so this
            shows the actually-useful bit: which month is being viewed. */}
        <HeaderTitle theme={theme}>
          <ArrowRightLeft />
          {selectedMonthLabel}
        </HeaderTitle>
        <input
          type="month"
          value={selectedMonth}
          min={minMonth}
          max={maxMonth}
          onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
          style={{
            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 6,
            padding: '0.2rem 0.4rem',
            fontSize: '0.72rem',
            fontWeight: 500,
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
            color: theme.textColor,
            colorScheme: theme.mode === 'dark' ? 'dark' : 'light',
            opacity: isLoadingMonth ? 0.6 : 1,
          }}
        />
      </Header>

      {/* Summary: current values */}
      <SummaryRow theme={theme}>
        {metrics.map(m => (
          <SummaryCell key={m.key} theme={theme}>
            <SummaryCellLabel $color={m.color} theme={theme}>
              {m.label}
            </SummaryCellLabel>
            <SummaryCellValue theme={theme}>
              {isHidden ? '••••' : fmt(m.current)}
            </SummaryCellValue>
          </SummaryCell>
        ))}
      </SummaryRow>

      {/* Per-metric mini bar chart: Anno prec. -> Mese prec. -> Mese selezionato */}
      <SummaryRow theme={theme}>
        {metrics.map(m => {
          const chartData = [
            { key: 'year', label: monthShortLabels.year, value: m.prevYear ?? 0 },
            { key: 'month', label: monthShortLabels.month, value: m.prevMonth ?? 0 },
            { key: 'current', label: monthShortLabels.current, value: m.current },
          ];
          return (
            <MetricChartCell key={m.key} theme={theme}>
              <MetricName theme={theme} style={{ fontSize: '0.72rem', marginBottom: 2 }}>
                <ColorDot $color={m.color} />
                {m.label}
              </MetricName>
              <div style={{ width: '100%', height: 90 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 16, right: 2, left: 2, bottom: 0 }}>
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.textColor, fontSize: 9, opacity: 0.6 }}
                    />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                      {chartData.map((entry, i) => (
                        <Cell key={entry.key} fill={hexToRgba(m.color, [0.4, 0.7, 1][i])} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(v) => (isHidden ? '••' : compactNumber(v))}
                        style={{ fontSize: 9, fill: theme.textColor, opacity: 0.75 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <CaptionStack theme={theme}>
                {renderCaption(m.current, m.prevMonth, m.type, monthShortLabels.month)}
                {renderCaption(m.current, m.prevYear, m.type, monthShortLabels.year)}
              </CaptionStack>
            </MetricChartCell>
          );
        })}
      </SummaryRow>
    </Container>
  );
}

export default React.memo(InOutStats);
