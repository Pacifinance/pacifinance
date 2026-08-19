import React, { useContext, useEffect, useState } from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { Section } from '../styles/MyStyled';
import {
    getTotalValue,
    getPercentageRankOnBalanceSimilar,
    getPercentageRankOnIncomesSimilar,
    getPercentageRankOnOutflowsSimilar,
    getIncomesArray,
    getOutflowsArray,
    getBalanceGrowth12Months,
    getProfileCompletionPercentage,
    getTotalOutflowsParentCategoryPerMonth,
    getAveragesAllSavingsRates,
    getAveragesSimilarSavingsRates,
    getAveragesSimilarExpensesByCategory
} from '../utils/userDataSelectors';
import InfoIcon from '@mui/icons-material/Info';
import { resolveTagKeyFromLocalized, translateTag } from '../data/tagTranslations';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualIcon from '@mui/icons-material/DragHandle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PublicIcon from '@mui/icons-material/Public';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import MapIcon from '@mui/icons-material/Map';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Tooltip from '@mui/material/Tooltip';
import styled, { keyframes } from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useServices } from '../contexts/ServiceContext';
import { useDeployment } from '../contexts/DeploymentContext';
import { getCategoryColor } from '../data/categoryColors';

/**
 * Comparison — an anonymous "mirror", not a leaderboard. The page never
 * shows another individual user's data (server-side privacy floor is
 * MIN_COHORT=20 participants, enforced by server/src/services/similarUsers.ts
 * and customBenchmark.ts — see docs referenced in AGENTS.md/todo.md): every
 * number here is either the user's own, or an aggregate (percentile/median)
 * over an anonymous group. The page leads with a small number of plain-
 * language insights about the user's own situation, and keeps every raw
 * number one tap away in a collapsed accordion instead of showing a dense
 * grid of stats up front.
 */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const drawArc = keyframes`
  from { stroke-dashoffset: var(--arc-full); }
  to { stroke-dashoffset: var(--arc-offset); }
`;

const DEFAULT_FACTOR_GROUPS = ['career', 'location', 'lifeStage', 'household'];

/** Title/description for the benchmark opt-in card: a self-hosted instance's
 * cohort is only its own users (no cross-instance network exists yet - see
 * docs/COMMUNITY_STATS_PROTOCOL.md), so it gets honest, different copy
 * instead of the hosted-community wording. Extracted as a pure function so
 * it's testable without mounting the whole Comparison component. */
export const getBenchmarkOptInCopy = (selfHosted, benchmarkOverview) => (
  selfHosted
    ? {
      title: benchmarkOverview?.optInTitleSelfHosted || 'Unlock comparison with other users of this instance',
      description: benchmarkOverview?.optInDescriptionSelfHosted || 'Enable consent to compare against other users of this self-hosted instance only. Cross-instance community comparison is a planned feature, not available yet. We never share transactions, notes, or identity.'
    }
    : {
      title: benchmarkOverview?.optInTitle || 'Unlock comparison with similar users',
      description: benchmarkOverview?.optInDescription || 'Enable consent to receive aggregated benchmarks. We never share transactions, notes, or identity.'
    }
);

/* ─── Layout ─── */

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 1.25rem 1rem 6rem;

  @media (max-width: 768px) {
    gap: 1.25rem;
    padding: 0.75rem 0.75rem 4rem;
  }
`;

/* ─── Hero ─── */

const HeroCard = styled.section`
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 2.25rem 1.5rem 1.75rem;
  border-radius: 24px;
  background: ${p => p.theme.mode === 'dark'
    ? 'linear-gradient(160deg, rgba(7,145,100,0.14) 0%, rgba(15,23,42,0.55) 55%)'
    : 'linear-gradient(160deg, rgba(7,145,100,0.09) 0%, rgba(255,255,255,0.92) 55%)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'};
  box-shadow: ${p => p.theme.mode === 'dark' ? '0 20px 60px rgba(0,0,0,0.35)' : '0 14px 40px rgba(15,23,42,0.08)'};

  &::before {
    content: '';
    position: absolute;
    top: -60%;
    right: -20%;
    width: 60%;
    height: 220%;
    background: radial-gradient(circle, ${p => p.theme.buttonBackgroundColor}22 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 600px) {
    padding: 1.75rem 1rem 1.25rem;
    border-radius: 18px;
  }
`;

const HeroEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.32rem 0.75rem;
  border-radius: 999px;
  background: ${p => p.theme.buttonBackgroundColor}18;
  color: ${p => p.theme.buttonBackgroundColor};
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 1rem;
`;

const HeroTitle = styled.h1`
  margin: 0 0 0.5rem;
  font-size: clamp(1.6rem, 3.2vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  background: ${p => p.theme.mode === 'dark'
    ? `linear-gradient(135deg, #ffffff 0%, #ffffff 55%, ${p.theme.buttonBackgroundColor} 100%)`
    : `linear-gradient(135deg, #0f172a 0%, #0f172a 55%, ${p.theme.buttonBackgroundColor} 100%)`};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroSubtitle = styled.p`
  margin: 0 auto 1.5rem;
  max-width: 480px;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.68)'};
  font-size: 0.98rem;
  line-height: 1.5;
`;

const GaugeFigure = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  animation: ${fadeInUp} 0.5s ease-out both;
`;

const GaugeValue = styled.div`
  position: absolute;
  top: 54%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;

  strong {
    font-size: 2.1rem;
    font-weight: 800;
    color: ${p => p.theme.textColor};
    line-height: 1;
  }
  span {
    margin-top: 0.2rem;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.5)'};
  }
`;

const GaugeCaption = styled.p`
  margin: 0;
  max-width: 320px;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.62)' : 'rgba(15,23,42,0.58)'};
  font-size: 0.82rem;
  line-height: 1.45;
`;

const HeadlineChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1.5rem;
`;

const HeadlineChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem;
  border-radius: 14px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'};
  animation: ${fadeInUp} 0.45s ease-out both;
  animation-delay: ${p => p.$delay || '0s'};

  svg { font-size: 1.15rem; color: ${p => p.theme.buttonBackgroundColor}; }

  .chip-value { font-weight: 800; font-size: 0.98rem; color: ${p => p.theme.textColor}; }
  .chip-label { font-size: 0.74rem; color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)'}; }
`;

const HeroCTA = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.4rem;
  padding: 0.75rem 1.4rem;
  border: 0;
  border-radius: 12px;
  background: ${p => p.theme.buttonBackgroundColor};
  color: white;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 10px 24px ${p => p.theme.buttonBackgroundColor}35;

  &:hover:not(:disabled) { transform: translateY(-1px); }
  &:disabled { opacity: 0.65; cursor: wait; }
`;

/* ─── Insight cards ─── */

const InsightList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const InsightCard = styled.div`
  display: flex;
  gap: 0.8rem;
  padding: 1rem 1.1rem;
  border-radius: 14px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.035)' : '#ffffff'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)'};
  border-left: 3px solid ${p => p.$tone === 'warning' ? '#f59e0b' : p.theme.buttonBackgroundColor};
  animation: ${fadeInUp} 0.4s ease-out both;

  .insight-icon {
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p => (p.$tone === 'warning' ? '#f59e0b' : p.theme.buttonBackgroundColor)}18;
    color: ${p => p.$tone === 'warning' ? '#f59e0b' : p.theme.buttonBackgroundColor};
    svg { font-size: 1.1rem; }
  }
  h4 { margin: 0 0 0.2rem; font-size: 0.92rem; font-weight: 700; color: ${p => p.theme.textColor}; }
  p { margin: 0; font-size: 0.84rem; line-height: 1.5; color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.68)'}; }
`;

/* ─── Profile nudge ─── */

const ProfileNudge = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem 1.1rem;
  border-radius: 14px;
  border: 1px dashed ${p => p.theme.buttonBackgroundColor}55;
  background: ${p => p.theme.buttonBackgroundColor}0d;
  color: ${p => p.theme.textColor};
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;

  &:hover { background: ${p => p.theme.buttonBackgroundColor}18; }

  .nudge-icon {
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p => p.theme.buttonBackgroundColor};
    color: white;
    svg { font-size: 1.1rem; }
  }
  strong { display: block; font-size: 0.86rem; }
  span { display: block; font-size: 0.78rem; opacity: 0.72; margin-top: 0.1rem; }
  .nudge-arrow { margin-left: auto; flex: 0 0 auto; opacity: 0.6; }
`;

/* ─── Accordion ─── */

const SectionLabel = styled.h2`
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.42)'};
`;

const AccordionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const AccordionItem = styled.div`
  border-radius: 16px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.035)' : '#ffffff'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)'};
  overflow: hidden;
  transition: border-color 0.2s ease;
`;

const AccordionHeader = styled.button`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 1rem 1.1rem;
  background: none;
  border: 0;
  cursor: pointer;
  text-align: left;

  .accordion-icon {
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${p => p.theme.buttonBackgroundColor}, ${p => p.theme.buttonBackgroundColor}bb);
    color: white;
    svg { font-size: 1.15rem; }
  }
  .accordion-copy { flex: 1; min-width: 0; }
  .accordion-copy strong { display: block; font-size: 0.94rem; color: ${p => p.theme.textColor}; }
  .accordion-copy span { display: block; font-size: 0.78rem; margin-top: 0.15rem; color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .accordion-chevron {
    flex: 0 0 auto;
    display: flex;
    color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.45)'};
    transition: transform 0.25s ease;
    transform: rotate(${p => p.$open ? '180deg' : '0deg'});
  }
`;

const AccordionBody = styled.div`
  display: grid;
  grid-template-rows: ${p => p.$open ? '1fr' : '0fr'};
  transition: grid-template-rows 0.3s ease;

  > div { overflow: hidden; }

  .accordion-body-inner {
    padding: 0 1.1rem 1.1rem;
    border-top: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'};
    padding-top: 0.9rem;
  }
`;

/* ─── Comparison rows (inside accordion bodies) ─── */

const CompareRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.045)'};
  font-size: 0.86rem;

  &:last-child { border-bottom: none; }

  .compare-label { color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.62)' : 'rgba(15,23,42,0.6)'}; }
  .compare-value { display: flex; align-items: center; gap: 0.35rem; font-weight: 700; color: ${p => p.theme.textColor}; }
  .compare-value svg { font-size: 1rem; }
`;

const BigStat = styled.div`
  text-align: center;
  padding: 0.4rem 0 1rem;

  strong { display: block; font-size: 1.7rem; font-weight: 800; color: ${p => p.theme.textColor}; }
  small { display: block; margin-top: 0.2rem; font-size: 0.78rem; color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)'}; }
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.3rem 0;

  .bar-dot { width: 10px; height: 10px; border-radius: 50%; flex: 0 0 auto; }
  .bar-name { flex: 1; min-width: 0; font-size: 0.82rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.78)' : 'rgba(15,23,42,0.72)'}; }
  .bar-track { flex: 1; height: 7px; border-radius: 4px; background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
  .bar-value { flex: 0 0 auto; min-width: 46px; text-align: right; font-size: 0.8rem; font-weight: 700; color: ${p => p.theme.textColor}; }
`;

const EmptyState = styled.div`
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(148,163,184,0.08)' : 'rgba(226,232,240,0.55)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.35)'};

  strong { display: block; font-size: 0.85rem; color: ${p => p.theme.textColor}; margin-bottom: 0.2rem; }
  p { margin: 0; font-size: 0.78rem; color: ${p => p.theme.textColor}; opacity: 0.75; line-height: 1.45; }
`;

/* ─── Cohort card ─── */

const CohortCard = styled.section`
  border-radius: 18px;
  padding: 1.25rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.035)' : '#ffffff'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)'};

  .cohort-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.9rem; }
  h3 { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 700; color: ${p => p.theme.textColor}; }
  .cohort-head p { margin: 0; font-size: 0.82rem; line-height: 1.5; color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.6)'}; }

  .factor-options { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.9rem 0; }
  .customizer-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.65rem; margin-top: 0.6rem; }
  .apply-factors { background: ${p => p.theme.buttonBackgroundColor}; border: 0; border-radius: 10px; color: white; cursor: pointer; font-weight: 700; font-size: 0.82rem; padding: 0.55rem 0.9rem; }
  .apply-factors:disabled { cursor: wait; opacity: 0.6; }
  .reset-factors { background: none; border: 0; color: ${p => p.theme.buttonBackgroundColor}; cursor: pointer; font-size: 0.78rem; font-weight: 600; }
  .customizer-error { color: #ef4444; font-size: 0.78rem; }
  .cohort-preview { font-size: 0.78rem; color: ${p => p.theme.mode === 'dark' ? '#fbbf24' : '#a16207'}; }
  .cohort-preview.ready { color: ${p => p.theme.mode === 'dark' ? '#86efac' : '#15803d'}; }

  .privacy-line { display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; padding-top: 0.9rem; border-top: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'}; }
  .privacy-line svg { flex: 0 0 auto; font-size: 1rem; color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.45)'}; }
  .privacy-line p { margin: 0; font-size: 0.76rem; line-height: 1.45; color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)'}; }
`;

const FactorChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.42rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : '#dbe2ea'};
  background: ${p => p.$selected ? p.theme.buttonBackgroundColor : 'transparent'};
  color: ${p => p.$selected ? 'white' : p.theme.textColor};
  border-color: ${p => p.$selected ? p.theme.buttonBackgroundColor : undefined};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:disabled { cursor: not-allowed; opacity: 0.4; }
`;

/* ─── Geography ─── */

const GeographyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const GeographyCard = styled.section`
  position: relative;
  border-radius: 18px;
  padding: 1.25rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.035)' : '#ffffff'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)'};
  display: flex;
  flex-direction: column;
  gap: 0.7rem;

  .geo-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${p => p.theme.buttonBackgroundColor}, ${p => p.theme.buttonBackgroundColor}bb);
    color: white;
    svg { font-size: 1.2rem; }
  }
  h3 { margin: 0; font-size: 0.96rem; font-weight: 700; color: ${p => p.theme.textColor}; }
  p { margin: 0; font-size: 0.82rem; line-height: 1.5; color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.6)'}; }
`;

const ComingSoonBadge = styled.span`
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(251,191,36,0.14)' : '#fffbeb'};
  color: ${p => p.theme.mode === 'dark' ? '#fbbf24' : '#a16207'};
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  svg { font-size: 0.85rem; }
`;

const GeoCountryAction = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.2rem;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  border: 0;
  background: ${p => p.theme.buttonBackgroundColor};
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled { opacity: 0.6; cursor: wait; }
`;

const CountryResult = styled.div`
  margin-top: 0.4rem;
  padding-top: 0.7rem;
  border-top: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'};
`;

/* ─── Small building blocks ─── */

const GaugeArc = ({ value, theme, size = 176 }) => {
    const stroke = 14;
    const radius = (size - stroke) / 2;
    const half = Math.PI * radius;
    const clamped = value === null ? 0 : Math.max(1, Math.min(100, value));
    const offset = half - (clamped / 100) * half;
    const cx = size / 2;
    const cy = size / 2 + 6;
    const path = `M ${stroke / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${cy}`;
    const trackColor = theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)';
    return (
        <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`} role="img" aria-hidden="true">
            <path d={path} fill="none" stroke={trackColor} strokeWidth={stroke} strokeLinecap="round" />
            {value !== null && (
                <path
                    d={path}
                    fill="none"
                    stroke={theme.buttonBackgroundColor}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={half}
                    style={{
                        '--arc-full': half,
                        '--arc-offset': offset,
                        animation: `${drawArc} 1s ease-out forwards`,
                    }}
                />
            )}
            <circle cx={cx} cy={cy} r="1" opacity="0" />
        </svg>
    );
};

function Comparison({ theme, userData, isHidden }) {
    const { language, translations } = useContext(LanguageContext);
    const { formatAmount } = useContext(CurrencyContext);
    const { rankingService, userService, statsService } = useServices();
    const { selfHosted } = useDeployment();
    const navigate = useLocalizedNavigate();
    const t = translations.comparison;
    const optInCopy = getBenchmarkOptInCopy(selfHosted, t.benchmarkOverview);

    const [expandedSections, setExpandedSections] = useState({});
    const [selectedFactorGroups, setSelectedFactorGroups] = useState(DEFAULT_FACTOR_GROUPS);
    const [customBenchmark, setCustomBenchmark] = useState(null);
    const [isCustomBenchmarkLoading, setIsCustomBenchmarkLoading] = useState(false);
    const [customBenchmarkError, setCustomBenchmarkError] = useState('');
    const [cohortPreview, setCohortPreview] = useState(null);
    const [hasBenchmarkConsent, setHasBenchmarkConsent] = useState(userData?.benchmarkConsent === true);
    const [isSavingBenchmarkConsent, setIsSavingBenchmarkConsent] = useState(false);
    const [behaviourBenchmark, setBehaviourBenchmark] = useState(null);
    const [countryBenchmark, setCountryBenchmark] = useState(null);
    const [isCountryBenchmarkLoading, setIsCountryBenchmarkLoading] = useState(false);
    const [countryBenchmarkError, setCountryBenchmarkError] = useState('');

    useEffect(() => {
        let cancelled = false;
        statsService?.getBehaviourBenchmark?.().then((result) => { if (!cancelled) setBehaviourBenchmark(result); }).catch(() => {});
        return () => { cancelled = true; };
    }, [statsService]);

    const toggleFactorGroup = (group) => {
        setCustomBenchmarkError('');
        setSelectedFactorGroups((current) => current.includes(group)
            ? current.filter((item) => item !== group)
            : [...current, group]);
    };

    useEffect(() => {
        if (!rankingService?.previewCustomBenchmark || selectedFactorGroups.length === 0) {
            setCohortPreview(null);
            return undefined;
        }
        let active = true;
        const timer = setTimeout(async () => {
            try {
                const preview = await rankingService.previewCustomBenchmark(selectedFactorGroups);
                if (active) setCohortPreview(preview);
            } catch {
                if (active) setCohortPreview(null);
            }
        }, 250);
        return () => { active = false; clearTimeout(timer); };
    }, [rankingService, selectedFactorGroups]);

    const applyCustomBenchmark = async () => {
        if (selectedFactorGroups.length === 0 || !rankingService?.getCustomBenchmark) return;
        setIsCustomBenchmarkLoading(true);
        setCustomBenchmarkError('');
        try {
            const result = await rankingService.getCustomBenchmark(selectedFactorGroups);
            setCustomBenchmark(result);
            if (!result?.available) {
                setCustomBenchmarkError(t.benchmarkOverview?.noCohort || 'Not enough comparable profiles for this selection yet.');
            }
        } catch {
            setCustomBenchmarkError(t.benchmarkOverview?.customError || 'Unable to refresh the comparison. Try again.');
        } finally {
            setIsCustomBenchmarkLoading(false);
        }
    };

    const resetCustomBenchmark = () => {
        setSelectedFactorGroups(DEFAULT_FACTOR_GROUPS);
        setCustomBenchmark(null);
        setCustomBenchmarkError('');
    };

    const enableCommunityComparison = async () => {
        if (!userService?.setBenchmarkConsent || isSavingBenchmarkConsent) return;
        setIsSavingBenchmarkConsent(true);
        try {
            const result = await userService.setBenchmarkConsent(true);
            setHasBenchmarkConsent(result?.benchmarkConsent === true);
        } catch {
            setCustomBenchmarkError(t.benchmarkOverview?.optInError || 'Unable to activate community comparison. Please try again.');
        } finally {
            setIsSavingBenchmarkConsent(false);
        }
    };

    const toggleSection = (id) => {
        setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const loadCountryBenchmark = async () => {
        if (!rankingService?.getCustomBenchmark || isCountryBenchmarkLoading) return;
        setIsCountryBenchmarkLoading(true);
        setCountryBenchmarkError('');
        try {
            const result = await rankingService.getCustomBenchmark(['location']);
            setCountryBenchmark(result);
            if (!result?.available) {
                setCountryBenchmarkError(t.geography?.countryUnavailable || 'Not enough people from your country compare yet.');
            }
        } catch {
            setCountryBenchmarkError(t.benchmarkOverview?.customError || 'Unable to refresh the comparison. Try again.');
        } finally {
            setIsCountryBenchmarkLoading(false);
        }
    };

    // Index 0 is the partial current month. Community monthly benchmarks use
    // the last complete month, so compare the user's index 1 to the same period.
    const userIncomesArray = getIncomesArray(userData) || [];
    const userOutflowsArray = getOutflowsArray(userData) || [];
    const getLastCompleteMonth = (array) => Number(array?.[1]) || 0;

    const ProfileCompletionPercentage = getProfileCompletionPercentage(userData);
    const userAverages = userData?.averages || { all: {}, similar: {} };
    const benchmarkMetadata = customBenchmark?.available ? {
        generatedAt: customBenchmark.generatedAt,
        minimumCohortSize: customBenchmark.cohort.minimumSize,
        cohortSizes: {
            balances: customBenchmark.cohort.size,
            incomes: customBenchmark.cohort.size,
            expenses: customBenchmark.cohort.size,
            savingsRates: customBenchmark.cohort.size
        }
    } : userAverages.similar?.benchmark;
    // A comparison is meaningful only when the user opted in and the
    // selected comparison group meets the privacy floor. Never fall back to
    // displaying the global aggregate as if it described this user.
    const minimumBenchmarkSize = benchmarkMetadata?.minimumCohortSize ?? 20;
    const similarComparisonAvailable = hasBenchmarkConsent
        && Boolean(benchmarkMetadata)
        && Object.values(benchmarkMetadata?.cohortSizes ?? {}).some((size) => size >= minimumBenchmarkSize);
    const allComparisonAvailable = hasBenchmarkConsent
        && (userAverages.all?.benchmark?.populationSize ?? 0) >= minimumBenchmarkSize;

    const hasProfileValue = (field) => field && field.index !== -1 && Boolean(field.label);
    const profileFactorGroups = [
        {
            id: 'career',
            label: t.benchmarkOverview?.factors?.career || 'Work and career',
            fields: ['job', 'jobType', 'workTime', 'yearsOfExperience']
        },
        {
            id: 'location',
            label: t.benchmarkOverview?.factors?.location || 'Geographic area',
            fields: ['jobCountry', 'country', 'remoteType']
        },
        {
            id: 'lifeStage',
            label: t.benchmarkOverview?.factors?.lifeStage || 'Life stage',
            fields: ['age']
        },
        {
            id: 'household',
            label: t.benchmarkOverview?.factors?.household || 'Home and family',
            fields: ['livingSituation', 'housingType', 'children']
        }
    ].map(group => ({ ...group, available: group.fields.some(field => hasProfileValue(userData?.profile?.[field])) }));

    const displayedFactorGroups = customBenchmark?.available
        ? profileFactorGroups.filter(group => customBenchmark.factors.includes(group.id))
        : profileFactorGroups.filter(group => group.available);

    const countryFactorAvailable = profileFactorGroups.find(group => group.id === 'location')?.available ?? false;

    const similarRanks = {
        balance: similarComparisonAvailable ? (customBenchmark?.available ? customBenchmark.rankings.balance : getPercentageRankOnBalanceSimilar(userData)) : 0,
        incomes: similarComparisonAvailable ? (customBenchmark?.available ? customBenchmark.rankings.incomes : getPercentageRankOnIncomesSimilar(userData)) : 0,
        outflows: similarComparisonAvailable ? (customBenchmark?.available ? customBenchmark.rankings.outflows : getPercentageRankOnOutflowsSimilar(userData)) : 0
    };

    const comparisonData = {
        avgBalance: {
            user: {
                current: getTotalValue(userData) || 0,
                growth12Months: getBalanceGrowth12Months(userData)
            },
            similarUsers: {
                current: similarComparisonAvailable ? (customBenchmark?.available ? customBenchmark.averages.balances : userAverages.similar?.balances ?? null) : null
            },
            allUsers: {
                current: allComparisonAvailable ? userAverages.all?.balances ?? null : null
            }
        },
        avgIncome: {
            user: getLastCompleteMonth(userIncomesArray),
            similarUsers: similarComparisonAvailable ? (customBenchmark?.available ? customBenchmark.averages.incomes : userAverages.similar?.incomes ?? null) : null,
            allUsers: allComparisonAvailable ? userAverages.all?.incomes ?? null : null
        },
        avgOutflows: {
            user: getLastCompleteMonth(userOutflowsArray),
            similarUsers: similarComparisonAvailable ? (customBenchmark?.available ? customBenchmark.averages.expenses : userAverages.similar?.expenses ?? null) : null,
            allUsers: allComparisonAvailable ? userAverages.all?.expenses ?? null : null
        }
    };

    const calculateSavingsRate = () => {
        const totalIncomes = userIncomesArray.slice(0, 12).reduce((sum, val) => sum + (val || 0), 0);
        const totalOutflows = userOutflowsArray.slice(0, 12).reduce((sum, val) => sum + (val || 0), 0);
        if (totalIncomes <= 0) return null;
        return ((totalIncomes - totalOutflows) / totalIncomes) * 100;
    };
    const userSavingsRate = calculateSavingsRate();
    const allUsersSavingsRate = allComparisonAvailable ? getAveragesAllSavingsRates(userData) : null;
    const similarUsersSavingsRate = similarComparisonAvailable ? getAveragesSimilarSavingsRates(userData) : null;

    const similarUsersExpensesByCategory = similarComparisonAvailable ? getAveragesSimilarExpensesByCategory(userData) : null;

    const calculateAssetAllocation = () => {
        const currentBalance = userData?.balances?.[0]?.balance || {};
        const totalValue = getTotalValue(userData) || 0;
        if (totalValue <= 0) return [];
        const liquid = (currentBalance.cash || 0) + (currentBalance.bank || 0) + (currentBalance.digitalServices || 0) + (currentBalance.emergencyFund || 0);
        const investments = (currentBalance.stocks || 0) + (currentBalance.etf || 0) + (currentBalance.bonds || 0) + (currentBalance.funds || 0) + (currentBalance.commodities || 0);
        const crypto = (currentBalance.bitcoin || 0) + (currentBalance.crypto || 0);
        const similarAllocation = similarComparisonAvailable && customBenchmark?.available
            ? customBenchmark.averages.assetAllocation
            : similarComparisonAvailable ? userAverages.similar?.assetAllocation : null;
        const allAllocation = allComparisonAvailable ? userAverages.all?.assetAllocation : null;
        return [
            { key: 'liquid', name: t.cards.assetAllocation.liquid || 'Liquidity', value: liquid, percentage: (liquid / totalValue) * 100, color: '#3498db' },
            { key: 'investments', name: t.cards.assetAllocation.investments || 'Investments', value: investments, percentage: (investments / totalValue) * 100, color: '#27ae60' },
            { key: 'crypto', name: t.cards.assetAllocation.crypto || 'Crypto', value: crypto, percentage: (crypto / totalValue) * 100, color: '#f39c12' }
        ].map(asset => ({
            ...asset,
            similarPercentage: similarAllocation?.[asset.key] ?? null,
            allPercentage: allAllocation?.[asset.key] ?? null
        })).sort((a, b) => b.percentage - a.percentage);
    };
    const assetAllocation = calculateAssetAllocation();

    const calculateSpendingByCategory = () => {
        const totalOutflowsPerCategory = getTotalOutflowsParentCategoryPerMonth(userData);
        const categoryTotals = {};
        for (let i = 0; i < 12; i++) {
            const monthData = totalOutflowsPerCategory[i] || {};
            Object.entries(monthData).forEach(([category, amount]) => {
                categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            });
        }
        const totalSpending = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
        if (totalSpending <= 0) return [];
        return Object.entries(categoryTotals)
            .map(([name, value]) => {
                const tagKey =
                    resolveTagKeyFromLocalized(name, 'en', 'expense') ||
                    resolveTagKeyFromLocalized(name, language, 'expense') ||
                    String(name).toLowerCase();
                return {
                    name,
                    tagKey,
                    displayName: translateTag(tagKey, language, 'expense') || name,
                    value,
                    percentage: (value / totalSpending) * 100,
                    color: getCategoryColor(tagKey, language)
                };
            })
            .sort((a, b) => b.value - a.value);
    };
    const spendingByCategory = calculateSpendingByCategory();

    const formatCurrency = (value) => {
        if (isHidden) return '****';
        if (value === null || value === undefined) return translations.general.comingSoon || 'Coming soon';
        return formatAmount(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const formatGrowthPercentage = (value) => {
        if (isHidden) return '****';
        if (value === null || value === undefined) return '';
        if (value === 0) return t.cards.avgBalance.noGrowthData;
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}% ${t.cards.avgBalance.growth12Months}`;
    };

    const getComparisonIcon = (userValue, compareValue) => {
        if (compareValue === null || compareValue === undefined) return null;
        if (userValue > compareValue) return <TrendingUpIcon style={{ color: '#27ae60' }} />;
        if (userValue < compareValue) return <TrendingDownIcon style={{ color: '#e74c3c' }} />;
        return <EqualIcon style={{ color: '#f39c12' }} />;
    };

    const generateInsights = () => {
        const insights = [];
        if (similarRanks.balance > 0) {
            insights.push({
                type: 'positive',
                title: (t.actionableInsights?.percentileTitle || 'Net worth: top {rank}% among similar profiles')
                    .replace('{rank}', Math.min(similarRanks.balance, 100)),
                description: t.actionableInsights?.percentileDescription || 'The percentile uses the specific cohort for net worth, not the undifferentiated average of all users.'
            });
        }

        const categoryOpportunities = spendingByCategory.map(category => {
            const categoryIndex = userData?.tags?.outflowsTags?.find(
                tag => tag.label === category.tagKey || translateTag(tag.label, 'en', 'expense') === category.name
            )?.index;
            const peerAverage = categoryIndex !== undefined ? similarUsersExpensesByCategory?.[categoryIndex] : null;
            return { ...category, peerAverage, difference: peerAverage == null ? 0 : category.value - peerAverage };
        }).filter(category => category.peerAverage > 0 && category.difference > Math.max(50, category.peerAverage * 0.1))
          .sort((a, b) => b.difference - a.difference);

        if (categoryOpportunities.length > 0) {
            const opportunity = categoryOpportunities[0];
            const totalGap = categoryOpportunities.reduce((sum, category) => sum + category.difference, 0);
            const contribution = totalGap > 0 ? Math.round((opportunity.difference / totalGap) * 100) : 0;
            insights.push({
                type: 'warning',
                title: (t.actionableInsights?.categoryTitle || 'Dig deeper: {category}').replace('{category}', opportunity.displayName),
                description: (t.actionableInsights?.categoryDescription || 'Over the last 12 months you spent {difference} more than your cohort average in this parent category: it accounts for {contribution}% of the detected deviations.')
                    .replace('{difference}', formatCurrency(opportunity.difference))
                    .replace('{contribution}', contribution)
            });
        }

        if (userSavingsRate !== null && similarUsersSavingsRate !== null && userSavingsRate + 2 < similarUsersSavingsRate) {
            const gap = similarUsersSavingsRate - userSavingsRate;
            insights.push({
                type: 'warning',
                title: t.actionableInsights?.savingsTitle || 'Room on your savings rate',
                description: (t.actionableInsights?.savingsDescription || 'Your cohort saves on average {gap} percentage points more. Above-average categories can suggest where to start.')
                    .replace('{gap}', gap.toFixed(1))
            });
        } else if (insights.length === 0 && comparisonData.avgOutflows.similarUsers !== null) {
            insights.push({
                type: 'positive',
                title: t.actionableInsights?.balancedTitle || 'Profile in balance with your cohort',
                description: t.actionableInsights?.balancedDescription || 'No significant deviations found. Keep monitoring the trend, which is more useful than any single month.'
            });
        }
        return insights;
    };
    const insights = similarComparisonAvailable ? generateInsights() : [];

    const behaviourCards = [
        { key: 'savingConsistency', title: t.rankingsAccessory.savingConsistency, description: t.rankingsAccessory.savingConsistencyDescription, suffix: '%' },
        { key: 'investmentRegularity', title: t.rankingsAccessory.investmentRegularity, description: t.rankingsAccessory.investmentRegularityDescription, suffix: '%' },
        { key: 'contributionFrequency', title: t.rankingsAccessory.contributionFrequency, description: t.rankingsAccessory.contributionFrequencyDescription, suffix: '' },
        { key: 'goalProgress', title: t.rankingsAccessory.goalProgress, description: t.rankingsAccessory.goalProgressDescription, suffix: '%' },
    ];

    const cohortSizes = benchmarkMetadata?.cohortSizes ? Object.values(benchmarkMetadata.cohortSizes).filter(size => size > 0) : [];
    const minCohortSize = cohortSizes.length > 0 ? Math.min(...cohortSizes) : null;
    const maxCohortSize = cohortSizes.length > 0 ? Math.max(...cohortSizes) : null;
    const cohortLabel = minCohortSize === null
        ? (t.benchmarkOverview?.waiting || 'Cohort being prepared')
        : minCohortSize === maxCohortSize ? `${minCohortSize}` : `${minCohortSize}-${maxCohortSize}`;
    const updatedAt = benchmarkMetadata?.generatedAt
        ? new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(benchmarkMetadata.generatedAt))
        : '--';

    const accordionSections = [
        {
            id: 'balance',
            icon: <AccountBalanceIcon />,
            title: t.cards.avgBalance.title,
            teaser: t.cards.avgBalance.description,
            render: () => (
                <>
                    <BigStat theme={theme}>
                        <strong>{formatCurrency(comparisonData.avgBalance.user.current)}</strong>
                        <small>{formatGrowthPercentage(comparisonData.avgBalance.user.growth12Months) || t.cards.avgBalance.yourBalance}</small>
                    </BigStat>
                    <CompareRow theme={theme}>
                        <span className="compare-label">{t.cards.avgBalance.avgSimilar}</span>
                        <span className="compare-value">
                            {comparisonData.avgBalance.similarUsers.current !== null ? <>{formatCurrency(comparisonData.avgBalance.similarUsers.current)}{getComparisonIcon(comparisonData.avgBalance.user.current, comparisonData.avgBalance.similarUsers.current)}</> : (translations.general.comingSoon || 'Coming soon')}
                        </span>
                    </CompareRow>
                    <CompareRow theme={theme}>
                        <span className="compare-label">{t.cards.avgBalance.avgAll}</span>
                        <span className="compare-value">
                            {comparisonData.avgBalance.allUsers.current !== null ? <>{formatCurrency(comparisonData.avgBalance.allUsers.current)}{getComparisonIcon(comparisonData.avgBalance.user.current, comparisonData.avgBalance.allUsers.current)}</> : (translations.general.comingSoon || 'Coming soon')}
                        </span>
                    </CompareRow>
                </>
            )
        },
        {
            id: 'cashflow',
            icon: <MonetizationOnIcon />,
            title: t.accordion?.cashflowTitle || 'Income & outflows',
            teaser: t.accordion?.cashflowDescription || 'Last complete month, compared to your cohort',
            render: () => (
                <>
                    <CompareRow theme={theme}>
                        <span className="compare-label">{t.cards.avgIncome.yourIncome}</span>
                        <span className="compare-value">{formatCurrency(comparisonData.avgIncome.user)}</span>
                    </CompareRow>
                    <CompareRow theme={theme}>
                        <span className="compare-label">{t.cards.avgIncome.avgSimilar}</span>
                        <span className="compare-value">{formatCurrency(comparisonData.avgIncome.similarUsers)}{getComparisonIcon(comparisonData.avgIncome.user, comparisonData.avgIncome.similarUsers)}</span>
                    </CompareRow>
                    <CompareRow theme={theme}>
                        <span className="compare-label">{t.cards.avgOutflows.yourOutflows}</span>
                        <span className="compare-value">{formatCurrency(comparisonData.avgOutflows.user)}</span>
                    </CompareRow>
                    <CompareRow theme={theme}>
                        <span className="compare-label">{t.cards.avgOutflows.avgSimilar}</span>
                        <span className="compare-value">{formatCurrency(comparisonData.avgOutflows.similarUsers)}{getComparisonIcon(comparisonData.avgOutflows.similarUsers, comparisonData.avgOutflows.user)}</span>
                    </CompareRow>
                </>
            )
        },
        {
            id: 'savings',
            icon: <SavingsIcon />,
            title: t.cards.savingsRate.title,
            teaser: t.cards.savingsRate.description,
            render: () => userSavingsRate !== null ? (
                <>
                    <BigStat theme={theme}>
                        <strong style={{ color: userSavingsRate >= 20 ? '#27ae60' : userSavingsRate < 0 ? '#e74c3c' : theme.textColor }}>
                            {isHidden ? '****' : `${userSavingsRate.toFixed(1)}%`}
                        </strong>
                        <small>{t.cards.savingsRate.last12Months}</small>
                    </BigStat>
                    <CompareRow theme={theme}>
                        <span className="compare-label">{t.cards.savingsRate.avgSimilar}</span>
                        <span className="compare-value">
                            {similarUsersSavingsRate !== null ? <>{isHidden ? '****' : `${similarUsersSavingsRate.toFixed(1)}%`}{getComparisonIcon(userSavingsRate, similarUsersSavingsRate)}</> : (translations.general.comingSoon || 'Coming soon')}
                        </span>
                    </CompareRow>
                    <CompareRow theme={theme}>
                        <span className="compare-label">{t.cards.savingsRate.avgAll}</span>
                        <span className="compare-value">
                            {allUsersSavingsRate !== null ? <>{isHidden ? '****' : `${allUsersSavingsRate.toFixed(1)}%`}{getComparisonIcon(userSavingsRate, allUsersSavingsRate)}</> : (translations.general.comingSoon || 'Coming soon')}
                        </span>
                    </CompareRow>
                </>
            ) : (
                <EmptyState theme={theme}><p>{t.cards.savingsRate.noData}</p></EmptyState>
            )
        },
        {
            id: 'assets',
            icon: <PieChartIcon />,
            title: t.cards.assetAllocation.title,
            teaser: t.cards.assetAllocation.description,
            render: () => assetAllocation.length > 0 ? assetAllocation.map((asset) => (
                <div key={asset.key} style={{ marginBottom: '0.6rem' }}>
                    <BarRow theme={theme}>
                        <span className="bar-dot" style={{ background: asset.color }} />
                        <span className="bar-name">{asset.name}</span>
                        <span className="bar-track"><span className="bar-fill" style={{ width: `${asset.percentage}%`, background: asset.color }} /></span>
                        <span className="bar-value">{isHidden ? '**%' : `${asset.percentage.toFixed(0)}%`}</span>
                    </BarRow>
                    {asset.similarPercentage !== null && (
                        <CompareRow theme={theme} style={{ paddingLeft: '1.5rem' }}>
                            <span className="compare-label">{t.cards.assetAllocation.avgSimilar}</span>
                            <span className="compare-value">{isHidden ? '**%' : `${asset.similarPercentage.toFixed(0)}%`}</span>
                        </CompareRow>
                    )}
                </div>
            )) : (
                <EmptyState theme={theme}><p>{t.cards.assetAllocation.noAssets}</p></EmptyState>
            )
        },
        {
            id: 'spending',
            icon: <BarChartIcon />,
            title: t.cards.spendingCategories.title,
            teaser: t.cards.spendingCategories.description,
            render: () => spendingByCategory.length > 0 ? spendingByCategory.slice(0, 6).map((category) => (
                <BarRow key={category.name} theme={theme}>
                    <span className="bar-dot" style={{ background: category.color }} />
                    <span className="bar-name">{category.displayName}</span>
                    <span className="bar-track"><span className="bar-fill" style={{ width: `${category.percentage}%`, background: category.color }} /></span>
                    <span className="bar-value">{isHidden ? '****' : formatCurrency(category.value)}</span>
                </BarRow>
            )) : (
                <EmptyState theme={theme}><p>{t.cards.spendingCategories.noExpenses}</p></EmptyState>
            )
        },
        {
            id: 'behaviour',
            icon: <QueryStatsIcon />,
            title: t.accordion?.behaviourTitle || t.rankingsAccessory.title,
            teaser: t.rankingsAccessory.description,
            render: () => behaviourCards.map((card) => {
                const personalValue = behaviourBenchmark?.available && behaviourBenchmark.personal ? behaviourBenchmark.personal[card.key] : null;
                const rankValue = behaviourBenchmark?.available && behaviourBenchmark.rankings ? behaviourBenchmark.rankings[card.key] : null;
                return (
                    <CompareRow key={card.key} theme={theme}>
                        <span className="compare-label">{card.title}</span>
                        <span className="compare-value">
                            {personalValue != null
                                ? `${personalValue.toFixed(1)}${card.suffix} · Top ${Math.max(1, 100 - (rankValue ?? 100))}%`
                                : (translations.general.comingSoon || 'Coming soon')}
                        </span>
                    </CompareRow>
                );
            })
        }
    ];

    const overallGaugeValue = similarComparisonAvailable && similarRanks.balance > 0 ? Math.min(similarRanks.balance, 100) : null;

    return (
        <Section theme={theme}>
            <PageContainer>
                <HeroCard theme={theme}>
                    <HeroEyebrow theme={theme}><ShieldOutlinedIcon fontSize="small" /> {t.hero?.eyebrow || 'Anonymous & aggregate only'}</HeroEyebrow>
                    <HeroTitle theme={theme}>{t.title}</HeroTitle>
                    <HeroSubtitle theme={theme}>{t.subtitle}</HeroSubtitle>

                    {!hasBenchmarkConsent ? (
                        <>
                            <GaugeFigure theme={theme}>
                                <GaugeArc value={null} theme={theme} />
                                <GaugeValue theme={theme}><LockOutlinedIcon style={{ fontSize: '1.6rem', color: theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.35)' }} /></GaugeValue>
                            </GaugeFigure>
                            <GaugeCaption theme={theme}>{optInCopy.description}</GaugeCaption>
                            <HeroCTA theme={theme} type="button" onClick={enableCommunityComparison} disabled={isSavingBenchmarkConsent}>
                                {isSavingBenchmarkConsent ? (t.benchmarkOverview?.optInSaving || 'Activating...') : optInCopy.title}
                            </HeroCTA>
                        </>
                    ) : (
                        <>
                            <GaugeFigure theme={theme}>
                                <GaugeArc value={overallGaugeValue} theme={theme} />
                                <GaugeValue theme={theme}>
                                    {overallGaugeValue !== null ? (
                                        <>
                                            <strong>{isHidden ? '**' : `${overallGaugeValue}`}<span style={{ fontSize: '1.1rem' }}>%</span></strong>
                                            <span>{t.hero?.gaugeLabel || 'Percentile'}</span>
                                        </>
                                    ) : (
                                        <ScheduleIcon style={{ fontSize: '1.6rem', color: theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.35)' }} />
                                    )}
                                </GaugeValue>
                            </GaugeFigure>
                            <GaugeCaption theme={theme}>
                                {overallGaugeValue !== null
                                    ? (t.hero?.gaugeCaption || 'Your net worth compared to people with a similar profile.')
                                    : (t.hero?.gaugeLockedDescription || 'We will show this as soon as your comparison group reaches the minimum privacy threshold.')}
                            </GaugeCaption>
                            <HeadlineChips>
                                <HeadlineChip theme={theme} $delay="0s">
                                    <AccountBalanceIcon />
                                    <div><div className="chip-value">{similarRanks.balance > 0 ? `${Math.min(similarRanks.balance, 100)}%` : '—'}</div><div className="chip-label">{t.hero?.balanceLabel || 'Net worth'}</div></div>
                                </HeadlineChip>
                                <HeadlineChip theme={theme} $delay="0.06s">
                                    <MonetizationOnIcon />
                                    <div><div className="chip-value">{similarRanks.incomes > 0 ? `${Math.min(similarRanks.incomes, 100)}%` : '—'}</div><div className="chip-label">{t.hero?.incomeLabel || 'Income'}</div></div>
                                </HeadlineChip>
                                <HeadlineChip theme={theme} $delay="0.12s">
                                    <TrendingDownIcon />
                                    <div><div className="chip-value">{similarRanks.outflows > 0 ? `${Math.min(similarRanks.outflows, 100)}%` : '—'}</div><div className="chip-label">{t.hero?.outflowsLabel || 'Frugality'}</div></div>
                                </HeadlineChip>
                            </HeadlineChips>
                        </>
                    )}
                </HeroCard>

                {ProfileCompletionPercentage !== 100 && (
                    <ProfileNudge theme={theme} type="button" onClick={() => navigate('/profile')} data-umami-event="comparison-complete-profile">
                        <span className="nudge-icon"><PersonIcon fontSize="small" /></span>
                        <div>
                            <strong>{t.profileBanner?.title || 'Complete your profile'}</strong>
                            <span>{t.profileBanner?.description}</span>
                        </div>
                        <span className="nudge-arrow"><ArrowForwardIcon fontSize="small" /></span>
                    </ProfileNudge>
                )}

                {hasBenchmarkConsent && insights.length > 0 && (
                    <InsightList>
                        {insights.map((insight, index) => (
                            <InsightCard key={index} theme={theme} $tone={insight.type === 'warning' ? 'warning' : 'positive'}>
                                <span className="insight-icon"><TipsAndUpdatesIcon /></span>
                                <div>
                                    <h4>{insight.title}</h4>
                                    <p>{insight.description}</p>
                                </div>
                            </InsightCard>
                        ))}
                    </InsightList>
                )}

                {hasBenchmarkConsent && !similarComparisonAvailable && !allComparisonAvailable && (
                    <EmptyState theme={theme} role="status">
                        <strong>{t.benchmarkOverview?.comparisonUnavailable || 'Comparison group not available yet'}</strong>
                        <p>{(t.benchmarkOverview?.comparisonUnavailableDescription || 'We will show the comparison when the group reaches the minimum privacy threshold of {minimum} participants.').replace('{minimum}', String(minimumBenchmarkSize))}</p>
                    </EmptyState>
                )}

                {hasBenchmarkConsent && (similarComparisonAvailable || allComparisonAvailable) && (
                    <>
                        <SectionLabel theme={theme}>{t.accordion?.sectionLabel || 'Explore the detail'}</SectionLabel>
                        <AccordionList>
                            {accordionSections.map((section) => {
                                const open = Boolean(expandedSections[section.id]);
                                return (
                                    <AccordionItem key={section.id} theme={theme}>
                                        <AccordionHeader theme={theme} type="button" $open={open} onClick={() => toggleSection(section.id)} aria-expanded={open}>
                                            <span className="accordion-icon">{section.icon}</span>
                                            <span className="accordion-copy">
                                                <strong>{section.title}</strong>
                                                <span>{section.teaser}</span>
                                            </span>
                                            <span className="accordion-chevron"><KeyboardArrowDownIcon /></span>
                                        </AccordionHeader>
                                        <AccordionBody theme={theme} $open={open}>
                                            <div>
                                                <div className="accordion-body-inner">{section.render()}</div>
                                            </div>
                                        </AccordionBody>
                                    </AccordionItem>
                                );
                            })}
                        </AccordionList>
                    </>
                )}

                <SectionLabel theme={theme}>{t.benchmarkOverview?.customizeTitle || 'Your comparison group'}</SectionLabel>
                <CohortCard theme={theme}>
                    <div className="cohort-head">
                        <div>
                            <h3>{t.benchmarkOverview?.customizeTitle || 'Customize similar users'}</h3>
                            <p>{t.benchmarkOverview?.customizeDescription || 'Choose which parts of your profile matter for your comparison. Data stays aggregated and anonymous.'}</p>
                        </div>
                        <Tooltip title={t.benchmarkOverview?.groupHelp || ''}>
                            <span style={{ display: 'inline-flex', cursor: 'help', opacity: 0.6 }}><InfoIcon fontSize="small" /></span>
                        </Tooltip>
                    </div>

                    {hasBenchmarkConsent ? (
                        <>
                            <div className="factor-options">
                                {profileFactorGroups.map((group) => (
                                    <FactorChip
                                        key={group.id}
                                        theme={theme}
                                        type="button"
                                        $selected={group.available && selectedFactorGroups.includes(group.id)}
                                        onClick={() => toggleFactorGroup(group.id)}
                                        disabled={!group.available}
                                        title={!group.available ? (t.benchmarkOverview?.factorUnavailable || 'Complete this part of your profile to use it.') : undefined}
                                        aria-pressed={group.available && selectedFactorGroups.includes(group.id)}
                                    >
                                        {group.label}
                                    </FactorChip>
                                ))}
                            </div>
                            <div className="customizer-actions">
                                <button
                                    type="button"
                                    className="apply-factors"
                                    onClick={applyCustomBenchmark}
                                    disabled={isCustomBenchmarkLoading || !profileFactorGroups.some(group => group.available && selectedFactorGroups.includes(group.id))}
                                >
                                    {isCustomBenchmarkLoading ? (t.benchmarkOverview?.calculating || 'Calculating...') : (t.benchmarkOverview?.applyFactors || 'Update comparison')}
                                </button>
                                {customBenchmark && (
                                    <button type="button" className="reset-factors" onClick={resetCustomBenchmark}>
                                        {t.benchmarkOverview?.resetFactors || 'Use recommended comparison'}
                                    </button>
                                )}
                                {customBenchmarkError && <span className="customizer-error">{customBenchmarkError}</span>}
                                {cohortPreview && (
                                    <span className={`cohort-preview ${cohortPreview.available ? 'ready' : ''}`}>
                                        {(t.benchmarkOverview?.preview || 'Preview: {count} comparable profiles (minimum {minimum}).')
                                            .replace('{count}', cohortPreview.cohort.size)
                                            .replace('{minimum}', cohortPreview.cohort.minimumSize)}
                                    </span>
                                )}
                            </div>
                            {displayedFactorGroups.length > 0 && (
                                <div className="privacy-line">
                                    <ShieldOutlinedIcon />
                                    <p>{(t.benchmarkOverview?.privacy || 'Aggregated data only. Cohorts: {count} users; minimum privacy threshold: {minimum}. Updated: {updated}.')
                                        .replace('{count}', cohortLabel)
                                        .replace('{minimum}', benchmarkMetadata?.minimumCohortSize || 20)
                                        .replace('{updated}', updatedAt)}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState theme={theme}>
                            <p>{t.benchmarkOverview?.description || 'Compare net worth, income and outflows with a group of users with a similar profile.'}</p>
                        </EmptyState>
                    )}
                </CohortCard>

                <SectionLabel theme={theme}>{t.geography?.title || 'Geography'}</SectionLabel>
                <GeographyGrid>
                    <GeographyCard theme={theme}>
                        <span className="geo-icon"><FlagCircleIcon /></span>
                        <h3>{t.geography?.countryTitle || 'Compare by country'}</h3>
                        <p>{t.geography?.countryDescription || 'Isolate geography from your other profile factors to see how you compare to people in your country.'}</p>
                        {!hasBenchmarkConsent ? (
                            <p style={{ fontSize: '0.78rem', opacity: 0.6, margin: 0 }}>{t.geography?.countryNeedsConsent || 'Enable comparison above to use this.'}</p>
                        ) : !countryFactorAvailable ? (
                            <GeoCountryAction theme={theme} type="button" onClick={() => navigate('/profile')}>
                                <TuneIcon fontSize="small" /> {t.geography?.countryProfileIncomplete || 'Add your country to your profile'}
                            </GeoCountryAction>
                        ) : (
                            <>
                                <GeoCountryAction theme={theme} type="button" onClick={loadCountryBenchmark} disabled={isCountryBenchmarkLoading}>
                                    <PublicIcon fontSize="small" />
                                    {isCountryBenchmarkLoading ? (t.benchmarkOverview?.calculating || 'Calculating...') : (t.geography?.countryCTA || 'See my country comparison')}
                                </GeoCountryAction>
                                {countryBenchmarkError && <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{countryBenchmarkError}</span>}
                                {countryBenchmark?.available && (
                                    <CountryResult theme={theme}>
                                        <CompareRow theme={theme}>
                                            <span className="compare-label">{t.hero?.balanceLabel || 'Net worth'}</span>
                                            <span className="compare-value">{`Top ${Math.min(countryBenchmark.rankings.balance, 100)}%`}</span>
                                        </CompareRow>
                                        <CompareRow theme={theme}>
                                            <span className="compare-label">{t.hero?.incomeLabel || 'Income'}</span>
                                            <span className="compare-value">{`Top ${Math.min(countryBenchmark.rankings.incomes, 100)}%`}</span>
                                        </CompareRow>
                                        <CompareRow theme={theme}>
                                            <span className="compare-label">{t.hero?.outflowsLabel || 'Frugality'}</span>
                                            <span className="compare-value">{`Top ${Math.min(countryBenchmark.rankings.outflows, 100)}%`}</span>
                                        </CompareRow>
                                        <span style={{ fontSize: '0.74rem', opacity: 0.6 }}>
                                            {(t.benchmarkOverview?.preview || 'Preview: {count} comparable profiles (minimum {minimum}).')
                                                .replace('{count}', countryBenchmark.cohort.size)
                                                .replace('{minimum}', countryBenchmark.cohort.minimumSize)}
                                        </span>
                                    </CountryResult>
                                )}
                            </>
                        )}
                    </GeographyCard>

                    <GeographyCard theme={theme}>
                        <ComingSoonBadge theme={theme}><ScheduleIcon fontSize="inherit" /> {t.geography?.regionComingSoon || 'Coming soon'}</ComingSoonBadge>
                        <span className="geo-icon"><MapIcon /></span>
                        <h3>{t.geography?.regionTitle || 'Region & city'}</h3>
                        <p>{t.geography?.regionDescription || "We don't collect region or city yet, so we can't compare at that level. It's on the roadmap, along with a clickable map and a cost-of-living-adjusted view."}</p>
                        <p style={{ fontSize: '0.76rem', opacity: 0.55 }}>{t.geography?.mapFutureNote || 'A future step: simulate how a job or location change could affect your numbers, always shown as an assumption, never as advice.'}</p>
                    </GeographyCard>
                </GeographyGrid>
            </PageContainer>
        </Section>
    );
}

export default Comparison;
