import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import apiClient from '../services/apiClient';
import mockCryptoData from '../data/mockCryptoData';
import {
  TrendingUp, TrendingDown, Minus, Search, RefreshCw,
  BarChart3, Bitcoin, Landmark, Gem, Briefcase, Lock,
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp,
  Info, ArrowLeft, ChevronRight
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
  height: 160px;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'};

  @media (max-width: 768px) {
    height: 120px;
    border-radius: 10px;
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

/* ─── Detail Sparkline (Larger version for detail view) ─── */

const DetailSparkline = React.memo(({ data, color, height = 160 }) => {
  if (!data || data.length < 2) return null;

  const step = Math.max(1, Math.floor(data.length / 120));
  const sampled = data.filter((_, i) => i % step === 0);

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;
  const width = 600;
  const padding = 4;

  const points = sampled.map((v, i) => {
    const x = (i / (sampled.length - 1)) * width;
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <DetailSparklineContainer>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height="100%">
        <defs>
          <linearGradient id={`detail-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <polygon
          points={areaPoints}
          fill={`url(#detail-grad-${color.replace('#', '')})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </DetailSparklineContainer>
  );
});

DetailSparkline.displayName = 'DetailSparkline';

/* ═══════════════════════════════════════════════════════════════
   Asset Categories Configuration
   ═══════════════════════════════════════════════════════════════ */

const ASSET_CATEGORIES = [
  { id: 'crypto',      icon: Bitcoin,    available: true  },
  { id: 'etf',         icon: BarChart3,  available: false },
  { id: 'stocks',      icon: Briefcase,  available: false },
  { id: 'commodities', icon: Gem,        available: false },
  { id: 'bonds',       icon: Landmark,   available: false },
];

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function MarketPrices() {
  const { theme } = useContext(ThemeContext);
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const t = translations?.marketPrices || {};

  const [activeCategory, setActiveCategory] = useState('crypto');
  const [cryptoData, setCryptoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('marketCap'); // marketCap | priceAsc | priceDesc | name
  const [selectedAsset, setSelectedAsset] = useState(null); // asset object or null

  /* ─── Fetch crypto data ─── */
  const fetchCrypto = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/prices/crypto');
      setCryptoData(res.data);
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
  }, []);

  useEffect(() => {
    fetchCrypto();
  }, [fetchCrypto]);

  /* ─── Process crypto data into sorted, filterable list ─── */
  const processedCryptoList = useMemo(() => {
    if (!cryptoData) return [];

    const list = Object.entries(cryptoData).map(([id, coin]) => {
      const sparkline = coin.sparkline || [];
      const priceStart = sparkline.length > 0 ? sparkline[0] : coin.current;
      const change7d = priceStart > 0
        ? ((coin.current - priceStart) / priceStart) * 100
        : 0;

      return {
        id,
        name: coin.name,
        image: coin.image,
        price: coin.current,
        change7d,
        sparkline,
      };
    });

    // Filter by search
    const filtered = searchQuery
      ? list.filter(c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
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
        // Keep original order from CoinGecko (by market cap)
        break;
    }

    return filtered;
  }, [cryptoData, searchQuery, sortBy]);

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

  /* ─── Category label from translations ─── */
  const getCategoryLabel = (catId) => t?.categories?.[catId] || catId;

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
            const isPositive = coin.change7d >= 0;
            const sparkColor = isPositive ? '#10b981' : '#ef4444';

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
                    <CoinName theme={theme}>{coin.name}</CoinName>
                    <CoinId theme={theme}>{coin.id}</CoinId>
                  </CoinInfo>
                  <PriceBlock>
                    <CurrentPrice theme={theme}>
                      {fmtPrice(coin.price)}
                    </CurrentPrice>
                    <PriceChange theme={theme} $positive={isPositive} $neutral={coin.change7d === 0}>
                      {isPositive
                        ? <ArrowUpRight />
                        : coin.change7d < 0
                          ? <ArrowDownRight />
                          : <Minus size={12} />}
                      {fmtPct(coin.change7d)}
                    </PriceChange>
                  </PriceBlock>
                </CardHeader>

                <Sparkline data={coin.sparkline} color={sparkColor} />
              </AssetCard>
            );
          })}
        </AssetsGrid>
      </>
    );
  };

  /* ─── Render : Asset Detail View (generic for all asset types) ─── */
  const renderDetailView = (asset) => {
    const isPositive = asset.change7d >= 0;
    const sparkColor = isPositive ? '#10b981' : '#ef4444';
    const sparkline = asset.sparkline || [];
    const high7d = sparkline.length > 0 ? Math.max(...sparkline) : asset.price;
    const low7d = sparkline.length > 0 ? Math.min(...sparkline) : asset.price;
    const range7d = high7d - low7d;
    const td = t?.detail || {};

    return (
      <DetailOverlay>
        <BackButton theme={theme} onClick={() => setSelectedAsset(null)}>
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
              <DetailName theme={theme}>{asset.name}</DetailName>
              <DetailId theme={theme}>{asset.id}</DetailId>
            </DetailNameBlock>
            <DetailPriceBlock>
              <DetailPrice theme={theme}>{fmtPrice(asset.price)}</DetailPrice>
              <DetailChange theme={theme} $positive={isPositive} $neutral={asset.change7d === 0}>
                {isPositive
                  ? <ArrowUpRight />
                  : asset.change7d < 0
                    ? <ArrowDownRight />
                    : <Minus size={16} />}
                {fmtPct(asset.change7d)}
              </DetailChange>
            </DetailPriceBlock>
          </DetailHeader>
        </DetailCard>

        {/* Sparkline Chart */}
        {sparkline.length > 1 && (
          <DetailCard theme={theme}>
            <DetailSectionTitle theme={theme}>
              {td.sparklineTitle || '7-Day Trend'}
            </DetailSectionTitle>
            <DetailSparkline data={sparkline} color={sparkColor} />
          </DetailCard>
        )}

        {/* Price Stats */}
        <DetailCard theme={theme}>
          <DetailSectionTitle theme={theme}>
            {td.priceStats || 'Price Stats'}
          </DetailSectionTitle>
          <StatsGrid>
            <StatItem theme={theme}>
              <StatLabel theme={theme}>{td.currentPrice || 'Current Price'}</StatLabel>
              <StatValue theme={theme}>{fmtPrice(asset.price)}</StatValue>
            </StatItem>
            <StatItem theme={theme}>
              <StatLabel theme={theme}>{td.change7d || '7-Day Change'}</StatLabel>
              <StatValue theme={theme} $color={isPositive ? '#10b981' : '#ef4444'}>
                {fmtPct(asset.change7d)}
              </StatValue>
            </StatItem>
            {sparkline.length > 0 && (
              <>
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.high7d || '7D High'}</StatLabel>
                  <StatValue theme={theme} $color="#10b981">{fmtPrice(high7d)}</StatValue>
                </StatItem>
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.low7d || '7D Low'}</StatLabel>
                  <StatValue theme={theme} $color="#ef4444">{fmtPrice(low7d)}</StatValue>
                </StatItem>
                <StatItem theme={theme}>
                  <StatLabel theme={theme}>{td.range7d || '7D Range'}</StatLabel>
                  <StatValue theme={theme}>{fmtPrice(range7d)}</StatValue>
                </StatItem>
              </>
            )}
            <StatItem theme={theme}>
              <StatLabel theme={theme}>{td.identifier || 'Identifier'}</StatLabel>
              <StatValue theme={theme} style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>
                {asset.id}
              </StatValue>
            </StatItem>
          </StatsGrid>
        </DetailCard>
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

        {!loading && !error && cryptoData && (
          <LastUpdated theme={theme}>
            <RefreshCw />
            {t.updatedAutomatically || 'Updated automatically every hour'}
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
        {selectedAsset
          ? renderDetailView(selectedAsset)
          : (
            <>
              {activeCategory === 'crypto' && renderCryptoContent()}

              {ASSET_CATEGORIES
                .filter(c => !c.available && activeCategory === c.id)
                .map(c => (
                  <React.Fragment key={c.id}>
                    {renderLockedSection(c.id)}
                  </React.Fragment>
                ))
              }
            </>
          )
        }
      </MainContent>
    </PageContainer>
  );
}
