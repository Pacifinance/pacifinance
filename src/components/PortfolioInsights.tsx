/**
 * PortfolioInsights — adaptive analysis for a holdings category (or the whole
 * portfolio): total invested/current, gain/loss, best/worst position,
 * average monthly contribution, and — when a goal is linked to this asset
 * key — a progress bar with an ETA estimate.
 *
 * "Adaptive" is the whole point: every figure here depends on how much the
 * user has actually recorded (current_value history requires using "Refresh
 * prices" or entering values by hand — CSV import alone never backfills it).
 * Rather than fake a number or hide the section entirely, each part either
 * shows its real value or an honest, specific hint about what's missing and
 * why providing it would unlock a better estimate — nudging the user toward
 * the data entry that actually improves their own analysis.
 */
import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import {
  summarizeHoldings, estimateMonthlyContribution, estimateMonthlyGrowthRate, projectGoalETA,
} from '../utils/investmentAnalytics';
import type { InvestmentHoldingDto, InvestmentHoldingHistoryDto, GoalDto, AssetKey } from '../types/api';

interface PortfolioInsightsProps {
  theme: any;
  holdings: InvestmentHoldingDto[];
  history: InvestmentHoldingHistoryDto[];
  goals: GoalDto[];
  assetKey: AssetKey | null;
  isHidden: boolean;
}

const Card = styled.div`
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
  border-radius: 14px;
  padding: 1.1rem 1.2rem;
  margin-top: 1rem;
`;

const Title = styled.h4`
  margin: 0 0 0.85rem 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${(p) => p.theme.textColor};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.9rem;
  margin-bottom: 0.9rem;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  .label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    opacity: 0.55;
    color: ${(p) => p.theme.textColor};
  }

  .value {
    font-size: 1.05rem;
    font-weight: 700;
    color: ${(p) => p.theme.textColor};
  }

  .value.muted { opacity: 0.55; font-weight: 500; font-size: 0.9rem; }
  .value.positive { color: #10b981; }
  .value.negative { color: #ef4444; }
`;

const Hint = styled.p`
  font-size: 0.78rem;
  font-style: italic;
  opacity: 0.65;
  color: ${(p) => p.theme.textColor};
  margin: 0.3rem 0;
  line-height: 1.4;
`;

const BestWorstRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.2rem;
  font-size: 0.82rem;
  color: ${(p) => p.theme.textColor};
  margin-bottom: 0.6rem;

  strong { font-weight: 700; }
  .positive { color: #10b981; }
  .negative { color: #ef4444; }
`;

const GoalSection = styled.div`
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px dashed ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};

  h5 {
    margin: 0 0 0.5rem 0;
    font-size: 0.88rem;
    font-weight: 600;
    color: ${(p) => p.theme.textColor};
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
  overflow: hidden;
  margin-bottom: 0.4rem;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  border-radius: 5px;
  width: ${(p) => Math.min(100, Math.max(0, p.$pct))}%;
  background: ${(p) => p.theme.buttonBackgroundColor || '#079164'};
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${(p) => p.theme.textColor};
  margin-bottom: 0.4rem;

  strong { font-weight: 700; }
`;

function formatMonthsHuman(months: number, t: Record<string, string>): string {
  if (months < 1) return t.lessThanAMonth || 'less than a month';
  if (months < 12) return (t.monthsCount || '{count} months').replace('{count}', String(months));
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const yearsText = (t.yearsCount || '{count} years').replace('{count}', String(years));
  if (remMonths === 0) return yearsText;
  return `${yearsText}, ${(t.monthsCount || '{count} months').replace('{count}', String(remMonths))}`;
}

export default function PortfolioInsights({ theme, holdings, history, goals, assetKey, isHidden }: PortfolioInsightsProps) {
  const { translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const t = translations.graphs.statsHoldings.insights || {};

  const summary = useMemo(() => summarizeHoldings(holdings, assetKey), [holdings, assetKey]);
  const contribution = useMemo(() => estimateMonthlyContribution(history, assetKey), [history, assetKey]);
  const growth = useMemo(() => estimateMonthlyGrowthRate(history, assetKey), [history, assetKey]);

  const linkedGoal = assetKey ? goals.find((g) => g.linkedAssetKey === assetKey) : undefined;
  const goalProjection = linkedGoal
    ? projectGoalETA({
      currentValue: summary.totalCurrent,
      targetValue: linkedGoal.targetValue,
      monthlyContribution: contribution.monthlyAverage,
      monthlyGrowthRate: growth.monthlyRate,
    })
    : null;

  if (summary.count === 0) return null;

  const missingPieces: string[] = [];
  if (!summary.hasRealCurrentValue) missingPieces.push(t.missingCurrentValue || 'real current values (use "Refresh prices" or enter them by hand)');
  if (contribution.monthlyAverage == null) missingPieces.push(t.missingContribution || 'at least 2 months of history');
  if (linkedGoal && goalProjection && !goalProjection.usedGrowthRate) missingPieces.push(t.missingGrowthHistory || 'at least 2 months of real current values, to estimate market growth');

  return (
    <Card theme={theme}>
      <Title theme={theme}>{t.title || 'Portfolio insights'}</Title>

      <StatsGrid>
        <Stat theme={theme}>
          <span className="label">{t.totalInvested || 'Total invested'}</span>
          <span className="value">{isHidden ? '****' : formatAmount(summary.totalInvested)}</span>
        </Stat>
        <Stat theme={theme}>
          <span className="label">{summary.hasRealCurrentValue ? (t.totalCurrent || 'Current value') : (t.totalCurrentCostBasis || 'Current value (cost basis)')}</span>
          <span className={`value ${summary.hasRealCurrentValue ? '' : 'muted'}`}>{isHidden ? '****' : formatAmount(summary.totalCurrent)}</span>
        </Stat>
        {summary.hasRealCurrentValue && summary.gain != null && summary.gainPct != null && (
          <Stat theme={theme}>
            <span className="label">{t.gainLoss || 'Gain/loss'}</span>
            <span className={`value ${summary.gain >= 0 ? 'positive' : 'negative'}`}>
              {isHidden ? '****' : `${summary.gain >= 0 ? '+' : ''}${formatAmount(summary.gain)} (${summary.gain >= 0 ? '+' : ''}${summary.gainPct.toFixed(1)}%)`}
            </span>
          </Stat>
        )}
      </StatsGrid>

      {summary.best && summary.worst && summary.best.symbol !== summary.worst.symbol && !isHidden && (
        <BestWorstRow theme={theme}>
          <span>{t.bestPosition || 'Best'}: <strong className="positive">{summary.best.symbol} ({summary.best.gainPct >= 0 ? '+' : ''}{summary.best.gainPct.toFixed(1)}%)</strong></span>
          <span>{t.worstPosition || 'Worst'}: <strong className="negative">{summary.worst.symbol} ({summary.worst.gainPct >= 0 ? '+' : ''}{summary.worst.gainPct.toFixed(1)}%)</strong></span>
        </BestWorstRow>
      )}

      {contribution.monthlyAverage != null ? (
        <Hint theme={theme} style={{ fontStyle: 'normal', opacity: 0.85 }}>
          {(t.monthlyContribution || 'Average invested: {amount}/month').replace('{amount}', isHidden ? '****' : formatAmount(contribution.monthlyAverage))}
        </Hint>
      ) : (
        <Hint theme={theme}>{t.contributionHint || 'Keep recording months of history to see your average monthly contribution.'}</Hint>
      )}

      {linkedGoal && goalProjection && (
        <GoalSection theme={theme}>
          <h5>{(t.goalTitle || 'Goal: {name}').replace('{name}', linkedGoal.name)}</h5>
          <ProgressLabel theme={theme}>
            <span>{isHidden ? '****' : formatAmount(summary.totalCurrent)}</span>
            <strong>{isHidden ? '****' : formatAmount(linkedGoal.targetValue)}</strong>
          </ProgressLabel>
          <ProgressTrack theme={theme}>
            <ProgressFill theme={theme} $pct={(summary.totalCurrent / linkedGoal.targetValue) * 100} />
          </ProgressTrack>
          {goalProjection.alreadyReached ? (
            <Hint theme={theme} style={{ fontStyle: 'normal' }}>{t.goalReached || 'Goal reached! 🎉'}</Hint>
          ) : goalProjection.reachable && goalProjection.months != null ? (
            <>
              <Hint theme={theme} style={{ fontStyle: 'normal', opacity: 0.85 }}>
                {(t.goalETA || 'Estimated time to reach it: {time}').replace('{time}', formatMonthsHuman(goalProjection.months, t))}
              </Hint>
              <Hint theme={theme}>{goalProjection.usedGrowthRate ? (t.etaWithGrowth || 'Includes an estimated market growth rate.') : (t.etaConservative || 'Conservative estimate: contributions only, no market growth assumed yet.')}</Hint>
            </>
          ) : (
            <Hint theme={theme}>{t.etaUnreachable || "At the current pace this goal isn't on track — consider increasing contributions."}</Hint>
          )}
        </GoalSection>
      )}

      {missingPieces.length > 0 && (
        <Hint theme={theme}>
          {(t.unlockMoreHint || 'Unlock a more detailed analysis: {items}.').replace('{items}', missingPieces.join(', '))}
        </Hint>
      )}
    </Card>
  );
}
