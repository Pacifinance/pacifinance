import React, {useState, useContext, useEffect, useMemo} from 'react';
import BalancesStats from './BalancesStats';
import BalancesChart from './BalancesChart';
import InOutCharts from './InOutChart';
import { useAuth } from '../hooks/useAuth';
import { useDemoServices } from '../hooks/useDemoServices';
import { ThemeContext } from '../contexts/ThemeContext';
import { StandardPageTitle, StyledSectionStats, SecondaryTitle } from '../styles/MyStyled';
import styled from 'styled-components';
import InOutStats from './InOutStats';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { TrendingUp, BarChart3, PieChart, LineChart, DollarSign, TrendingDown, Brain, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import AdvancedInsightsSection from './AdvancedInsightsSection';
import DetailedExpenseAnalysis from './DetailedOutflowsAnalysis';
import HoldingsBreakdownChart from './HoldingsBreakdownChart';
import HoldingsHistoryChart from './HoldingsHistoryChart';
import PortfolioInsights from './PortfolioInsights';
import { getIncomesArray, getOutflowsArray, getBalanceChartData, getTotalIncomesCurrentMonth } from '../utils/userDataSelectors';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import type { InvestmentDividendSummaryDto } from '../types/api';
import { useCryptoGroupingPref, type CryptoGroupingMode } from '../hooks/useCryptoGroupingPref';
import { groupBitcoinWithCrypto } from '../utils/cryptoGrouping';
import CryptoGroupingToggle from '../components/CryptoGroupingToggle';
import InvestmentBenchmarkCard from '../components/InvestmentBenchmarkCard';

/** Every investment-holdings asset key that can appear in the category selector (excludes liquidity/bank/cash). */
const HOLDING_ASSET_KEYS = ['stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities'];

const StatsContainer = styled.div`
  background: ${props => props.theme.mode === 'dark' 
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
  
  @media (max-width: 768px) {
    padding-bottom: 18rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: ${props => props.theme.mode === 'dark'
      ? 'radial-gradient(ellipse at top, rgba(7, 145, 100, 0.15) 0%, transparent 70%)'
      : 'radial-gradient(ellipse at top, rgba(7, 145, 100, 0.08) 0%, transparent 70%)'
    };
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding-top: 4rem;
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

const StatsTitle = styled.h1`
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: ${props => props.theme.textColor};
  letter-spacing: -0.025em;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const StatsSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.55)'};
  margin: 0 0 1rem 0;
  max-width: 500px;
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

const NavigationTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  padding: 0 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  
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
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  
  background: ${props => props.active 
    ? props.theme.buttonBackgroundColor
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.06)' 
      : 'rgba(0, 0, 0, 0.04)'
  };
  
  color: ${props => props.active 
    ? 'white' 
    : props.theme.mode === 'dark' 
      ? 'rgba(255,255,255,0.7)' 
      : 'rgba(0,0,0,0.6)'
  };
  
  border: 1px solid ${props => props.active 
    ? 'transparent' 
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(0, 0, 0, 0.06)'
  };
  
  &:hover:not(:disabled) {
    background: ${props => props.active 
      ? props.theme.buttonBackgroundColor
      : props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.06)'
    };
    color: ${props => props.active ? 'white' : props.theme.textColor};
  }
  
  &:active {
    transform: scale(0.97);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 0.55rem 1rem;
    font-size: 0.85rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.7rem;
    font-size: 0.72rem;
    gap: 0.3rem;
    
    svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
    }
  }
`;

const MainContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 3rem 1rem;
  
  @media (max-width: 768px) {
    padding: 0 0.35rem 2rem 0.35rem;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.25rem, 3vw, 1.6rem);
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: ${props => props.theme.textColor};
  letter-spacing: -0.01em;
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.55)' : 'rgba(0, 0, 0, 0.5)'};
  margin: 0;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    display: none;
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: ${props => props.columns === 2 ? '1fr 1fr' : '1fr'};
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const ChartCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 16px;
  padding: 1.5rem;
  padding-top: 1.5rem;
  min-height: 420px;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 4px 20px rgba(0, 0, 0, 0.06)'
  };
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 8px 30px rgba(0, 0, 0, 0.4)' 
      : '0 8px 30px rgba(0, 0, 0, 0.1)'
    };
  }

  @media (max-width: 768px) {
    padding: 0.6rem;
    padding-top: 0.6rem;
    border-radius: 12px;
    min-height: auto;
    
    &:hover {
      transform: none;
    }
  }
`;

const CategoryPillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const RefreshPricesButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: ${(props) => props.theme.textColor};
  border: 1px dashed ${(props) => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)')};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${(props) => props.theme.buttonBackgroundColor};
    color: ${(props) => props.theme.buttonBackgroundColor};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg { font-size: 0.9rem; }
`;

const PortfolioToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.7rem;
  border-radius: 12px;
  background: ${(props) => props.theme.mode === 'dark' ? 'rgba(255,255,255,.04)' : 'rgba(15,23,42,.035)'};
  border: 1px solid ${(props) => props.theme.mode === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(15,23,42,.07)'};
  ${CategoryPillsRow} { justify-content: flex-start; margin: 0; }
  @media (max-width: 640px) {
    align-items: stretch;
    ${CategoryPillsRow} { width: 100%; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 0.2rem; }
    ${RefreshPricesButton} { justify-content: center; width: 100%; }
  }
`;

const CommunitySpotlight = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px solid ${(props) => props.theme.mode === 'dark' ? 'rgba(16,185,129,.28)' : 'rgba(5,150,105,.22)'};
  background: ${(props) => props.theme.mode === 'dark' ? 'linear-gradient(135deg, rgba(16,185,129,.12), rgba(16,185,129,.045))' : 'linear-gradient(135deg, rgba(16,185,129,.1), rgba(16,185,129,.035))'};
  color: ${(props) => props.theme.textColor};
  .icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; background: rgba(16,185,129,.14); color: ${(props) => props.theme.buttonBackgroundColor}; }
  strong { display: flex; align-items: center; gap: .35rem; font-size: .88rem; }
  p { margin: .22rem 0 0; opacity: .72; font-size: .76rem; line-height: 1.45; }
  button { border: 0; border-radius: 9px; padding: .55rem .8rem; background: ${(props) => props.theme.buttonBackgroundColor}; color: #fff; font-size: .74rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
  @media (max-width: 640px) {
    grid-template-columns: auto 1fr;
    button { grid-column: 1 / -1; width: 100%; }
  }
`;

const CategoryPill = styled.button`
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.active ? props.theme.buttonBackgroundColor : 'transparent')};
  color: ${(props) => (props.active ? 'white' : props.theme.textColor)};
  border: 1px solid ${(props) => (props.active ? 'transparent' : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'))};

  &:hover {
    opacity: 0.9;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: ${props => props.theme.textColor};
  text-align: center;
  
  p {
    margin-top: 1rem;
    font-size: 1rem;
    opacity: 0.8;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: ${props => props.theme.textColor};
  text-align: center;
  padding: 2rem;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    opacity: 0.9;
  }
  
  p {
    font-size: 1rem;
    opacity: 0.7;
    max-width: 400px;
    line-height: 1.6;
  }
`;

// Add the keyframes for the animations
const GlobalAnimations = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInLeft {
    0% {
      opacity: 0;
      transform: translateX(-50px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    0% {
      opacity: 0;
      transform: translateX(50px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  .slide-in-left {
    animation: slideInLeft 0.8s ease-out forwards;
  }
  
  .slide-in-right {
    animation: slideInRight 0.8s ease-out forwards;
  }
`;



export default function StatsCharts() {
    const navigate = useLocalizedNavigate();
    const auth = useAuth();
    const { userData } = auth;
    const { theme } = useContext(ThemeContext);
    const { language, translations } = useContext(LanguageContext);
    const { isHidden } = useContext(PrivacyContext);
    const { investmentService, goalService, statsService } = useDemoServices();
    const [activePage, setActivePage] = useState("statsBilancio");
    const [isLoading, setIsLoading] = useState(true);
    const [investmentHoldings, setInvestmentHoldings] = useState([]);
    const [holdingHistory, setHoldingHistory] = useState([]);
    const [investmentGoals, setInvestmentGoals] = useState([]);
    const [monthlyInvestmentTarget, setMonthlyInvestmentTarget] = useState(null);
    const [monthlyInvestmentTargetPercent, setMonthlyInvestmentTargetPercent] = useState(null);
    const [annualPassiveIncome, setAnnualPassiveIncome] = useState(0);
    const [investmentDividends, setInvestmentDividends] = useState<InvestmentDividendSummaryDto[]>([]);
    const [holdingsLoaded, setHoldingsLoaded] = useState(false);
    const [selectedHoldingAssetKey, setSelectedHoldingAssetKey] = useState(null);
    const [refreshingPrices, setRefreshingPrices] = useState(false);
    const { mode: defaultCryptoGroupingMode } = useCryptoGroupingPref();
    const [cryptoViewMode, setCryptoViewMode] = useState<CryptoGroupingMode>(defaultCryptoGroupingMode);
    const hasBitcoinAndCrypto = useMemo(
        () => investmentHoldings.some((holding) => holding.assetKey === 'bitcoin')
            && investmentHoldings.some((holding) => holding.assetKey === 'crypto'),
        [investmentHoldings],
    );
    const combineCrypto = hasBitcoinAndCrypto && cryptoViewMode === 'combined';
    const displayedHoldings = useMemo(
        () => groupBitcoinWithCrypto(investmentHoldings, combineCrypto),
        [investmentHoldings, combineCrypto],
    );
    const displayedHistory = useMemo(
        () => groupBitcoinWithCrypto(holdingHistory, combineCrypto),
        [holdingHistory, combineCrypto],
    );

    const handleCryptoGroupingChange = (mode: CryptoGroupingMode) => {
        setCryptoViewMode(mode);
        if (mode === 'combined' && selectedHoldingAssetKey === 'bitcoin') setSelectedHoldingAssetKey('crypto');
    };

    // Lazy fetch: only pulled once the Portfolio Holdings tab is actually opened,
    // so users who never visit it never pay for the extra requests.
    useEffect(() => {
        if (activePage !== "holdingsBreakdown" || holdingsLoaded) return;
        let cancelled = false;
        (async () => {
            try {
                const [holdings, history, goals, settings, dividends] = await Promise.all([
                    investmentService.getHoldings(),
                    investmentService.getHoldingHistory(),
                    goalService.getGoals(),
                    investmentService.getSettings(),
                    investmentService.getDividendsSummary(),
                ]);
                if (!cancelled) {
                    setInvestmentHoldings(Array.isArray(holdings) ? holdings : []);
                    setHoldingHistory(Array.isArray(history) ? history : []);
                    setInvestmentGoals(Array.isArray(goals) ? goals : []);
                    setMonthlyInvestmentTarget(settings?.monthlyTarget ?? null);
                    setMonthlyInvestmentTargetPercent(settings?.monthlyTargetPercent ?? null);
                    setAnnualPassiveIncome(Array.isArray(dividends) ? dividends.reduce((sum, item) => sum + (item.totalAmount || 0), 0) : 0);
                    setInvestmentDividends(Array.isArray(dividends) ? dividends : []);
                    setHoldingsLoaded(true);
                }
            } catch (error) {
                console.error('StatsCharts: failed to load holdings breakdown data', error);
            }
        })();
        return () => { cancelled = true; };
    }, [activePage, holdingsLoaded, investmentService, goalService]);

    // Portfolio-wide: refreshes every stock/ETF holding regardless of which
    // category is currently selected (see refreshHoldingPrices server-side),
    // so it lives here rather than inside a single asset key's holdings panel.
    const handleRefreshPrices = async () => {
        if (refreshingPrices) return;
        setRefreshingPrices(true);
        try {
            await investmentService.refreshPrices();
            const [holdings, history] = await Promise.all([
                investmentService.getHoldings(),
                investmentService.getHoldingHistory(),
            ]);
            setInvestmentHoldings(Array.isArray(holdings) ? holdings : []);
            setHoldingHistory(Array.isArray(history) ? history : []);
        } finally {
            setRefreshingPrices(false);
        }
    };

    // Simulate data loading
    useEffect(() => {
        if (userData) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [userData]);
    
    const handlePageChange = (page) => {
        setActivePage(page);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 800);
    };
    
    const hasData = userData && (
        (getBalanceChartData(userData) && getBalanceChartData(userData).length > 0) ||
        (getIncomesArray(userData) && getIncomesArray(userData).length > 0) ||
        (getOutflowsArray(userData) && getOutflowsArray(userData).length > 0)
    );

    const renderBalanceContent = () => {
        if (isLoading) {
            return (
                <LoadingContainer theme={theme}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            border: `3px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                            borderTop: `3px solid ${theme.buttonBackgroundColor}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem auto'
                        }}></div>
                        <p>{translations.graphs.loading.balance}</p>
                    </div>
                </LoadingContainer>
            );
        }

        if (!hasData) {
            return (
                <EmptyStateContainer theme={theme}>
                    <h3>{translations.graphs.emptyState.title}</h3>
                    <p>
                        {translations.graphs.emptyState.balanceDescription}
                    </p>
                </EmptyStateContainer>
            );
        }

        return (
            <>
                <SectionContainer>
                    <ChartGrid columns={1}>
                        <ChartCard theme={theme} className="fade-in-up">
                            <BalancesChart theme={theme} userData={userData} isHidden={isHidden} />
                        </ChartCard>
                    </ChartGrid>
                </SectionContainer>

                <SectionContainer>
                    <SectionHeader>
                        <SectionTitle theme={theme}>
                            {translations.graphs.statsBalance.detailedVision}
                        </SectionTitle>
                        <SectionDescription theme={theme}>
                            {translations.graphs.descriptions.balanceDetails}
                        </SectionDescription>
                    </SectionHeader>
                    
                    <StatsGrid>
                        <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <BalancesStats theme={theme} userData={userData} isHidden={isHidden} />
                        </div>
                    </StatsGrid>
                </SectionContainer>
            </>
        );
    };

    const renderIncomeOutflowContent = () => {
        if (isLoading) {
            return (
                <LoadingContainer theme={theme}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            border: `3px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                            borderTop: `3px solid ${theme.buttonBackgroundColor}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem auto'
                        }}></div>
                        <p>{translations.graphs.loading.incomeOutflow}</p>
                    </div>
                </LoadingContainer>
            );
        }

        if (!hasData) {
            return (
                <EmptyStateContainer theme={theme}>
                    <h3>{translations.graphs.emptyState.title}</h3>
                    <p>
                        {translations.graphs.emptyState.incomeOutflowDescription}
                    </p>
                </EmptyStateContainer>
            );
        }

        return (
            <>
                <SectionContainer>
                    <SectionHeader>
                        <SectionTitle theme={theme}>
                            {translations.graphs.statsOutflows.titleGraph}
                        </SectionTitle>
                        <SectionDescription theme={theme}>
                            {translations.graphs.descriptions.incomeOutflowOverview}
                        </SectionDescription>
                    </SectionHeader>
                    
                    <ChartGrid columns={1}>
                        <ChartCard theme={theme} className="slide-in-left">
                            <InOutCharts 
                                theme={theme} 
                                userData={userData} 
                                isHidden={isHidden} 
                            />
                        </ChartCard>
                    </ChartGrid>
                </SectionContainer>

                <SectionContainer>
                    <SectionHeader>
                        <SectionTitle theme={theme}>
                            {translations.graphs.statsOutflows.detailedVision}
                        </SectionTitle>
                        <SectionDescription theme={theme}>
                            {translations.graphs?.financialOverview?.description || translations.graphs.descriptions.incomeOutflowDetails}
                        </SectionDescription>
                    </SectionHeader>
                    
                    <div className="fade-in-up" style={{ animationDelay: '0.2s', maxWidth: '700px', margin: '0 auto' }}>
                        <InOutStats theme={theme} userData={userData} isHidden={isHidden}/>
                    </div>
                </SectionContainer>

                <SectionContainer>
                    <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <DetailedExpenseAnalysis 
                            theme={theme} 
                            userData={userData} 
                            language={language}
                            isHidden={isHidden}
                        />
                    </div>
                </SectionContainer>
            </>
        );
    };

    const renderHoldingsContent = () => {
        const t = translations.graphs.statsHoldings;
        const availableAssetKeys = HOLDING_ASSET_KEYS.filter((key) =>
            displayedHoldings.some((h) => h.assetKey === key)
        );

        if (!holdingsLoaded) {
            return (
                <LoadingContainer theme={theme}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: `3px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                            borderTop: `3px solid ${theme.buttonBackgroundColor}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem auto'
                        }}></div>
                        <p>{translations.graphs.loading.balance}</p>
                    </div>
                </LoadingContainer>
            );
        }

        if (availableAssetKeys.length === 0) {
            return (
                <EmptyStateContainer theme={theme}>
                    <h3>{t.noHoldingsTitle}</h3>
                    <p>{t.noHoldingsDescription}</p>
                </EmptyStateContainer>
            );
        }

        return (
            <>
                <SectionContainer>
                    <PortfolioToolbar theme={theme}>
                        <CategoryPillsRow>
                            <CategoryPill
                                theme={theme}
                                active={selectedHoldingAssetKey === null}
                                onClick={() => setSelectedHoldingAssetKey(null)}
                            >
                                {t.categorySelector.all}
                            </CategoryPill>
                            {availableAssetKeys.map((key) => (
                                <CategoryPill
                                    key={key}
                                    theme={theme}
                                    active={selectedHoldingAssetKey === key}
                                    onClick={() => setSelectedHoldingAssetKey(key)}
                                >
                                    {translations.assets[key]}
                                </CategoryPill>
                            ))}
                        </CategoryPillsRow>

                    {(availableAssetKeys.includes('stocks') || availableAssetKeys.includes('etf')) && (
                        <RefreshPricesButton theme={theme} type="button" onClick={handleRefreshPrices} disabled={refreshingPrices} data-umami-event="stats-refresh-prices">
                            <RefreshCw size={14} style={refreshingPrices ? { animation: 'spin 1s linear infinite' } : undefined} />
                            {refreshingPrices ? t.refreshingPrices : t.refreshPrices}
                        </RefreshPricesButton>
                    )}
                    </PortfolioToolbar>

                    {hasBitcoinAndCrypto && (
                        <CryptoGroupingToggle
                            theme={theme}
                            mode={cryptoViewMode}
                            onChange={handleCryptoGroupingChange}
                            separateLabel={translations.cryptoGrouping.separate}
                            combinedLabel={translations.cryptoGrouping.combined}
                            explanation={translations.cryptoGrouping.temporaryExplanation}
                        />
                    )}

                    <CommunitySpotlight theme={theme}>
                        <span className="icon"><Users size={21}/></span>
                        <div><strong><ShieldCheck size={15}/>{t.communityDataTitle}</strong><p>{t.communityDataDescription}</p></div>
                        <button type="button" onClick={() => navigate('/dashboard')} data-umami-event="holdings-community-contribute">{t.communityDataAction}</button>
                    </CommunitySpotlight>

                    <ChartGrid columns={2}>
                        <ChartCard theme={theme} className="slide-in-left">
                            <HoldingsBreakdownChart
                                theme={theme}
                                holdings={displayedHoldings}
                                assetKey={availableAssetKeys.length > 1 ? selectedHoldingAssetKey : availableAssetKeys[0]}
                                isHidden={isHidden}
                            />
                        </ChartCard>
                        <ChartCard theme={theme} className="slide-in-right">
                            <HoldingsHistoryChart
                                theme={theme}
                                history={displayedHistory}
                                assetKey={availableAssetKeys.length > 1 ? selectedHoldingAssetKey : availableAssetKeys[0]}
                                isHidden={isHidden}
                                type="area"
                                holdings={displayedHoldings}
                                dividends={investmentDividends}
                            />
                        </ChartCard>
                    </ChartGrid>

                    <PortfolioInsights
                        theme={theme}
                        holdings={displayedHoldings}
                        history={displayedHistory}
                        goals={investmentGoals}
                        assetKey={availableAssetKeys.length > 1 ? selectedHoldingAssetKey : availableAssetKeys[0]}
                        isHidden={isHidden}
                        monthlyTarget={monthlyInvestmentTarget}
                        monthlyTargetPercent={monthlyInvestmentTargetPercent}
                        currentMonthlyIncome={getTotalIncomesCurrentMonth(userData)}
                        annualPassiveIncome={annualPassiveIncome}
                        annualPassiveIncomeTarget={userData?.limits?.annualPassiveIncomeGoal ?? null}
                        positionConcentrationLimit={userData?.limits?.positionConcentrationLimit ?? null}
                        assetCategoryConcentrationLimit={userData?.limits?.assetCategoryConcentrationLimit ?? null}
                    />
                    <InvestmentBenchmarkCard theme={theme} service={statsService} hidden={isHidden}/>
                </SectionContainer>
            </>
        );
    };

    const renderInsightsContent = () => {
        return <AdvancedInsightsSection theme={theme} userData={userData} isHidden={isHidden} />;
    };

    return (
        <>
        <GlobalAnimations />
        <StatsContainer theme={theme}>
            <HeaderSection>
                <StatsTitle theme={theme}>
                    {translations.graphs.title}
                </StatsTitle>
                <StatsSubtitle theme={theme}>
                    {translations.graphs.subtitle}
                </StatsSubtitle>
                
                <NavigationTabs>
                    <TabButton
                        theme={theme}
                        active={activePage === "statsBilancio"}
                        onClick={() => handlePageChange("statsBilancio")}
                    >
                        <BarChart3 />
                        <span>{translations.graphs.statsBalance.title}</span>
                    </TabButton>
                    <TabButton
                        theme={theme}
                        active={activePage === "statsIncomesOutflows"}
                        onClick={() => handlePageChange("statsIncomesOutflows")}
                    >
                        <TrendingUp />
                        <span>{translations.graphs.statsOutflows.title}</span>
                    </TabButton>
                    <TabButton
                        theme={theme}
                        active={activePage === "holdingsBreakdown"}
                        onClick={() => handlePageChange("holdingsBreakdown")}
                    >
                        <PieChart />
                        <span>{translations.graphs.statsHoldings.title}</span>
                    </TabButton>
                    {/* AI Insights tab — hidden for now, to be re-evaluated later
                    <TabButton
                        theme={theme}
                        active={activePage === "insights"}
                        onClick={() => handlePageChange("insights")}
                    >
                        <Brain />
                        <span>{language === 'it' ? 'Insights AI' : 'AI Insights'}</span>
                    </TabButton>
                    */}
                </NavigationTabs>
            </HeaderSection>

            <MainContent>
                {activePage === "statsBilancio" && renderBalanceContent()}
                {activePage === "statsIncomesOutflows" && renderIncomeOutflowContent()}
                {activePage === "holdingsBreakdown" && renderHoldingsContent()}
                {/* activePage === "insights" && renderInsightsContent() */}
            </MainContent>
        </StatsContainer>
        </>
    );
}
