import React, { useEffect, useState, useContext, useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight, Minus, ArrowRightLeft } from 'lucide-react';
import styled from 'styled-components';
import { getTotalOutflowsCurrentMonth, getTotalIncomesCurrentMonth, getTotalSavedCurrentMonth } from '../utils/userDataSelectors';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';

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

const PeriodLabel = styled.span`
  font-size: 0.78rem;
  font-weight: 500;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
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

/* ─── Comparison Table ─── */

const ComparisonTable = styled.div`
  padding: 0;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.4rem 0.75rem;
  background: ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(0, 0, 0, 0.015)'
  };
  border-bottom: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : 'rgba(0, 0, 0, 0.03)'
  };

  @media (max-width: 768px) {
    padding: 0.35rem 0.5rem;
  }
`;

const TableHeaderCell = styled.div`
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'};
  text-align: ${p => p.$align || 'left'};

  @media (max-width: 768px) {
    font-size: 0.6rem;
  }
`;

const ComparisonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.5rem 0.75rem;
  align-items: center;
  transition: background 0.15s ease;

  &:not(:last-child) {
    border-bottom: 1px solid ${p => p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)'
    };
  }

  &:hover {
    background: ${p => p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.015)'
    };
  }

  @media (max-width: 768px) {
    padding: 0.45rem 0.5rem;
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

const ChangeCell = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
`;

const ChangeAmount = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${p => p.$isPositive ? '#27ae60' : p.$isNeutral ? (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)') : '#e74c3c'};
  display: flex;
  align-items: center;
  gap: 0.15rem;

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 0.72rem;
  }
`;

const ChangePercent = styled.span`
  font-size: 0.68rem;
  font-weight: 500;
  color: ${p => p.$isPositive ? 'rgba(39, 174, 96, 0.7)' : p.$isNeutral ? (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : 'rgba(231, 76, 60, 0.7)'};

  @media (max-width: 768px) {
    font-size: 0.6rem;
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

/* ─── Component ─── */

function InOutStats({ theme, userData, isHidden }) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const fmt = (val) => formatAmount(val, { maximumFractionDigits: 0 });

  const [data, setData] = useState({
    incomesCurrent: 0, outflowsCurrent: 0, savedCurrent: 0,
    incomesMonth: 0, outflowsMonth: 0, savedMonth: 0,
    incomesYear: 0, outflowsYear: 0, savedYear: 0,
  });

  useEffect(() => {
    if (!userData) return;
    try {
      const ic = getTotalIncomesCurrentMonth(userData);
      const oc = getTotalOutflowsCurrentMonth(userData);
      const sc = getTotalSavedCurrentMonth(userData);
      
      const im = userData?.incomesArray?.[1] || 0;
      const om = userData?.outflowsArray?.[1] || 0;
      const sm = im - om;

      const iy = userData?.incomesArray?.[12] || 0;
      const oy = userData?.outflowsArray?.[12] || 0;
      const sy = iy - oy;
      
      setData({
        incomesCurrent: ic, outflowsCurrent: oc, savedCurrent: sc,
        incomesMonth: im, outflowsMonth: om, savedMonth: sm,
        incomesYear: iy, outflowsYear: oy, savedYear: sy,
      });
    } catch (e) {
      console.error("Error computing stats:", e);
    }
  }, [userData]);

  const t = translations?.graphs?.financialOverview || {};
  const tGeneral = translations?.general || {};

  // Period labels
  const periodLabels = useMemo(() => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYear = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const locale = language === 'it' ? 'it-IT' : 'en-US';
    return {
      month: `vs ${prevMonth.toLocaleDateString(locale, { month: 'short', year: '2-digit' })}`,
      year: `vs ${prevYear.toLocaleDateString(locale, { month: 'short', year: '2-digit' })}`,
    };
  }, [language]);

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

  const renderChange = (current, comparison, type) => {
    const diff = current - comparison;
    const positive = isPositiveChange(current, comparison, type);
    const pct = getCleanPercentage(current, comparison, type);
    const isNeutral = positive === null;

    const sign = diff >= 0 ? '+' : '';
    const formattedDiff = `${sign}${fmt(Math.abs(diff))}`;
    const formattedPct = pct !== null ? `${pct > 0 ? '+' : ''}${pct}%` : 'N/A';
    
    const TrendIcon = isNeutral ? Minus : positive ? ArrowUpRight : ArrowDownRight;

    return (
      <ChangeCell>
        <ChangeAmount $isPositive={positive} $isNeutral={isNeutral} theme={theme}>
          <TrendIcon />
          {isHidden ? '••••' : formattedDiff}
        </ChangeAmount>
        <ChangePercent $isPositive={positive} $isNeutral={isNeutral} theme={theme}>
          {isHidden ? '••••' : formattedPct}
        </ChangePercent>
      </ChangeCell>
    );
  };

  return (
    <Container theme={theme}>
      {/* Header */}
      <Header theme={theme}>
        <HeaderTitle theme={theme}>
          <ArrowRightLeft />
          {t.title || 'Financial Overview'}
        </HeaderTitle>
        <PeriodLabel theme={theme}>
          {t.currentMonth || 'Current month'}
        </PeriodLabel>
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

      {/* Comparison table */}
      <ComparisonTable>
        <TableHeader theme={theme}>
          <TableHeaderCell theme={theme}></TableHeaderCell>
          <TableHeaderCell theme={theme} $align="right">
            {periodLabels.month}
          </TableHeaderCell>
          <TableHeaderCell theme={theme} $align="right">
            {periodLabels.year}
          </TableHeaderCell>
        </TableHeader>

        {metrics.map(m => (
          <ComparisonRow key={m.key} theme={theme}>
            <MetricName theme={theme}>
              <ColorDot $color={m.color} />
              {m.label}
            </MetricName>
            {renderChange(m.current, m.prevMonth, m.type)}
            {renderChange(m.current, m.prevYear, m.type)}
          </ComparisonRow>
        ))}
      </ComparisonTable>
    </Container>
  );
}

export default React.memo(InOutStats);
