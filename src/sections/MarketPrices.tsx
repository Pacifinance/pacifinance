import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import apiClient from '../services/apiClient';
import mockCryptoData from '../data/mockCryptoData';
import TradingViewWidget, { LazyTradingViewWidget } from '../components/TradingViewWidget';
import { preloadTradingViewScripts } from '../components/TradingViewWidget';
import { AreaChart } from 'recharts/lib/chart/AreaChart';
import { Area } from 'recharts/lib/cartesian/Area';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { YAxis } from 'recharts/lib/cartesian/YAxis';
import { Tooltip as ReTooltip } from 'recharts/lib/component/Tooltip';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { CartesianGrid } from 'recharts/lib/cartesian/CartesianGrid';
import {
  TrendingUp, TrendingDown, Minus, Search, RefreshCw,
  BarChart3, Bitcoin, Landmark, Gem, Briefcase, Lock,
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp,
  Info, ArrowLeft, ChevronRight, Activity, AlertTriangle,
  DollarSign
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Styled Components
   ═══════════════════════════════════════════════════════════════ */

const PageContainer = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
  };
  min-height: 100vh;
  padding: 0;
  margin: 0;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  padding-bottom: 14rem;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 300px;
    background: ${p => p.theme.mode === 'dark'
      ? 'radial-gradient(ellipse at top, rgba(7, 145, 100, 0.15) 0%, transparent 70%)'
      : 'radial-gradient(ellipse at top, rgba(7, 145, 100, 0.08) 0%, transparent 70%)'
    };
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding-top: 4rem;
    padding-bottom: 18rem;
  }

  @media (min-width: 768px) {
    margin-left: 5.5rem;
    width: calc(100% - 5.5rem);
  }
`;

const HeaderSection = styled.div`
  position: relative;
  z-index: 1;
  padding: 2rem 1rem 1rem 1rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem 0.5rem 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: ${p => p.theme.textColor};
  letter-spacing: -0.025em;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.55)'};
  margin: 0 0 1rem 0;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 0.82rem;
    margin-bottom: 0.5rem;
    padding: 0 0.5rem;
  }
`;

const LastUpdated = styled.div`
  font-size: 0.75rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  svg { width: 13px; height: 13px; }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
  }
`;

/* ─── Navigation Tabs ─── */

const NavigationTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  padding: 0 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.25rem;
    margin-bottom: 0.75rem;
    padding: 0 0.5rem;
  }
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  opacity: ${p => p.disabled ? 0.5 : 1};

  background: ${p => p.$active
    ? p.theme.buttonBackgroundColor
    : p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.04)'
  };

  color: ${p => p.$active
    ? 'white'
    : p.theme.mode === 'dark'
      ? 'rgba(255,255,255,0.7)'
      : 'rgba(0,0,0,0.6)'
  };

  border: 1px solid ${p => p.$active
    ? 'transparent'
    : p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.06)'
  };

  &:hover:not(:disabled) {
    background: ${p => p.$active
      ? p.theme.buttonBackgroundColor
      : p.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.06)'
    };
    color: ${p => p.$active ? 'white' : p.theme.textColor};
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    padding: 0.55rem 1rem;
    font-size: 0.85rem;

    svg { width: 16px; height: 16px; }
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.7rem;
    font-size: 0.72rem;
    gap: 0.3rem;

    svg { width: 15px; height: 15px; flex-shrink: 0; }
  }
`;

const ComingSoonBadge = styled.span`
  font-size: 0.55rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};

  @media (max-width: 480px) {
    font-size: 0.5rem;
    padding: 0.08rem 0.3rem;
  }
`;

/* ─── Main Content ─── */

const MainContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 3rem 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem 2rem 0.5rem;
  }
`;

/* ─── Search Bar ─── */

const SearchContainer = styled.div`
  max-width: 500px;
  margin: 0 auto 1.5rem;
  position: relative;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)'};
  color: ${p => p.theme.textColor};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${p => p.theme.buttonBackgroundColor};
    box-shadow: 0 0 0 3px ${p => p.theme.buttonBackgroundColor}20;
  }

  &::placeholder {
    color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'};
  }

  @media (max-width: 768px) {
    font-size: 16px !important;
    padding: 0.6rem 0.8rem 0.6rem 2.2rem;
  }
`;

const SearchIcon2 = styled.div`
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'};
  svg { width: 16px; height: 16px; }
`;

/* ─── Crypto Grid Cards ─── */

const AssetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const ShowMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 320px;
  margin: 1.25rem auto 0;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(0, 0, 0, 0.1)'};
  background: ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.03)'};
  color: ${p => p.theme.mode === 'dark' ? '#e2e8f0' : '#334155'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.06)'};
    transform: translateY(-1px);
  }

  span.count {
    opacity: 0.6;
    font-weight: 400;
    font-size: 0.8rem;
  }
`;

const AssetCard = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 14px;
  padding: 1.1rem;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.theme.mode === 'dark'
      ? '0 8px 24px rgba(0, 0, 0, 0.35)'
      : '0 8px 24px rgba(0, 0, 0, 0.08)'
    };
    border-color: ${p => p.theme.buttonBackgroundColor}40;
  }

  &:active {
    transform: translateY(0px);
  }

  @media (max-width: 768px) {
    padding: 0.9rem;
    border-radius: 12px;

    &:hover { transform: none; }
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.8rem;
`;

const CoinImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const CoinInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CoinName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${p => p.theme.textColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const CoinId = styled.div`
  font-size: 0.72rem;
  font-weight: 500;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  text-transform: uppercase;
`;

const PriceBlock = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const CurrentPrice = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${p => p.theme.textColor};
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
`;

const PriceChange = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.15rem;
  margin-top: 0.15rem;
  color: ${p => p.$positive ? '#10b981' : p.$neutral ? (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)') : '#ef4444'};

  svg { width: 12px; height: 12px; }
`;

const RankBadge = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'};
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  padding: 0.08rem 0.35rem;
  border-radius: 4px;
  margin-left: 0.25rem;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.68rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'};
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.62rem;
    margin-top: 0.35rem;
  }
`;

/* ─── Sparkline ─── */

const SparklineContainer = styled.div`
  margin-top: 0.6rem;
  height: 48px;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'};
`;

/* ─── Locked Section Placeholder ─── */

const LockedSection = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : 'rgba(255,255,255,0.7)'
  };
  border: 1px dashed ${p => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(0,0,0,0.1)'
  };
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    padding: 2rem 1.25rem;
    border-radius: 12px;
  }
`;

const LockedIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.theme.buttonBackgroundColor}15;
  color: ${p => p.theme.buttonBackgroundColor};

  svg { width: 26px; height: 26px; }
`;

const LockedTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
  margin: 0;

  @media (max-width: 768px) { font-size: 1.05rem; }
`;

const LockedDescription = styled.p`
  font-size: 0.88rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  margin: 0;
  max-width: 420px;
  line-height: 1.5;

  @media (max-width: 768px) { font-size: 0.82rem; }
`;

/* ─── Detail View ─── */

const DetailOverlay = styled.div`
  animation: fadeSlideIn 0.3s ease;

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)'};
  color: ${p => p.theme.textColor};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;

  svg { width: 16px; height: 16px; }

  &:hover {
    border-color: ${p => p.theme.buttonBackgroundColor};
    color: ${p => p.theme.buttonBackgroundColor};
    background: ${p => p.theme.buttonBackgroundColor}10;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.45rem 0.8rem;
    margin-bottom: 1rem;
  }
`;

const DetailCard = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    padding: 1.1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
  }
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const DetailImage = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`;

const DetailNameBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const DetailName = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${p => p.theme.textColor};
  margin: 0 0 0.15rem 0;
  line-height: 1.2;

  @media (max-width: 768px) { font-size: 1.25rem; }
`;

const DetailId = styled.span`
  font-size: 0.78rem;
  font-weight: 500;
  text-transform: uppercase;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
`;

const DetailPriceBlock = styled.div`
  text-align: right;
  flex-shrink: 0;

  @media (max-width: 480px) {
    text-align: left;
  }
`;

const DetailPrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${p => p.theme.textColor};
  line-height: 1.2;

  @media (max-width: 768px) { font-size: 1.6rem; }
`;

const DetailChange = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: 0.25rem;
  color: ${p => p.$positive ? '#10b981' : p.$neutral ? (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)') : '#ef4444'};

  svg { width: 16px; height: 16px; }

  @media (max-width: 480px) {
    justify-content: flex-start;
  }
`;

const DetailSectionTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'};
  margin: 0 0 0.75rem 0;

  @media (max-width: 768px) { font-size: 0.78rem; }
`;

const DetailSparklineContainer = styled.div`
  height: 220px;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'};

  @media (max-width: 768px) {
    height: 180px;
    border-radius: 10px;
  }

  /* Recharts tooltip styling overrides */
  .recharts-tooltip-wrapper {
    outline: none;
  }
`;

const TimeRangeRow = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.3rem;
    margin-bottom: 0.5rem;
  }
`;

const TimeRangeButton = styled.button`
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  border: 1px solid transparent;
  opacity: ${p => p.disabled ? 0.45 : 1};

  background: ${p => p.$active
    ? p.theme.buttonBackgroundColor
    : p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.04)'
  };
  color: ${p => p.$active
    ? 'white'
    : p.theme.mode === 'dark'
      ? 'rgba(255,255,255,0.6)'
      : 'rgba(0,0,0,0.5)'
  };
  border-color: ${p => p.$active
    ? 'transparent'
    : p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.06)'
  };

  &:hover:not(:disabled) {
    background: ${p => p.$active
      ? p.theme.buttonBackgroundColor
      : p.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.07)'
    };
  }

  @media (max-width: 768px) {
    padding: 0.3rem 0.7rem;
    font-size: 0.7rem;
  }
`;

const ChartTooltipBox = styled.div`
  background: ${p => p.$dark
    ? 'rgba(30, 30, 30, 0.95)'
    : 'rgba(255, 255, 255, 0.97)'
  };
  border: 1px solid ${p => p.$dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  font-size: 0.78rem;
  line-height: 1.5;

  .tooltip-date {
    color: ${p => p.$dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'};
    font-size: 0.68rem;
    margin-bottom: 0.15rem;
  }

  .tooltip-price {
    font-weight: 700;
    color: ${p => p.$dark ? '#fff' : '#1f2937'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`;

const StatItem = styled.div`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
  border-radius: 10px;
  padding: 0.85rem;

  @media (max-width: 768px) {
    padding: 0.65rem;
    border-radius: 8px;
  }
`;

const StatLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'};
  margin-bottom: 0.25rem;

  @media (max-width: 768px) { font-size: 0.62rem; }
`;

const StatValue = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${p => p.$color || p.theme.textColor};
  line-height: 1.2;

  @media (max-width: 768px) { font-size: 0.92rem; }
`;

/* ─── Loading / Error ─── */

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: ${p => p.theme.textColor};
  text-align: center;

  p { margin-top: 1rem; font-size: 1rem; opacity: 0.8; }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${p => p.theme.textColor};

  h3 { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; opacity: 0.9; }
  p { font-size: 0.9rem; opacity: 0.6; max-width: 400px; margin: 0 auto; line-height: 1.5; }
`;

const RetryButton = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${p => p.theme.buttonBackgroundColor};
  color: white;
  transition: all 0.2s;

  &:hover { transform: scale(1.03); }
  svg { width: 15px; height: 15px; }
`;

/* ─── Summary Cards ─── */

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
    margin-bottom: 1rem;
  }
`;

const SummaryCard = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(255,255,255,0.9)'
  };
  border: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.05)'
  };
  border-radius: 12px;
  padding: 1rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    border-radius: 10px;
  }
`;

const SummaryLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'};
  margin-bottom: 0.3rem;

  @media (max-width: 768px) {
    font-size: 0.62rem;
  }
`;

const SummaryValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${p => p.$color || p.theme.textColor};
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

/* ─── Sorting ─── */

const SortRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 0.25rem;

  @media (max-width: 768px) {
    margin-bottom: 0.75rem;
  }
`;

const ResultsCount = styled.span`
  font-size: 0.8rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.72rem;
  }
`;

const SortSelect = styled.select`
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  font-size: 0.8rem;
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

  @media (max-width: 768px) {
    font-size: 16px !important;
    padding: 0.35rem 0.5rem;
  }
`;

/* ─── TradingView Section Styled Components ─── */

const TvCardWrapper = styled.div`
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'
  };
  background: ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.7)'
  };

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.theme.mode === 'dark'
      ? '0 8px 24px rgba(0, 0, 0, 0.35)'
      : '0 8px 24px rgba(0, 0, 0, 0.08)'
    };
    border-color: ${p => p.theme.buttonBackgroundColor}40;
  }

  &:active {
    transform: translateY(0px);
  }

  @media (max-width: 768px) {
    border-radius: 12px;
    &:hover { transform: none; }
  }
`;

const TvCardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.6rem;
  background: linear-gradient(
    transparent,
    ${p => p.theme.mode === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.45)'}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 2;

  span {
    color: white;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.3rem 0.85rem;
    background: ${p => p.theme.buttonBackgroundColor};
    border-radius: 8px;
    backdrop-filter: blur(4px);
  }

  ${TvCardWrapper}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
    background: linear-gradient(
      transparent 20%,
      ${p => p.theme.mode === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.3)'}
    );
    padding: 0.4rem;

    span {
      font-size: 0.7rem;
      padding: 0.25rem 0.65rem;
    }
  }
`;

const CurrencyNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
  margin-bottom: 1.25rem;
  padding: 0.6rem 1rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'};
  border-radius: 10px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  text-align: center;
  line-height: 1.4;

  svg { width: 14px; height: 14px; flex-shrink: 0; }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.5rem 0.75rem;
  }
`;

const TvSearchHint = styled.div`
  text-align: center;
  font-size: 0.72rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
  margin-top: -0.75rem;
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    font-size: 0.66rem;
    margin-bottom: 1rem;
  }
`;

/* Exchange selector chips */
const ExchangeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const ExchangeChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${p =>
    p.$active
      ? p.theme.buttonBackgroundColor
      : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
  };
  background: ${p =>
    p.$active
      ? p.theme.buttonBackgroundColor + '22'
      : 'transparent'
  };
  color: ${p =>
    p.$active
      ? p.theme.buttonBackgroundColor
      : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'
  };

  &:hover {
    border-color: ${p => p.theme.buttonBackgroundColor}80;
    background: ${p => p.theme.buttonBackgroundColor}11;
  }

  .flag { font-size: 0.82rem; line-height: 1; }

  @media (max-width: 768px) {
    font-size: 0.66rem;
    padding: 0.25rem 0.55rem;
    gap: 0.2rem;
  }
`;

const ExchangePrefix = styled.span`
  opacity: 0.5;
  font-size: 0.64rem;
  font-family: monospace;
`;

const TraderToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1.25rem;

  border: 1px solid ${p => p.$active
    ? p.theme.buttonBackgroundColor
    : p.theme.mode === 'dark'
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(0,0,0,0.08)'
  };

  background: ${p => p.$active
    ? `${p.theme.buttonBackgroundColor}15`
    : p.theme.mode === 'dark'
      ? 'rgba(255,255,255,0.04)'
      : 'rgba(0,0,0,0.02)'
  };

  color: ${p => p.$active
    ? p.theme.buttonBackgroundColor
    : p.theme.mode === 'dark'
      ? 'rgba(255,255,255,0.6)'
      : 'rgba(0,0,0,0.5)'
  };

  svg { width: 18px; height: 18px; }

  &:hover {
    border-color: ${p => p.theme.buttonBackgroundColor};
    color: ${p => p.theme.buttonBackgroundColor};
    background: ${p => p.theme.buttonBackgroundColor}10;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    font-size: 0.82rem;
    padding: 0.65rem 1.25rem;
  }
`;

/* Two-column grid for profile + fundamentals on desktop */
const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ProfileGridItem = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
  border-radius: 16px;
  overflow: hidden;
  min-height: 0;

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

/* Disclaimer banner for technical analysis section */
const DisclaimerBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.72rem;
  line-height: 1.5;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  padding: 0.65rem 1rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,165,0,0.06)' : 'rgba(255,165,0,0.05)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,165,0,0.15)' : 'rgba(255,165,0,0.12)'};
  border-radius: 10px;
  margin-bottom: 0.75rem;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    margin-top: 1px;
    color: ${p => p.theme.mode === 'dark' ? 'rgba(255,180,50,0.7)' : 'rgba(200,120,0,0.7)'};
  }

  @media (max-width: 768px) {
    font-size: 0.66rem;
    padding: 0.5rem 0.75rem;
    gap: 0.4rem;
  }
`;

/* ═══════════════════════════════════════════════════════════════
   Mini Sparkline SVG
   ═══════════════════════════════════════════════════════════════ */

const Sparkline = React.memo(({ data, color, height = 48 }) => {
  if (!data || data.length < 2) return null;

  // Sample ~60 points for smoothness
  const step = Math.max(1, Math.floor(data.length / 60));
  const sampled = data.filter((_, i) => i % step === 0);

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;
  const width = 300;
  const padding = 2;

  const points = sampled.map((v, i) => {
    const x = (i / (sampled.length - 1)) * width;
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Area fill
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <SparklineContainer>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height="100%">
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon
          points={areaPoints}
          fill={`url(#grad-${color.replace('#', '')})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </SparklineContainer>
  );
});

Sparkline.displayName = 'Sparkline';

/* ─── Detail Sparkline (Interactive Recharts version for detail view) ─── */

const DetailSparkline = React.memo(({ data, color, timeRange = '7d', theme, fmtPrice: externalFmtPrice, fromEUR: convertFromEUR }) => {
  if (!data || data.length < 2) return null;

  const isDark = theme?.mode === 'dark';

  // Map time range to number of hourly data points to display
  const RANGE_POINTS = {
    '24h':  24,
    '7d':   168,
    '30d':  720,
    '90d':  2160,
    '6m':   4380,
    '1y':   8760,
    'all':  Infinity,
  };

  const desiredPoints = RANGE_POINTS[timeRange] || 168;
  const slicedData = desiredPoints >= data.length ? data : data.slice(-desiredPoints);

  // Build chart data with time labels
  // Points are hourly going back from "now"
  const now = Date.now();
  const hoursBack = slicedData.length;
  const startTime = now - hoursBack * 3600_000;

  const chartData = slicedData.map((price, i) => ({
    time: startTime + i * 3600_000,
    price,
  }));

  // Format X-axis ticks depending on range
  const formatXTick = (timestamp) => {
    const d = new Date(timestamp);
    if (timeRange === '24h') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (['7d', '30d'].includes(timeRange)) {
      return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    }
    // Longer ranges: show month + year
    return d.toLocaleDateString([], { month: 'short', year: '2-digit' });
  };

  // Format Y-axis ticks — convert EUR → display currency for consistent labels
  const formatYTick = (value) => {
    const v = convertFromEUR ? convertFromEUR(value) : value;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    if (v >= 1) return v.toFixed(1);
    if (v >= 0.01) return v.toFixed(3);
    return v.toFixed(5);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const { time, price } = payload[0].payload;
    const d = new Date(time);
    const dateStr = timeRange === '24h'
      ? d.toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
      : d.toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
      <ChartTooltipBox $dark={isDark}>
        <div className="tooltip-date">{dateStr}</div>
        <div className="tooltip-price">{externalFmtPrice ? externalFmtPrice(price) : price.toFixed(2)}</div>
      </ChartTooltipBox>
    );
  };

  const gradientId = `detail-area-${color.replace('#', '')}`;

  return (
    <DetailSparklineContainer theme={theme}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tickFormatter={formatXTick}
            tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={formatYTick}
            tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
            axisLine={false}
            tickLine={false}
            width={48}
            domain={['auto', 'auto']}
          />
          <ReTooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: isDark ? '#1a1a1a' : '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </DetailSparklineContainer>
  );
});

DetailSparkline.displayName = 'DetailSparkline';

/* ═══════════════════════════════════════════════════════════════
   Asset Categories Configuration
   ═══════════════════════════════════════════════════════════════ */

const ASSET_CATEGORIES = [
  { id: 'crypto',      icon: Bitcoin,    available: true,  type: 'custom'      },
  { id: 'etf',         icon: BarChart3,  available: true,  type: 'tradingview' },
  { id: 'stocks',      icon: Briefcase,  available: true,  type: 'tradingview' },
  { id: 'forex',       icon: DollarSign, available: true,  type: 'tradingview' },
  { id: 'commodities', icon: Gem,        available: true,  type: 'tradingview' },
  { id: 'bonds',       icon: Landmark,   available: false, type: 'locked'      },
];

/* ═══════════════════════════════════════════════════════════════
   Popular Symbols per Category (TradingView)
   ═══════════════════════════════════════════════════════════════ */

const POPULAR_SYMBOLS = {
  stocks: [
    // 🇺🇸 US – NASDAQ
    { symbol: 'NASDAQ:AAPL',  name: 'Apple',              shortName: 'AAPL' },
    { symbol: 'NASDAQ:MSFT',  name: 'Microsoft',          shortName: 'MSFT' },
    { symbol: 'NASDAQ:GOOGL', name: 'Alphabet (Google)',   shortName: 'GOOGL' },
    { symbol: 'NASDAQ:AMZN',  name: 'Amazon',             shortName: 'AMZN' },
    { symbol: 'NASDAQ:NVDA',  name: 'NVIDIA',             shortName: 'NVDA' },
    { symbol: 'NASDAQ:TSLA',  name: 'Tesla',              shortName: 'TSLA' },
    { symbol: 'NASDAQ:META',  name: 'Meta Platforms',      shortName: 'META' },
    { symbol: 'NASDAQ:NFLX',  name: 'Netflix',             shortName: 'NFLX' },
    { symbol: 'NASDAQ:AMD',   name: 'AMD',                 shortName: 'AMD' },
    // 🇺🇸 US – NYSE
    { symbol: 'NYSE:BRK.B',   name: 'Berkshire Hathaway',  shortName: 'BRK.B' },
    { symbol: 'NYSE:JPM',     name: 'JPMorgan Chase',      shortName: 'JPM' },
    { symbol: 'NYSE:V',       name: 'Visa',               shortName: 'V' },
    { symbol: 'NYSE:JNJ',     name: 'Johnson & Johnson',   shortName: 'JNJ' },
    { symbol: 'NYSE:KO',      name: 'Coca-Cola',           shortName: 'KO' },
    { symbol: 'NYSE:WMT',     name: 'Walmart',             shortName: 'WMT' },
    { symbol: 'NYSE:DIS',     name: 'Walt Disney',         shortName: 'DIS' },
    { symbol: 'NYSE:BA',      name: 'Boeing',              shortName: 'BA' },
    // �🇪 Germany (Xetra) — verified working
    { symbol: 'XETR:SAP',     name: 'SAP',                 shortName: 'SAP' },
    { symbol: 'XETR:SIE',     name: 'Siemens',             shortName: 'SIE' },
    { symbol: 'XETR:ALV',     name: 'Allianz',             shortName: 'ALV' },
    { symbol: 'XETR:DTE',     name: 'Deutsche Telekom',    shortName: 'DTE' },
    { symbol: 'XETR:BAS',     name: 'BASF',                shortName: 'BAS' },
    // �🇹 Italy – Milan (embedding OK)
    { symbol: 'MIL:UCG',      name: 'UniCredit',           shortName: 'UCG' },
    { symbol: 'MIL:ISP',      name: 'Intesa Sanpaolo',     shortName: 'ISP' },
    { symbol: 'MIL:ENI',      name: 'Eni',                 shortName: 'ENI' },
    { symbol: 'MIL:ENEL',     name: 'Enel',                shortName: 'ENEL' },
    { symbol: 'MIL:RACE',     name: 'Ferrari',             shortName: 'RACE' },
  ],
  etf: [
    // 🇺🇸 US – AMEX / NASDAQ
    { symbol: 'AMEX:SPY',     name: 'SPDR S&P 500',                 shortName: 'SPY' },
    { symbol: 'AMEX:VOO',     name: 'Vanguard S&P 500',             shortName: 'VOO' },
    { symbol: 'NASDAQ:QQQ',   name: 'Invesco QQQ (Nasdaq 100)',     shortName: 'QQQ' },
    { symbol: 'AMEX:VTI',     name: 'Vanguard Total Stock Market',  shortName: 'VTI' },
    { symbol: 'AMEX:VT',      name: 'Vanguard Total World Stock',   shortName: 'VT' },
    { symbol: 'AMEX:DIA',     name: 'SPDR Dow Jones Industrial',    shortName: 'DIA' },
    { symbol: 'AMEX:VWO',     name: 'Vanguard Emerging Markets',    shortName: 'VWO' },
    { symbol: 'AMEX:EFA',     name: 'iShares MSCI EAFE',            shortName: 'EFA' },
    { symbol: 'AMEX:IWM',     name: 'iShares Russell 2000',         shortName: 'IWM' },
    { symbol: 'AMEX:GLD',     name: 'SPDR Gold Trust',              shortName: 'GLD' },
    { symbol: 'NASDAQ:TLT',   name: 'iShares 20+ Year Treasury',    shortName: 'TLT' },
    { symbol: 'AMEX:VNQ',     name: 'Vanguard Real Estate',         shortName: 'VNQ' },
    { symbol: 'AMEX:SCHD',    name: 'Schwab US Dividend Equity',    shortName: 'SCHD' },
    { symbol: 'AMEX:HYG',     name: 'iShares High Yield Corp Bond', shortName: 'HYG' },
    { symbol: 'AMEX:ARKK',    name: 'ARK Innovation',               shortName: 'ARKK' },
    { symbol: 'AMEX:XLF',     name: 'Financial Select SPDR',        shortName: 'XLF' },
    { symbol: 'AMEX:URTH',    name: 'iShares MSCI World',           shortName: 'URTH' },
    { symbol: 'AMEX:IEMG',    name: 'iShares Core MSCI Emerging Mkts', shortName: 'IEMG' },
    { symbol: 'AMEX:EEM',     name: 'iShares MSCI Emerging Markets', shortName: 'EEM' },
    // 🇩🇪 Germany (Xetra)
    { symbol: 'XETR:EUNL',    name: 'iShares Core MSCI World (EUR)', shortName: 'EUNL' },
    { symbol: 'XETR:VWCE',    name: 'Vanguard FTSE All-World (Acc)', shortName: 'VWCE' },
    { symbol: 'XETR:IUSQ',    name: 'iShares MSCI ACWI',           shortName: 'IUSQ' },
    { symbol: 'XETR:IUSN',    name: 'iShares MSCI World Small Cap', shortName: 'IUSN' },
    // 🇬🇧 London Stock Exchange (European cross-listed)
    { symbol: 'LSE:SWDA',      name: 'iShares Core MSCI World',        shortName: 'SWDA' },
    { symbol: 'LSE:CSSPX',     name: 'iShares Core S&P 500 (Acc)',     shortName: 'CSSPX' },
    { symbol: 'LSE:EIMI',      name: 'iShares Core MSCI EM IMI',       shortName: 'EIMI' },
    { symbol: 'LSE:EMIM',      name: 'iShares Core MSCI EM IMI (GBP)', shortName: 'EMIM' },
  ],
  commodities: [
    { symbol: 'TVC:GOLD',      name: 'Gold',          shortName: 'XAU' },
    { symbol: 'TVC:SILVER',    name: 'Silver',        shortName: 'XAG' },
    { symbol: 'TVC:PLATINUM',  name: 'Platinum',      shortName: 'XPT' },
  ],
  forex: [
    // Major pairs
    { symbol: 'FX:EURUSD',    name: 'Euro / US Dollar',          shortName: 'EUR/USD' },
    { symbol: 'FX:GBPUSD',    name: 'British Pound / US Dollar', shortName: 'GBP/USD' },
    { symbol: 'FX:USDJPY',    name: 'US Dollar / Japanese Yen',  shortName: 'USD/JPY' },
    { symbol: 'FX:USDCHF',    name: 'US Dollar / Swiss Franc',   shortName: 'USD/CHF' },
    { symbol: 'FX:AUDUSD',    name: 'Australian Dollar / US Dollar', shortName: 'AUD/USD' },
    { symbol: 'FX:USDCAD',    name: 'US Dollar / Canadian Dollar',   shortName: 'USD/CAD' },
    { symbol: 'FX:NZDUSD',    name: 'New Zealand Dollar / US Dollar', shortName: 'NZD/USD' },
    // Euro crosses
    { symbol: 'FX:EURGBP',    name: 'Euro / British Pound',      shortName: 'EUR/GBP' },
    { symbol: 'FX:EURJPY',    name: 'Euro / Japanese Yen',       shortName: 'EUR/JPY' },
    { symbol: 'FX:EURCHF',    name: 'Euro / Swiss Franc',        shortName: 'EUR/CHF' },
    { symbol: 'FX:EURAUD',    name: 'Euro / Australian Dollar',  shortName: 'EUR/AUD' },
    { symbol: 'FX:EURCAD',    name: 'Euro / Canadian Dollar',    shortName: 'EUR/CAD' },
    // Yen crosses
    { symbol: 'FX:GBPJPY',    name: 'British Pound / Japanese Yen', shortName: 'GBP/JPY' },
    { symbol: 'FX:CHFJPY',    name: 'Swiss Franc / Japanese Yen',   shortName: 'CHF/JPY' },
    { symbol: 'FX:AUDJPY',    name: 'Australian Dollar / Yen',      shortName: 'AUD/JPY' },
    // Emerging & other
    { symbol: 'FX:USDTRY',    name: 'US Dollar / Turkish Lira',     shortName: 'USD/TRY' },
    { symbol: 'FX:USDPLN',    name: 'US Dollar / Polish Zloty',     shortName: 'USD/PLN' },
    { symbol: 'FX:USDSEK',    name: 'US Dollar / Swedish Krona',    shortName: 'USD/SEK' },
    { symbol: 'FX:USDNOK',    name: 'US Dollar / Norwegian Krone',  shortName: 'USD/NOK' },
    { symbol: 'FX:USDINR',    name: 'US Dollar / Indian Rupee',     shortName: 'USD/INR' },
    { symbol: 'FX:USDCNY',    name: 'US Dollar / Chinese Yuan',     shortName: 'USD/CNY' },
    { symbol: 'FX:USDBRL',    name: 'US Dollar / Brazilian Real',   shortName: 'USD/BRL' },
    { symbol: 'FX:USDMXN',    name: 'US Dollar / Mexican Peso',     shortName: 'USD/MXN' },
    { symbol: 'FX:USDHUF',    name: 'US Dollar / Hungarian Forint', shortName: 'USD/HUF' },
    { symbol: 'FX:USDCZK',    name: 'US Dollar / Czech Koruna',     shortName: 'USD/CZK' },
    { symbol: 'FX:USDRON',    name: 'US Dollar / Romanian Leu',     shortName: 'USD/RON' },
    { symbol: 'FX:USDDKK',    name: 'US Dollar / Danish Krone',     shortName: 'USD/DKK' },
  ],

};

/* ═══════════════════════════════════════════════════════════════
   Exchanges per Category – user-friendly selector
   ═══════════════════════════════════════════════════════════════ */

const EXCHANGES = {
  stocks: [
    { prefix: '',         flag: '🌍', labelKey: 'allExchanges'   },
    { prefix: 'NASDAQ',   flag: '🇺🇸', labelKey: 'nasdaq'         },
    { prefix: 'NYSE',     flag: '🇺🇸', labelKey: 'nyse'           },
    { prefix: 'XETR',     flag: '🇩🇪', labelKey: 'xetra'          },
    { prefix: 'MIL',      flag: '🇮🇹', labelKey: 'borsaItaliana'  },
  ],
  etf: [
    { prefix: '',         flag: '🌍', labelKey: 'allExchanges'   },
    { prefix: 'AMEX',     flag: '🇺🇸', labelKey: 'amex'           },
    { prefix: 'NASDAQ',   flag: '🇺🇸', labelKey: 'nasdaq'         },
    { prefix: 'XETR',     flag: '🇩🇪', labelKey: 'xetra'          },
    { prefix: 'LSE',      flag: '🇬🇧', labelKey: 'lse'            },
  ],
  commodities: [
    { prefix: '',         flag: '🌍', labelKey: 'allExchanges'   },
    { prefix: 'TVC',      flag: '📊', labelKey: 'tvc'            },
    { prefix: 'COMEX',    flag: '🇺🇸', labelKey: 'comex'          },
    { prefix: 'NYMEX',    flag: '🇺🇸', labelKey: 'nymex'          },
  ],
  forex: [
    { prefix: '',         flag: '🌍', labelKey: 'allExchanges'   },
    { prefix: 'FX',       flag: '💱', labelKey: 'fx'             },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function MarketPrices() {
  const { theme } = useContext(ThemeContext);
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount, exchangeRates, currencySymbol, fromEUR } = useContext(CurrencyContext);
  const { isDemoMode } = useContext(UserContext);
  const t = translations?.marketPrices || {};

  const [activeCategory, setActiveCategory] = useState('crypto');
  const [cryptoData, setCryptoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('marketCap'); // marketCap | priceAsc | priceDesc | name
  const [selectedAsset, setSelectedAsset] = useState(null); // asset object or null
  const [detailTimeRange, setDetailTimeRange] = useState('7d'); // 24h | 7d | 30d | 90d | 6m | 1y | all

  // TradingView states
  const [tvSearchQuery, setTvSearchQuery] = useState('');
  const [tvSelectedSymbol, setTvSelectedSymbol] = useState(null); // { symbol, name, shortName, category }
  const [showAdvancedChart, setShowAdvancedChart] = useState(false);
  const [failedSymbols, setFailedSymbols] = useState(new Set());
  const [selectedExchange, setSelectedExchange] = useState(''); // exchange prefix or ''
  const [visibleCount, setVisibleCount] = useState(9);          // pagination: show 9 at a time

  // TradingView locale & theme (derived)
  const tvLocale = language === 'it' ? 'it' : 'en';
  const tvColorTheme = theme.mode === 'dark' ? 'dark' : 'light';

  /* ─── Preload TradingView scripts when visiting TV categories ─── */
  useEffect(() => {
    if (['etf', 'stocks', 'commodities', 'forex'].includes(activeCategory)) {
      preloadTradingViewScripts('mini-symbol-overview');
      preloadTradingViewScripts('symbol-info');
    }
  }, [activeCategory]);

  /* ─── Fetch crypto data ─── */
  const fetchCrypto = useCallback(async () => {
    setLoading(true);
    setError(null);

    // In demo mode, always use mock data (no API call needed)
    if (isDemoMode) {
      setCryptoData(mockCryptoData);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get('/api/prices/crypto');
      const data = res.data;

      // Validate: data must be a non-null plain object (not an array or string)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Quick sanity check: first entry should have at least { name, current }
        const firstKey = Object.keys(data)[0];
        if (firstKey && data[firstKey]?.name && data[firstKey]?.current != null) {
          setCryptoData(data);
        } else {
          throw new Error('Unexpected response shape from /api/prices/crypto');
        }
      } else {
        throw new Error('Unexpected response type from /api/prices/crypto');
      }
    } catch (err) {
      console.error('Failed to fetch crypto prices:', err);
      // In dev mode, use mock data so the page is usable for UI work
      if (import.meta.env.DEV) {
        console.info('[MarketPrices] Using mock crypto data (dev fallback)');
        setCryptoData(mockCryptoData);
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchCrypto();
  }, [fetchCrypto]);

  /* ─── Process crypto data into sorted, filterable list ─── */
  // CoinGecko returns all values in USD — convert to EUR (system base currency)
  // so that formatAmount/fromEUR pipeline works correctly.
  const usdToEur = exchangeRates?.USD ? (1 / exchangeRates.USD) : (1 / 1.08);

  const processedCryptoList = useMemo(() => {
    if (!cryptoData) return [];

    const toEurVal = (v) => (v != null ? v * usdToEur : null);

    const list = Object.entries(cryptoData).map(([id, coin]) => {
      // sparkline_in_7d.price = CoinGecko direct; sparkline7D = backend cache shape (see server prices.ts)
      const rawSparkline = coin.sparkline_in_7d?.price ?? coin.sparkline7D ?? coin.sparkline ?? [];
      // Convert sparkline from USD to EUR (CoinGecko sparkline is always in USD)
      const sparkline = rawSparkline.map(p => p * usdToEur);

      // Backend "current" is already in EUR (converted server-side).
      // CoinGecko direct API "current_price" is in USD → needs conversion.
      // TODO: when DB is fixed to store USD, uncomment toEurVal and remove branching.
      const rawPrice = coin.current_price ?? coin.current;
      const price = coin.current != null
        ? rawPrice                  // backend: already EUR
        : toEurVal(rawPrice);       // CoinGecko direct: USD → EUR
      // const price = toEurVal(rawPrice); // ← uncomment when DB stores USD

      // Append current price so chart + stats include the latest real-time value
      if (price != null && sparkline.length > 0) sparkline.push(price);
      const priceStart = sparkline.length > 0 ? sparkline[0] : price;
      const change7d = priceStart > 0
        ? ((price - priceStart) / priceStart) * 100
        : 0;

      // Compute 24h percentage change
      // Backend's change24h is ABSOLUTE and already in EUR.
      // CoinGecko direct API has price_change_percentage_24h (already a %).
      const pctDirect = coin.price_change_percentage_24h ?? coin.priceChangePercentage24h ?? null;
      let change24h;
      if (pctDirect != null) {
        change24h = pctDirect;
      } else {
        // Backend's change24h is absolute EUR → compute percentage
        const absChg = coin.price_change_24h ?? coin.priceChange24h ?? coin.change24h ?? null;
        if (absChg != null && rawPrice != null && (rawPrice - absChg) > 0) {
          change24h = (absChg / (rawPrice - absChg)) * 100;
        } else if (sparkline.length >= 25) {
          // sparkline[length-25] = 24h ago (length-1 is the appended current price)
          const ref = sparkline[sparkline.length - 25];
          change24h = ref > 0 ? ((price - ref) / ref) * 100 : null;
        } else {
          change24h = null;
        }
      }

      // Absolute 24h price change for stats display
      // Backend's change24h is already EUR; CoinGecko's price_change_24h is USD
      const absChange24hRaw = coin.price_change_24h ?? coin.priceChange24h ?? coin.change24h ?? null;
      const absChange24hEur = (coin.change24h != null)
        ? absChange24hRaw                          // backend: already EUR
        : toEurVal(absChange24hRaw);               // CoinGecko: USD → EUR
      // const absChange24hEur = toEurVal(absChange24hRaw); // ← uncomment when DB stores USD

      return {
        id,
        symbol: coin.symbol ?? null,
        name: coin.name,
        image: coin.image,
        price,
        change7d,
        change24h,
        sparkline,
        // Market data (convert monetary values USD → EUR)
        marketCap:                      toEurVal(coin.market_cap                         ?? coin.marketCap)                      ?? null,
        marketCapRank:                  coin.market_cap_rank                    ?? coin.marketCapRank                  ?? null,
        fullyDilutedValuation:          toEurVal(coin.fully_diluted_valuation            ?? coin.fullyDilutedValuation)          ?? null,
        totalVolume:                    toEurVal(coin.total_volume                       ?? coin.totalVolume)                    ?? null,
        high24h:                        toEurVal(coin.high_24h                           ?? coin.high24h)                        ?? null,
        low24h:                         toEurVal(coin.low_24h                            ?? coin.low24h)                         ?? null,
        priceChange24h:                 absChange24hEur                                                                          ?? null,
        marketCapChange24h:             toEurVal(coin.market_cap_change_24h              ?? coin.marketCapChange24h)              ?? null,
        marketCapChangePercentage24h:   coin.market_cap_change_percentage_24h   ?? coin.marketCapChangePercentage24h    ?? null,
        // Supply (NOT monetary — these are coin counts, no conversion needed)
        circulatingSupply:              coin.circulating_supply                 ?? coin.circulatingSupply               ?? null,
        totalSupply:                    coin.total_supply                       ?? coin.totalSupply                     ?? null,
        maxSupply:                      coin.max_supply                         ?? coin.maxSupply                       ?? null,
        // Historical (convert monetary values USD → EUR)
        ath:                            toEurVal(coin.ath)                                ?? null,
        athChangePercentage:            coin.ath_change_percentage              ?? coin.athChangePercentage             ?? null,
        athDate:                        coin.ath_date                           ?? coin.athDate                         ?? null,
        atl:                            toEurVal(coin.atl)                                ?? null,
        atlChangePercentage:            coin.atl_change_percentage              ?? coin.atlChangePercentage             ?? null,
        atlDate:                        coin.atl_date                           ?? coin.atlDate                         ?? null,
        // Misc
        roi:                            coin.roi                                ?? null,
        lastUpdated:                    coin.last_updated                       ?? coin.lastUpdated                     ?? null,
      };
    });

    // Filter by search (name, id, or symbol)
    const filtered = searchQuery
      ? list.filter(c => {
          const q = searchQuery.toLowerCase();
          return c.name.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            (c.symbol && c.symbol.toLowerCase().includes(q));
        })
      : list;

    // Sort
    switch (sortBy) {
      case 'priceDesc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'priceAsc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'change':
        filtered.sort((a, b) => b.change7d - a.change7d);
        break;
      case 'marketCap':
      default:
        // Sort by market cap rank when available, otherwise keep original order
        filtered.sort((a, b) => {
          if (a.marketCapRank != null && b.marketCapRank != null) return a.marketCapRank - b.marketCapRank;
          if (a.marketCapRank != null) return -1;
          if (b.marketCapRank != null) return 1;
          return 0;
        });
        break;
    }

    return filtered;
  }, [cryptoData, searchQuery, sortBy, usdToEur]);

  /* ─── Summary stats for crypto ─── */
  const cryptoSummary = useMemo(() => {
    if (!processedCryptoList.length) return null;

    const avgChange = processedCryptoList.reduce((s, c) => s + c.change7d, 0) / processedCryptoList.length;
    const gainers = processedCryptoList.filter(c => c.change7d > 0).length;
    const losers = processedCryptoList.filter(c => c.change7d < 0).length;
    const best = [...processedCryptoList].sort((a, b) => b.change7d - a.change7d)[0];
    const worst = [...processedCryptoList].sort((a, b) => a.change7d - b.change7d)[0];

    return { avgChange, gainers, losers, best, worst, total: processedCryptoList.length };
  }, [processedCryptoList]);

  /* ─── Format helpers ─── */
  const fmtPrice = (val) => {
    if (val >= 1) return formatAmount(val, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (val >= 0.01) return formatAmount(val, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    return formatAmount(val, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  };

  const fmtPct = (val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  /** Format large numbers in compact notation (1.07T, 28.5B, etc.)
   *  Values are in EUR (system base) — convert to display currency first. */
  const fmtCompact = (eurVal) => {
    if (eurVal == null) return '–';
    const val = fromEUR(eurVal);
    const sym = currencySymbol;
    if (val >= 1e12) return `${sym}${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `${sym}${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${sym}${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `${sym}${(val / 1e3).toFixed(1)}K`;
    return `${sym}${val.toFixed(0)}`;
  };

  /** Format large supply numbers without $ */
  const fmtSupply = (val) => {
    if (val == null) return '–';
    if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
    return val.toLocaleString();
  };

  /** Format ISO date string to short local date */
  const fmtDate = (iso) => {
    if (!iso) return '–';
    try {
      return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '–'; }
  };

  /* ─── Category label from translations ─── */
  const getCategoryLabel = (catId) => t?.categories?.[catId] || catId;

  /* ─── TradingView: Filtered popular symbols (by exchange + text search) ─── */
  const filteredTvSymbols = useMemo(() => {
    let symbols = POPULAR_SYMBOLS[activeCategory] || [];

    // 1. Filter by selected exchange
    if (selectedExchange) {
      symbols = symbols.filter(s => s.symbol.startsWith(selectedExchange + ':'));
    }

    // 2. Filter by text search
    if (tvSearchQuery) {
      const q = tvSearchQuery.toLowerCase();
      symbols = symbols.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.symbol.toLowerCase().includes(q)
      );
    }

    return symbols;
  }, [activeCategory, tvSearchQuery, selectedExchange]);

  /* ─── TradingView: Multi-exchange search results (dynamic symbols created from search) ─── */
  const [dynamicSymbols, setDynamicSymbols] = useState([]);

  /* ─── TradingView: Handle symbol search submit ─── */
  const handleTvSymbolSearch = useCallback((query) => {
    if (!query.trim()) return;

    const trimmed = query.trim();

    // Check if it matches a popular symbol (by name, shortName, or full symbol)
    const allSymbols = POPULAR_SYMBOLS[activeCategory] || [];
    const match = allSymbols.find(s =>
      s.shortName.toLowerCase() === trimmed.toLowerCase() ||
      s.symbol.toLowerCase() === trimmed.toLowerCase() ||
      s.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (match) {
      // Exact match in curated list → go to detail directly
      setTvSelectedSymbol({ ...match, category: activeCategory });
      setDynamicSymbols([]);
    } else if (trimmed.includes(':')) {
      // User specified exchange explicitly (e.g. "TSE:7974") → go directly
      const symbol = trimmed.toUpperCase();
      setTvSelectedSymbol({
        symbol,
        name: symbol.split(':').pop() || symbol,
        shortName: symbol.split(':').pop() || symbol,
        category: activeCategory,
      });
      setDynamicSymbols([]);
    } else if (selectedExchange) {
      // Exchange filter active → prepend exchange prefix
      const symbol = `${selectedExchange}:${trimmed.toUpperCase()}`;
      setTvSelectedSymbol({
        symbol,
        name: trimmed.toUpperCase(),
        shortName: trimmed.toUpperCase(),
        category: activeCategory,
      });
      setDynamicSymbols([]);
    } else {
      // "All" selected, no colon → multi-exchange search: generate cards for multiple exchanges
      const exchanges = (EXCHANGES[activeCategory] || [])
        .filter(e => e.prefix) // skip the "All" entry
        .map(e => e.prefix);
      const ticker = trimmed.toUpperCase();
      const generated = exchanges.map(prefix => ({
        symbol: `${prefix}:${ticker}`,
        name: `${ticker} (${prefix})`,
        shortName: ticker,
        _dynamic: true,
      }));
      setDynamicSymbols(generated);
      setTvSelectedSymbol(null);
    }
  }, [activeCategory, selectedExchange]);

  /* ─── Render : Crypto Content ─── */
  const renderCryptoContent = () => {
    if (loading) {
      return (
        <LoadingContainer theme={theme}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px', height: '40px',
              border: `3px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              borderTop: `3px solid ${theme.buttonBackgroundColor}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }} />
            <p>{t.loading || 'Loading...'}</p>
          </div>
        </LoadingContainer>
      );
    }

    if (error) {
      return (
        <ErrorContainer theme={theme}>
          <h3>{t.errorTitle || 'Error'}</h3>
          <p>{t.errorDescription || 'Failed to load market data.'}</p>
          <RetryButton theme={theme} onClick={fetchCrypto}>
            <RefreshCw /> {t.retry || 'Retry'}
          </RetryButton>
        </ErrorContainer>
      );
    }

    if (!processedCryptoList.length) {
      return (
        <ErrorContainer theme={theme}>
          <h3>{t.noResults || 'No results'}</h3>
          <p>{t.noResultsDescription || 'No assets match your search.'}</p>
        </ErrorContainer>
      );
    }

    return (
      <>
        {/* Summary Cards */}
        {cryptoSummary && (
          <SummaryRow>
            <SummaryCard theme={theme}>
              <SummaryLabel theme={theme}>{t.summary?.totalAssets || 'Assets'}</SummaryLabel>
              <SummaryValue theme={theme}>{cryptoSummary.total}</SummaryValue>
            </SummaryCard>
            <SummaryCard theme={theme}>
              <SummaryLabel theme={theme}>{t.summary?.avgChange7d || 'Avg 7D'}</SummaryLabel>
              <SummaryValue
                theme={theme}
                $color={cryptoSummary.avgChange >= 0 ? '#10b981' : '#ef4444'}
              >
                {fmtPct(cryptoSummary.avgChange)}
              </SummaryValue>
            </SummaryCard>
            <SummaryCard theme={theme}>
              <SummaryLabel theme={theme}>{t.summary?.gainers || 'Gainers'}</SummaryLabel>
              <SummaryValue theme={theme} $color="#10b981">{cryptoSummary.gainers}</SummaryValue>
            </SummaryCard>
            <SummaryCard theme={theme}>
              <SummaryLabel theme={theme}>{t.summary?.losers || 'Losers'}</SummaryLabel>
              <SummaryValue theme={theme} $color="#ef4444">{cryptoSummary.losers}</SummaryValue>
            </SummaryCard>
          </SummaryRow>
        )}

        {/* Search + Sort */}
        <SearchContainer>
          <SearchIcon2 theme={theme}><Search /></SearchIcon2>
          <SearchInput
            theme={theme}
            placeholder={t.searchPlaceholder || 'Search...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <SortRow>
          <ResultsCount theme={theme}>
            {processedCryptoList.length} {t.assetsFound || 'assets'}
          </ResultsCount>
          <SortSelect theme={theme} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="marketCap">{t.sort?.marketCap || 'Market Cap'}</option>
            <option value="priceDesc">{t.sort?.priceDesc || 'Price ↓'}</option>
            <option value="priceAsc">{t.sort?.priceAsc || 'Price ↑'}</option>
            <option value="change">{t.sort?.change || 'Change 7D'}</option>
            <option value="name">{t.sort?.name || 'Name'}</option>
          </SortSelect>
        </SortRow>

        {/* Asset Grid */}
        <AssetsGrid>
          {processedCryptoList.map(coin => {
            // Prefer change24h for color/display; fall back to change7d
            const displayChange = coin.change24h != null ? coin.change24h : coin.change7d;
            const isPositive = displayChange >= 0;
            const sparkColor = coin.change7d >= 0 ? '#10b981' : '#ef4444';

            return (
              <AssetCard key={coin.id} theme={theme} onClick={() => setSelectedAsset(coin)}>
                <CardHeader>
                  <CoinImage
                    src={coin.image}
                    alt={coin.name}
                    theme={theme}
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <CoinInfo>
                    <CoinName theme={theme}>
                      {coin.name}
                      {coin.marketCapRank != null && (
                        <RankBadge theme={theme}>#{coin.marketCapRank}</RankBadge>
                      )}
                    </CoinName>
                    <CoinId theme={theme}>{coin.symbol ? coin.symbol.toUpperCase() : coin.id}</CoinId>
                  </CoinInfo>
                  <PriceBlock>
                    <CurrentPrice theme={theme}>
                      {fmtPrice(coin.price)}
                    </CurrentPrice>
                    <PriceChange theme={theme} $positive={isPositive} $neutral={displayChange === 0}>
                      {isPositive
                        ? <ArrowUpRight />
                        : displayChange < 0
                          ? <ArrowDownRight />
                          : <Minus size={12} />}
                      {fmtPct(displayChange)}
                      <span style={{ opacity: 0.6, marginLeft: '0.15rem' }}>
                        {coin.change24h != null ? '24h' : '7d'}
                      </span>
                    </PriceChange>
                  </PriceBlock>
                </CardHeader>

                <Sparkline data={coin.sparkline} color={sparkColor} />

                {/* Market cap & volume footer (only if data available) */}
                {(coin.marketCap != null || coin.totalVolume != null) && (
                  <CardFooter theme={theme}>
                    {coin.marketCap != null && (
                      <span>{t.detail?.marketCap || 'MCap'}: {fmtCompact(coin.marketCap)}</span>
                    )}
                    {coin.totalVolume != null && (
                      <span>{t.detail?.vol24h || 'Vol'}: {fmtCompact(coin.totalVolume)}</span>
                    )}
                  </CardFooter>
                )}
              </AssetCard>
            );
          })}
        </AssetsGrid>
      </>
    );
  };

  /* ─── Render : Asset Detail View (generic for all asset types) ─── */
  const renderDetailView = (asset) => {
    const displayChange = asset.change24h != null ? asset.change24h : asset.change7d;
    const isPositive = displayChange >= 0;
    const sparkColor = asset.change7d >= 0 ? '#10b981' : '#ef4444';
    const sparkline = asset.sparkline || [];
    const td = t?.detail || {};

    // Map time ranges to required hourly data points
    const TIME_RANGES = [
      { key: '24h',  label: td.period24h || '24H',  points: 24 },
      { key: '7d',   label: td.period7d  || '7D',   points: 168 },
      { key: '30d',  label: td.period30d || '30D',  points: 720 },
      { key: '90d',  label: td.period90d || '90D',  points: 2160 },
      { key: '6m',   label: td.period6m  || '6M',   points: 4380 },
      { key: '1y',   label: td.period1y  || '1Y',   points: 8760 },
      { key: 'all',  label: td.periodAll || 'ALL',  points: 0 }, // always available if sparkline > 168
    ];

    // Build available time range buttons dynamically based on sparkline length
    const availableRanges = TIME_RANGES.filter(r => {
      if (r.key === 'all') return sparkline.length > 168; // only show ALL if more data than 7d
      return sparkline.length >= r.points;
    });

    // Ensure selected time range is valid—fall back to the largest available
    const effectiveRange = availableRanges.find(r => r.key === detailTimeRange)
      ? detailTimeRange
      : (availableRanges.length > 0 ? availableRanges[availableRanges.length - 1].key : '7d');

    // Compute stats from sparkline slice matching the selected time range
    const RANGE_POINTS = { '24h': 24, '7d': 168, '30d': 720, '90d': 2160, '6m': 4380, '1y': 8760, 'all': Infinity };
    const desiredPts = RANGE_POINTS[effectiveRange] || 168;
    const slicedSparkline = desiredPts >= sparkline.length ? sparkline : sparkline.slice(-desiredPts);

    const high = slicedSparkline.length > 0 ? Math.max(...slicedSparkline) : asset.price;
    const low = slicedSparkline.length > 0 ? Math.min(...slicedSparkline) : asset.price;
    const range = high - low;
    const open = slicedSparkline.length > 0 ? slicedSparkline[0] : asset.price;
    const close = asset.price;
    const avg = slicedSparkline.length > 0
      ? slicedSparkline.reduce((s, v) => s + v, 0) / slicedSparkline.length
      : asset.price;
    const pctChange = open > 0 ? ((close - open) / open) * 100 : 0;

    // Volatility: standard deviation as % of mean
    const variance = slicedSparkline.length > 1
      ? slicedSparkline.reduce((s, v) => s + (v - avg) ** 2, 0) / slicedSparkline.length
      : 0;
    const volatility = avg > 0 ? (Math.sqrt(variance) / avg) * 100 : 0;

    const periodLabel = availableRanges.find(r => r.key === effectiveRange)?.label || effectiveRange;

    // Flags for optional data sections
    const hasMarketInfo = asset.marketCap != null || asset.totalVolume != null || asset.circulatingSupply != null || asset.marketCapRank != null || asset.fullyDilutedValuation != null;
    const hasHistorical = asset.ath != null || asset.atl != null;

    return (
      <DetailOverlay>
        <BackButton theme={theme} onClick={() => { setSelectedAsset(null); setDetailTimeRange('7d'); }}>
          <ArrowLeft />
          {td.back || 'Back to list'}
        </BackButton>

        {/* Header: Image + Name + Price */}
        <DetailCard theme={theme}>
          <DetailHeader>
            {asset.image && (
              <DetailImage
                src={asset.image}
                alt={asset.name}
                theme={theme}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            <DetailNameBlock>
              <DetailName theme={theme}>
                {asset.name}
                {asset.marketCapRank != null && (
                  <RankBadge theme={theme} style={{ fontSize: '0.72rem', marginLeft: '0.5rem' }}>
                    #{asset.marketCapRank}
                  </RankBadge>
                )}
              </DetailName>
              <DetailId theme={theme}>
                {asset.symbol ? `${asset.symbol.toUpperCase()} · ${asset.id}` : asset.id}
              </DetailId>
            </DetailNameBlock>
            <DetailPriceBlock>
              <DetailPrice theme={theme}>{fmtPrice(asset.price)}</DetailPrice>
              <DetailChange theme={theme} $positive={isPositive} $neutral={displayChange === 0}>
                {isPositive
                  ? <ArrowUpRight />
                  : displayChange < 0
                    ? <ArrowDownRight />
                    : <Minus size={16} />}
                {fmtPct(displayChange)}
                <span style={{ opacity: 0.5, fontSize: '0.75rem', marginLeft: '0.2rem' }}>
                  {asset.change24h != null ? '24h' : '7d'}
                </span>
              </DetailChange>
            </DetailPriceBlock>
          </DetailHeader>
        </DetailCard>

        {/* Sparkline Chart with Dynamic Time Range Filters */}
        {sparkline.length > 1 && (
          <DetailCard theme={theme}>
            <DetailSectionTitle theme={theme}>
              {td.chartTitle || 'Price Chart'}
            </DetailSectionTitle>

            {/* Time range filter buttons — only show available ranges */}
            {availableRanges.length > 1 && (
              <TimeRangeRow>
                {availableRanges.map(btn => (
                  <TimeRangeButton
                    key={btn.key}
                    theme={theme}
                    $active={effectiveRange === btn.key}
                    onClick={() => setDetailTimeRange(btn.key)}
                  >
                    {btn.label}
                  </TimeRangeButton>
                ))}
              </TimeRangeRow>
            )}

            <DetailSparkline
              data={sparkline}
              color={sparkColor}
              timeRange={effectiveRange}
              theme={theme}
              fmtPrice={fmtPrice}
              fromEUR={fromEUR}
            />
          </DetailCard>
        )}

        {/* Market Info (market cap, volume, supply, rank) — only if data available */}
        {hasMarketInfo && (
          <DetailCard theme={theme}>
            <DetailSectionTitle theme={theme}>
              {td.marketInfo || 'Market Info'}
            </DetailSectionTitle>
            <StatsGrid>
              {asset.marketCapRank != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.rank || 'Rank'}</StatLabel>
                  <StatValue theme={theme}>#{asset.marketCapRank}</StatValue>
                </StatItem>
              )}
              {asset.marketCap != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.marketCap || 'Market Cap'}</StatLabel>
                  <StatValue theme={theme}>{fmtCompact(asset.marketCap)}</StatValue>
                </StatItem>
              )}
              {asset.fullyDilutedValuation != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.fdv || 'FDV'}</StatLabel>
                  <StatValue theme={theme}>{fmtCompact(asset.fullyDilutedValuation)}</StatValue>
                </StatItem>
              )}
              {asset.totalVolume != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.vol24h || '24H Volume'}</StatLabel>
                  <StatValue theme={theme}>{fmtCompact(asset.totalVolume)}</StatValue>
                </StatItem>
              )}
              {asset.high24h != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.high24h || '24H High'}</StatLabel>
                  <StatValue theme={theme} $color="#10b981">{fmtPrice(asset.high24h)}</StatValue>
                </StatItem>
              )}
              {asset.low24h != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.low24h || '24H Low'}</StatLabel>
                  <StatValue theme={theme} $color="#ef4444">{fmtPrice(asset.low24h)}</StatValue>
                </StatItem>
              )}
              {asset.circulatingSupply != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.circulatingSupply || 'Circ. Supply'}</StatLabel>
                  <StatValue theme={theme}>{fmtSupply(asset.circulatingSupply)}</StatValue>
                </StatItem>
              )}
              {asset.totalSupply != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.totalSupply || 'Total Supply'}</StatLabel>
                  <StatValue theme={theme}>{fmtSupply(asset.totalSupply)}</StatValue>
                </StatItem>
              )}
              {asset.maxSupply != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.maxSupply || 'Max Supply'}</StatLabel>
                  <StatValue theme={theme}>{fmtSupply(asset.maxSupply)}</StatValue>
                </StatItem>
              )}
            </StatsGrid>
          </DetailCard>
        )}

        {/* Price Stats */}
        <DetailCard theme={theme}>
          <DetailSectionTitle theme={theme}>
            {td.priceStats || 'Price Stats'} ({periodLabel})
          </DetailSectionTitle>
          <StatsGrid>
            <StatItem theme={theme}>
              <StatLabel theme={theme}>{td.currentPrice || 'Current Price'}</StatLabel>
              <StatValue theme={theme}>{fmtPrice(asset.price)}</StatValue>
            </StatItem>
            <StatItem theme={theme}>
              <StatLabel theme={theme}>{td.change || 'Change'}</StatLabel>
              <StatValue theme={theme} $color={pctChange >= 0 ? '#10b981' : '#ef4444'}>
                {fmtPct(pctChange)}
              </StatValue>
            </StatItem>
            {slicedSparkline.length > 0 && (
              <>
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.open || 'Open'}</StatLabel>
                  <StatValue theme={theme}>{fmtPrice(open)}</StatValue>
                </StatItem>
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.high || 'High'}</StatLabel>
                  <StatValue theme={theme} $color="#10b981">{fmtPrice(high)}</StatValue>
                </StatItem>
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.low || 'Low'}</StatLabel>
                  <StatValue theme={theme} $color="#ef4444">{fmtPrice(low)}</StatValue>
                </StatItem>
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.range || 'Range'}</StatLabel>
                  <StatValue theme={theme}>{fmtPrice(range)}</StatValue>
                </StatItem>
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.avg || 'Average'}</StatLabel>
                  <StatValue theme={theme}>{fmtPrice(avg)}</StatValue>
                </StatItem>
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.volatility || 'Volatility'}</StatLabel>
                  <StatValue theme={theme}>{volatility.toFixed(2)}%</StatValue>
                </StatItem>
              </>
            )}
            {asset.priceChange24h != null && (
              <StatItem theme={theme}>
                <StatLabel theme={theme}>{td.priceChange24h || '24H Δ Price'}</StatLabel>
                <StatValue theme={theme} $color={asset.priceChange24h >= 0 ? '#10b981' : '#ef4444'}>
                  {asset.priceChange24h >= 0 ? '+' : ''}{fmtPrice(asset.priceChange24h)}
                </StatValue>
              </StatItem>
            )}
            <StatItem theme={theme}>
              <StatLabel theme={theme}>{td.identifier || 'Identifier'}</StatLabel>
              <StatValue theme={theme} style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>
                {asset.id}
              </StatValue>
            </StatItem>
            {asset.lastUpdated && (
              <StatItem theme={theme}>
                <StatLabel theme={theme}>{td.lastUpdated || 'Last Updated'}</StatLabel>
                <StatValue theme={theme} style={{ fontSize: '0.85rem' }}>{fmtDate(asset.lastUpdated)}</StatValue>
              </StatItem>
            )}
          </StatsGrid>
        </DetailCard>

        {/* Historical: ATH / ATL — only if data available */}
        {hasHistorical && (
          <DetailCard theme={theme}>
            <DetailSectionTitle theme={theme}>
              {td.historical || 'Historical'}
            </DetailSectionTitle>
            <StatsGrid>
              {asset.ath != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.ath || 'All-Time High'}</StatLabel>
                  <StatValue theme={theme} $color="#10b981">
                    {fmtPrice(asset.ath)}
                    {asset.athChangePercentage != null && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '0.35rem' }}>
                        ({fmtPct(asset.athChangePercentage)})
                      </span>
                    )}
                  </StatValue>
                </StatItem>
              )}
              {asset.athDate && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.athDate || 'ATH Date'}</StatLabel>
                  <StatValue theme={theme} style={{ fontSize: '0.85rem' }}>{fmtDate(asset.athDate)}</StatValue>
                </StatItem>
              )}
              {asset.atl != null && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.atl || 'All-Time Low'}</StatLabel>
                  <StatValue theme={theme} $color="#ef4444">
                    {fmtPrice(asset.atl)}
                    {asset.atlChangePercentage != null && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '0.35rem' }}>
                        ({fmtPct(asset.atlChangePercentage)})
                      </span>
                    )}
                  </StatValue>
                </StatItem>
              )}
              {asset.atlDate && (
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.atlDate || 'ATL Date'}</StatLabel>
                  <StatValue theme={theme} style={{ fontSize: '0.85rem' }}>{fmtDate(asset.atlDate)}</StatValue>
                </StatItem>
              )}
            </StatsGrid>
          </DetailCard>
        )}
      </DetailOverlay>
    );
  };

  /* ─── Render : Locked Category Placeholder ─── */
  const renderLockedSection = (categoryId) => (
    <LockedSection theme={theme}>
      <LockedIcon theme={theme}>
        <Lock />
      </LockedIcon>
      <LockedTitle theme={theme}>
        {getCategoryLabel(categoryId)} – {t.comingSoon || 'Coming Soon'}
      </LockedTitle>
      <LockedDescription theme={theme}>
        {t.lockedDescription || 'This section will be available soon with real-time data.'}
      </LockedDescription>
    </LockedSection>
  );

  /* ─── Render : TradingView Grid Content (for non-crypto categories) ─── */
  const renderTradingViewContent = (categoryId) => {
    const symbols = filteredTvSymbols;
    const tv = t?.tradingView || {};
    const ex = tv?.exchanges || {};
    const exchanges = EXCHANGES[categoryId] || [];

    return (
      <>
        {/* Currency Disclaimer */}
        <CurrencyNote theme={theme}>
          <Info size={14} />
          {tv.currencyNote || 'Prices are displayed in the native exchange currency (primarily USD). Data provided by TradingView.'}
        </CurrencyNote>

        {/* Exchange Selector */}
        {exchanges.length > 1 && (
          <ExchangeRow>
            {exchanges.map(exc => {
              const label = ex[exc.labelKey] || exc.labelKey;
              return (
                <ExchangeChip
                  key={exc.prefix}
                  theme={theme}
                  $active={selectedExchange === exc.prefix}
                  onClick={() => { setSelectedExchange(exc.prefix); setDynamicSymbols([]); setVisibleCount(9); }}
                  title={exc.prefix ? `${exc.prefix}:` : ''}
                >
                  <span className="flag">{exc.flag}</span>
                  {label}
                  {exc.prefix ? <ExchangePrefix>{exc.prefix}:</ExchangePrefix> : null}
                </ExchangeChip>
              );
            })}
          </ExchangeRow>
        )}

        {/* Search */}
        <SearchContainer>
          <SearchIcon2 theme={theme}><Search /></SearchIcon2>
          <SearchInput
            theme={theme}
            placeholder={
              selectedExchange
                ? `${selectedExchange}: ${tv.searchPlaceholder || 'Search by name or symbol...'}`
                : (tv.searchPlaceholder || 'Search by name or symbol (e.g. AAPL, NASDAQ:TSLA)...')
            }
            value={tvSearchQuery}
            onChange={e => setTvSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleTvSymbolSearch(tvSearchQuery);
              }
            }}
          />
        </SearchContainer>

        <TvSearchHint theme={theme}>
          {selectedExchange
            ? (tv.exchangeSearchHint
              || `Searching on ${selectedExchange}. Type a symbol and press Enter.`
            ).replace('{exchange}', selectedExchange)
            : (tv.searchHint || 'Search by name in the list below, or type a symbol and press Enter to load it directly from TradingView')
          }
        </TvSearchHint>

        {/* Results count */}
        <SortRow>
          <ResultsCount theme={theme}>
            {/* Show count of curated + dynamic results, minus failed */}
            {(dynamicSymbols.length > 0
              ? dynamicSymbols.filter(s => !failedSymbols.has(s.symbol)).length
              : symbols.filter(s => !failedSymbols.has(s.symbol)).length
            )} {t.assetsFound || 'assets'}
            {dynamicSymbols.length > 0 && (
              <span
                style={{ marginLeft: '0.75rem', cursor: 'pointer', opacity: 0.6, textDecoration: 'underline' }}
                onClick={() => { setDynamicSymbols([]); setTvSearchQuery(''); setVisibleCount(9); }}
              >
                {tv.clearSearch || '✕ Clear search'}
              </span>
            )}
          </ResultsCount>
        </SortRow>

        {/* Dynamic multi-exchange search results (generated when user searches on "All") */}
        {dynamicSymbols.length > 0 ? (() => {
          const available = dynamicSymbols.filter(s => !failedSymbols.has(s.symbol));
          const visible = available.slice(0, visibleCount);
          const hasMore = available.length > visibleCount;
          return (
            <>
              <AssetsGrid>
                {visible.map(sym => (
                  <TvCardWrapper
                    key={sym.symbol}
                    theme={theme}
                    onClick={() => setTvSelectedSymbol({ ...sym, category: categoryId })}
                  >
                    <TradingViewWidget
                      type="mini-symbol-overview"
                      nonInteractive
                      showSkeleton
                      onError={() => setFailedSymbols(prev => new Set([...prev, sym.symbol]))}
                      config={{
                        symbol: sym.symbol,
                        width: '100%',
                        height: 170,
                        locale: tvLocale,
                        dateRange: '12M',
                        colorTheme: tvColorTheme,
                        isTransparent: true,
                        autosize: false,
                        largeChartUrl: '',
                      }}
                      height={170}
                      borderRadius="14px"
                    />
                    <TvCardOverlay theme={theme}>
                      <span>{tv.viewDetails || 'View Details'} →</span>
                    </TvCardOverlay>
                  </TvCardWrapper>
                ))}
              </AssetsGrid>
              {hasMore && (
                <ShowMoreButton
                  theme={theme}
                  onClick={() => setVisibleCount(prev => prev + 9)}
                >
                  {tv.showMore || 'Show more'}
                  <span className="count">({available.length - visibleCount})</span>
                </ShowMoreButton>
              )}
            </>
          );
        })() : (() => {
          const available = symbols.filter(s => !failedSymbols.has(s.symbol));
          const visible = available.slice(0, visibleCount);
          const hasMore = available.length > visibleCount;
          return available.length > 0 ? (
            <>
              {/* Curated symbols grid */}
              <AssetsGrid>
                {visible.map(sym => (
                  <TvCardWrapper
                    key={sym.symbol}
                    theme={theme}
                    onClick={() => setTvSelectedSymbol({ ...sym, category: categoryId })}
                  >
                    <TradingViewWidget
                      type="mini-symbol-overview"
                      nonInteractive
                      showSkeleton
                      onError={() => setFailedSymbols(prev => new Set([...prev, sym.symbol]))}
                      config={{
                        symbol: sym.symbol,
                        width: '100%',
                        height: 170,
                        locale: tvLocale,
                        dateRange: '12M',
                        colorTheme: tvColorTheme,
                        isTransparent: true,
                        autosize: false,
                        largeChartUrl: '',
                      }}
                      height={170}
                      borderRadius="14px"
                    />
                    <TvCardOverlay theme={theme}>
                      <span>{tv.viewDetails || 'View Details'} →</span>
                    </TvCardOverlay>
                  </TvCardWrapper>
                ))}
              </AssetsGrid>
              {hasMore && (
                <ShowMoreButton
                  theme={theme}
                  onClick={() => setVisibleCount(prev => prev + 9)}
                >
                  {tv.showMore || 'Show more'}
                  <span className="count">({available.length - visibleCount})</span>
                </ShowMoreButton>
              )}
            </>
          ) : (
            <ErrorContainer theme={theme}>
              <h3>{t.noResults || 'No results'}</h3>
              <p>
                {tvSearchQuery
                  ? (tv.noMatchHint || 'No match in the curated list. Press Enter to search this symbol directly on TradingView')
                  : (t.noResultsDescription || 'No assets match your search.')
                }
              </p>
            </ErrorContainer>
          );
        })()}
      </>
    );
  };

  /* ─── Render : TradingView Detail View ─── */
  const renderTradingViewDetail = (symbolData) => {
    const { symbol, name, shortName, category } = symbolData;
    const td = t?.detail || {};
    const tv = t?.tradingView || {};
    const showProfile = category === 'stocks' || category === 'etf';

    // Check if symbol is from curated list vs. user search
    const isCurated = Object.values(POPULAR_SYMBOLS).flat()
      .some(s => s.symbol === symbol);

    return (
      <DetailOverlay>
        <BackButton theme={theme} onClick={() => {
          setTvSelectedSymbol(null);
          setShowAdvancedChart(false);
        }}>
          <ArrowLeft />
          {td.back || 'Back to list'}
        </BackButton>

        {/* Disclaimer for non-curated symbols */}
        {!isCurated && (
          <CurrencyNote theme={theme} style={{ marginBottom: '0.75rem' }}>
            <Info size={14} />
            {tv.symbolDisclaimer || 'This symbol was not verified. Some data or charts may not be available in the embedded preview.'}
          </CurrencyNote>
        )}

        {/* Header – Symbol Info Widget (TradingView) */}
        <DetailCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
          <TradingViewWidget
            type="symbol-info"
            config={{
              symbol,
              width: '100%',
              locale: tvLocale,
              colorTheme: tvColorTheme,
              isTransparent: true,
            }}
            height={100}
          />
        </DetailCard>

        {/* Interactive Chart with Time Ranges */}
        <DetailCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
          <TradingViewWidget
            type="symbol-overview"
            config={{
              symbols: [[symbol, name || shortName]],
              chartOnly: false,
              width: '100%',
              height: 420,
              locale: tvLocale,
              colorTheme: tvColorTheme,
              autosize: false,
              showVolume: true,
              hideDateRanges: false,
              hideMarketStatus: false,
              hideSymbolLogo: false,
              scalePosition: 'right',
              scaleMode: 'Normal',
              fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
              noTimeScale: false,
              valuesTracking: '1',
              changeMode: 'price-and-percent',
              chartType: 'area',
              lineWidth: 2,
              lineType: 0,
              dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
              isTransparent: true,
            }}
            height={420}
          />
        </DetailCard>

        {/* Company / ETF Profile + Fundamental Data (stocks & ETFs) */}
        {showProfile && (
          <ProfileGrid>
            <ProfileGridItem theme={theme}>
              <DetailSectionTitle theme={theme} style={{ padding: '0.75rem 1rem 0' }}>
                {tv.profile || 'Profile'}
              </DetailSectionTitle>
              <TradingViewWidget
                type="symbol-profile"
                config={{
                  width: '100%',
                  height: 340,
                  isTransparent: true,
                  colorTheme: tvColorTheme,
                  symbol,
                  locale: tvLocale,
                }}
                height={340}
              />
            </ProfileGridItem>
            {category === 'stocks' && (
              <ProfileGridItem theme={theme}>
                <DetailSectionTitle theme={theme} style={{ padding: '0.75rem 1rem 0' }}>
                  {tv.fundamentals || 'Fundamentals'}
                </DetailSectionTitle>
                <TradingViewWidget
                  type="financials"
                  config={{
                    symbol,
                    width: '100%',
                    height: 340,
                    isTransparent: true,
                    colorTheme: tvColorTheme,
                    displayMode: 'regular',
                    locale: tvLocale,
                  }}
                  height={340}
                />
              </ProfileGridItem>
            )}
          </ProfileGrid>
        )}

        {/* Disclaimer + Technical Analysis Gauge */}
        <DisclaimerBanner theme={theme}>
          <AlertTriangle size={14} />
          <span>{tv.analysisDisclaimer || 'The following market analysis is provided by TradingView for informational purposes only. It does not constitute financial advice. PaciFinance is not responsible for any decisions based on this data. Always consult a qualified professional.'}</span>
        </DisclaimerBanner>
        <DetailCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
          <DetailSectionTitle theme={theme} style={{ padding: '1rem 1.5rem 0' }}>
            {tv.technicalAnalysis || 'Technical Analysis'}
          </DetailSectionTitle>
          <TradingViewWidget
            type="technical-analysis"
            config={{
              interval: '1M',
              width: '100%',
              isTransparent: true,
              height: 450,
              symbol,
              showIntervalTabs: true,
              displayMode: 'single',
              locale: tvLocale,
              colorTheme: tvColorTheme,
            }}
            height={450}
          />
        </DetailCard>

        {/* Trader Mode Toggle */}
        <TraderToggle
          theme={theme}
          $active={showAdvancedChart}
          onClick={() => setShowAdvancedChart(prev => !prev)}
        >
          <Activity />
          {showAdvancedChart
            ? (tv.hideTraderChart || 'Hide Advanced Chart')
            : (tv.showTraderChart || 'Advanced Chart')
          }
        </TraderToggle>

        {/* Advanced Chart (Trader Mode) */}
        {showAdvancedChart && (
          <DetailCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
            <DetailSectionTitle theme={theme} style={{ padding: '1rem 1.5rem 0' }}>
              {tv.advancedChart || 'Advanced Chart'}
            </DetailSectionTitle>
            <TradingViewWidget
              type="advanced-chart"
              config={{
                symbol,
                width: '100%',
                height: 610,
                interval: 'D',
                timezone: 'Etc/UTC',
                theme: tvColorTheme,
                style: '1',
                locale: tvLocale,
                allow_symbol_change: true,
                calendar: false,
                hide_side_toolbar: false,
                studies: ['STD;RSI'],
                support_host: 'https://www.tradingview.com',
              }}
              height={610}
            />
          </DetailCard>
        )}

        {/* Currency Note (bottom) */}
        <CurrencyNote theme={theme} style={{ marginTop: '0.75rem' }}>
          <Info size={14} />
          {tv.currencyNote || 'Prices shown in native exchange currency (mainly USD).'}
        </CurrencyNote>
      </DetailOverlay>
    );
  };

  /* ─── Main Render ─── */
  return (
    <PageContainer theme={theme}>
      <HeaderSection>
        <PageTitle theme={theme}>
          {t.title || 'Market Prices'}
        </PageTitle>
        <PageSubtitle theme={theme}>
          {t.subtitle || 'Track real-time prices of crypto, ETFs, stocks and more'}
        </PageSubtitle>

        {!loading && !error && cryptoData && activeCategory === 'crypto' && (
          <LastUpdated theme={theme}>
            <RefreshCw />
            {t.updatedAutomatically || 'Updated automatically every hour'}
            {' · '}
            {(t.topByMarketCap || 'Showing the top {count} assets by market cap')
              .replace('{count}', String(Object.keys(cryptoData).length))}
          </LastUpdated>
        )}

        {/* Category Tabs */}
        <NavigationTabs>
          {ASSET_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <TabButton
                key={cat.id}
                theme={theme}
                $active={activeCategory === cat.id}
                disabled={!cat.available}
                onClick={() => {
                  if (cat.available) {
                    setActiveCategory(cat.id);
                    setSelectedAsset(null);
                    setTvSelectedSymbol(null);
                    setTvSearchQuery('');
                    setShowAdvancedChart(false);
                    setSelectedExchange('');
                    setDynamicSymbols([]);
                    setVisibleCount(9);
                  }
                }}
              >
                <Icon />
                <span>{getCategoryLabel(cat.id)}</span>
                {!cat.available && <ComingSoonBadge theme={theme}>SOON</ComingSoonBadge>}
              </TabButton>
            );
          })}
        </NavigationTabs>
      </HeaderSection>

      <MainContent>
        {(() => {
          const cat = ASSET_CATEGORIES.find(c => c.id === activeCategory);
          if (!cat) return null;

          // Locked / coming soon
          if (!cat.available) return renderLockedSection(cat.id);

          // Crypto (custom API)
          if (cat.type === 'custom') {
            return selectedAsset
              ? renderDetailView(selectedAsset)
              : renderCryptoContent();
          }

          // TradingView categories
          return tvSelectedSymbol
            ? renderTradingViewDetail(tvSelectedSymbol)
            : renderTradingViewContent(activeCategory);
        })()}
      </MainContent>
    </PageContainer>
  );
}
