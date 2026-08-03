import React, { useEffect, useState, useContext, useMemo, lazy, Suspense } from 'react';
import { LocalizedLink } from '../components/LocalizedLink';
import styled from 'styled-components';
// Granular recharts imports: Dashboard is on the critical path (non-lazy in
// AppRouter), so pulling the whole 'recharts' barrel here would drag the full
// charts chunk into the first load. Same pattern as BalancesChart.tsx.
import { PieChart } from 'recharts/lib/chart/PieChart';
import { Pie } from 'recharts/lib/polar/Pie';
import { Cell } from 'recharts/lib/component/Cell';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { 
    BsGraphUpArrow,
    BsWallet2,
    BsArrowUpRight,
    BsArrowDownLeft
} from "react-icons/bs";
import {
    FaChartLine,
    FaRocket,
    FaEuroSign
} from "react-icons/fa";
import {
    AiOutlinePlusCircle
} from "react-icons/ai";
import {
    MdAccountBalance
} from "react-icons/md";
import { assetIcons } from '../data/assetIcons';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { BiTrendingUp, BiWallet, BiListUl } from 'react-icons/bi';

import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { RenderCustomizedLabel } from '../utils/customGraphsInfo';
import { assetColors } from '../data/assetColors.js';
import {
    getCashValue, getBankValue, getDigitalServicesValue, getEmergencyFund,
    getStocksValue, getEtfValue, getBitcoinValue, getCryptoValue, getBondsValue,
    getFundsValue, getCommoditiesValue, getTotalValue, getOutflowsArray, getIncomesArray,
    getCashValuePreMonth, getBankValuePreMonth, getDigitalServicesValuePreMonth,
    getEmergencyFundPreMonth, getStocksValuePreMonth, getEtfValuePreMonth,
    getBitcoinValuePreMonth, getCryptoValuePreMonth, getBondsValuePreMonth,
    getFundsValuePreMonth, getCommoditiesValuePreMonth
} from '../utils/userDataSelectors';
import {
    ModernDashboardHeader,
    ModernBalanceOverview,
    ModernChartsSection,
    ModernChartContainer,
    FloatingElement,
    ModernMetricCard,
    ModernDashboardTitle,
    ModernIncomeExpenseSection,
    ModernIncomeExpenseCard,
    MainDashboardLayout,
    DashboardContent,
    PortfolioGrid,
    PortfolioExtraInfo
} from '../styles/ModernDashboardStyled';
import { useDemoServices } from '../hooks/useDemoServices';
import InvestmentHoldingsPanel from '../components/InvestmentHoldingsPanel';
import LiquidityAccountsPanel from '../components/LiquidityAccountsPanel';
import PortfolioSection from '../components/PortfolioSection';
import PortfolioAssetCard from '../components/PortfolioAssetCard';
import { isVerifiableAssetKey } from '../constants/investmentSchema';
import { LIQUIDITY_KEYS } from '../constants/balanceSchema';
const FinancialInsights = lazy(() => import('../components/FinancialInsights'));
const GoalTracker = lazy(() => import('../components/GoalTracker'));
const OnboardingWelcome = lazy(() => import('./OnboardingWelcome'));
import DashboardSkeleton from '../components/DashboardSkeleton';
import DashboardToolbar from '../components/DashboardToolbar';
import DashboardCompactView from '../components/DashboardCompactView';
import QuickAddTransaction from './QuickAddTransaction';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { FaExclamationTriangle, FaBullseye } from 'react-icons/fa';
import { GiUmbrella } from 'react-icons/gi';
import { isNewUser } from '../utils/userDataSelectors';
import { addCurrency } from '../utils/money';

const ResponsivePadding = styled.div`
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 2rem;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
`;

const OrderedDashboardSections = styled.div`
  display: flex;
  flex-direction: column;
`;

const DashboardSectionSlot = styled.div`
  order: ${p => p.$order};
  min-width: 0;
`;

const Dashboard = ({ theme, userData, isHidden }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { language, translations } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const {
        sections, visibleSections, moveSection, toggleSection, resetLayout, viewMode, toggleViewMode,
        collapsedGroups, toggleGroupCollapsed
    } = useDashboardLayout();
    const { investmentService, liquidityAccountService } = useDemoServices();
    const [investmentHoldings, setInvestmentHoldings] = useState([]);
    const [liquidityAccounts, setLiquidityAccounts] = useState([]);
    const [openSubAccountsAssetKey, setOpenSubAccountsAssetKey] = useState(null);

    const refreshInvestmentHoldings = async () => {
        const holdings = await investmentService.getHoldings();
        setInvestmentHoldings(Array.isArray(holdings) ? holdings : []);
    };

    const refreshLiquidityAccounts = async () => {
        const accounts = await liquidityAccountService.getAccounts();
        setLiquidityAccounts(Array.isArray(accounts) ? accounts : []);
    };

    useEffect(() => {
        refreshInvestmentHoldings();
        refreshLiquidityAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const holdingsByAssetKey = useMemo(() => {
        const map = {};
        for (const holding of investmentHoldings) {
            (map[holding.assetKey] ||= []).push(holding);
        }
        return map;
    }, [investmentHoldings]);

    // A "closed" holding (fully sold) is never deleted, just set to quantity 0
    // (see closeStaleHolding.ts) - filtered out here so it doesn't show as
    // 0,00€ noise in the compact/card overview views. InvestmentHoldingsPanel
    // still gets the unfiltered holdingsByAssetKey above (it needs both, for
    // its own "current"/"past" tabs).
    const activeHoldingsByAssetKey = useMemo(() => {
        const map = {};
        for (const key of Object.keys(holdingsByAssetKey)) {
            map[key] = holdingsByAssetKey[key].filter((h) => (h.quantity ?? 0) > 0);
        }
        return map;
    }, [holdingsByAssetKey]);

    const liquidityAccountsByAssetKey = useMemo(() => {
        const map = {};
        for (const account of liquidityAccounts) {
            (map[account.assetKey] ||= []).push(account);
        }
        return map;
    }, [liquidityAccounts]);

    /** Live value for an asset: sum of its sub-accounts if any exist, otherwise the recorded balance. */
    const liveAssetValue = (assetKey, recordedValue) => {
        const subEntries = LIQUIDITY_KEYS.includes(assetKey)
            ? (liquidityAccountsByAssetKey[assetKey] || [])
            : (holdingsByAssetKey[assetKey] || []);
        if (subEntries.length === 0) return recordedValue;
        return subEntries.reduce((sum, entry) => sum + (entry.currentValue ?? entry.investedAmount ?? 0), 0);
    };


    
    // Stati per i bilanci
    const [stocksValue, setStocksValue] = useState(0);
    const [etfValue, setETFValue] = useState(0);
    const [bankValue, setBankValue] = useState(0);
    const [cashValue, setCashValue] = useState(0);
    const [emergencyFund, setEmergencyFund] = useState(0);
    const [cryptoValue, setCryptoValue] = useState(0);
    const [bitcoinValue, setBitcoinValue] = useState(0);
    const [digitalServicesValue, setDigitalServicesValue] = useState(0);
    const [bondsValue, setBondsValue] = useState(0);
    const [fundsValue, setFundsValue] = useState(0);
    const [commoditiesValue, setCommoditiesValue] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [incomesMonth, setIncomesMonth] = useState(0);
    const [expensesMonth, setExpensesMonth] = useState(0);
    const [savedMonth, setSavedMonth] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (userData) {
                try {
                    
                    setStocksValue(getStocksValue(userData));
                    setETFValue(getEtfValue(userData));
                    setBitcoinValue(getBitcoinValue(userData));
                    setCryptoValue(getCryptoValue(userData));
                    setBankValue(getBankValue(userData));
                    setCashValue(getCashValue(userData));
                    setEmergencyFund(getEmergencyFund(userData));
                    setDigitalServicesValue(getDigitalServicesValue(userData));
                    setBondsValue(getBondsValue(userData));
                    setFundsValue(getFundsValue(userData));
                    setCommoditiesValue(getCommoditiesValue(userData));
                    setTotalValue(getTotalValue(userData));
                    
                    const outflowsArray = getOutflowsArray(userData);
                    const incomesArray = getIncomesArray(userData);
                    
                    setExpensesMonth(outflowsArray[0] || 0);
                    setIncomesMonth(incomesArray[0] || 0);
                    setSavedMonth((incomesArray[0] || 0) - (outflowsArray[0] || 0));
                    
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error set balances:', error);
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [userData]);

    // Dati per i bilanci tradizionali (Banca, Contanti, Servizi Digitali)
    const traditionalAssets = useMemo(() => [
        {
            key: 'bank',
            name: translations.assets.bank,
            value: liveAssetValue('bank', bankValue >= 0 ? bankValue : 0),
            icon: assetIcons.bank,
            color: assetColors.bank.primary,
            gradient: assetColors.bank.gradient
        },
        {
            key: 'cash',
            name: translations.assets.cash,
            value: liveAssetValue('cash', cashValue >= 0 ? cashValue : 0),
            icon: assetIcons.cash,
            color: assetColors.cash.primary,
            gradient: assetColors.cash.gradient
        },
        {
            key: 'digitalServices',
            name: translations.assets.digitalServices,
            value: liveAssetValue('digitalServices', digitalServicesValue >= 0 ? digitalServicesValue : 0),
            icon: assetIcons.digitalServices,
            color: assetColors.digitalServices.primary,
            gradient: assetColors.digitalServices.gradient
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- liveAssetValue only reads liquidityAccountsByAssetKey, already listed
    ], [translations, bankValue, cashValue, digitalServicesValue, liquidityAccountsByAssetKey]);

    // Fondo di Emergenza - Sezione separata
    const emergencyFundAsset = useMemo(() => ({
        key: 'emergencyFund',
        name: translations.assets.emergencyFund,
        value: liveAssetValue('emergencyFund', emergencyFund >= 0 ? emergencyFund : 0),
        icon: assetIcons.emergencyFund,
        color: assetColors.emergencyFund.primary,
        gradient: assetColors.emergencyFund.gradient
    // eslint-disable-next-line react-hooks/exhaustive-deps -- liveAssetValue only reads liquidityAccountsByAssetKey, already listed
    }), [translations, emergencyFund, liquidityAccountsByAssetKey]);

    // Dati per gli investimenti (Azioni, ETF, Bitcoin, Crypto, Bonds, Funds, Materie prime)
    const allInvestments = [
        {
            key: 'stocks',
            name: translations.assets.stocks,
            value: liveAssetValue('stocks', stocksValue >= 0 ? stocksValue : 0),
            icon: assetIcons.stocks,
            color: assetColors.stocks.primary,
            gradient: assetColors.stocks.gradient,
            description: translations.dashboard.stockDescription
        },
        {
            key: 'etf',
            name: translations.assets.etf,
            value: liveAssetValue('etf', etfValue >= 0 ? etfValue : 0),
            icon: assetIcons.etf,
            color: assetColors.etf.primary,
            gradient: assetColors.etf.gradient,
            description: translations.dashboard.etfDescription
        },
        {
            key: 'bitcoin',
            name: translations.assets.bitcoin,
            value: liveAssetValue('bitcoin', bitcoinValue >= 0 ? bitcoinValue : 0),
            icon: assetIcons.bitcoin,
            color: assetColors.bitcoin.primary,
            gradient: assetColors.bitcoin.gradient,
            description: translations.dashboard.bitcoinDescription
        },
        {
            key: 'crypto',
            name: translations.assets.crypto,
            value: liveAssetValue('crypto', cryptoValue >= 0 ? cryptoValue : 0),
            icon: assetIcons.crypto,
            color: assetColors.crypto.primary,
            gradient: assetColors.crypto.gradient,
            description: translations.dashboard.cryptoDescription
        },
        {
            key: 'bonds',
            name: translations.assets.bonds,
            value: liveAssetValue('bonds', bondsValue >= 0 ? bondsValue : 0),
            icon: assetIcons.bonds,
            color: assetColors.bonds.primary,
            gradient: assetColors.bonds.gradient,
            description: translations.dashboard.bondsDescription,
        },
        {
            key: 'funds',
            name: translations.assets.funds,
            value: liveAssetValue('funds', fundsValue >= 0 ? fundsValue : 0),
            icon: assetIcons.funds,
            color: assetColors.funds.primary,
            gradient: assetColors.funds.gradient,
            description: translations.dashboard.fundsDescription,
        },
        {
            key: 'commodities',
            name: translations.assets.commodities,
            value: commoditiesValue >= 0 ? commoditiesValue : 0,
            icon: assetIcons.commodities,
            color: assetColors.commodities.primary,
            gradient: assetColors.commodities.gradient,
            description: translations.dashboard.commoditiesDescription,
        },
    ];

    // Filtra gli investimenti per mostrare solo quelli con valore > 0
    const investments = allInvestments.filter(investment => investment.value > 0);

    const totalTraditional = addCurrency(...traditionalAssets.map(asset => asset.value));
    const totalInvestments = addCurrency(...allInvestments.map(investment => investment.value));
    const totalEmergencySecurity = emergencyFundAsset.value; // For now only emergency fund, but prepared for future additions
    const totalBalance = totalValue;

    // Previous-month totals per category, for the compact view's "vs previous month" deltas
    const categoryPreMonthTotals = useMemo(() => (userData ? {
        liquidity: addCurrency(
            getBankValuePreMonth(userData) || 0,
            getCashValuePreMonth(userData) || 0,
            getDigitalServicesValuePreMonth(userData) || 0,
        ),
        emergency: getEmergencyFundPreMonth(userData) || 0,
        investments: addCurrency(
            getStocksValuePreMonth(userData) || 0,
            getEtfValuePreMonth(userData) || 0,
            getBitcoinValuePreMonth(userData) || 0,
            getCryptoValuePreMonth(userData) || 0,
            getBondsValuePreMonth(userData) || 0,
            getFundsValuePreMonth(userData) || 0,
            getCommoditiesValuePreMonth(userData) || 0,
        ),
    } : null), [userData]);

    // Calcola percentuale obiettivo emergency fund
    const emergencyFundGoal = userData?.goals?.find(goal => goal.type === 'emergencyFund');
    const emergencyFundTarget = emergencyFundGoal?.target || userData?.limits?.emergencyFundTarget;
    const emergencyFundProgress = emergencyFundTarget ? Math.min((emergencyFundAsset.value / emergencyFundTarget) * 100, 100) : null;

    // Dati per i grafici patrimoniali (memoizzati per evitare ricalcoli)
    const pieData = useMemo(() => [
        { name: translations.dashboard.liquidity, value: totalTraditional, color: assetColors.totalLiquidity },
        ...(totalEmergencySecurity > 0 ? [{ name: translations.dashboard.emergencySecurity, value: totalEmergencySecurity, color: emergencyFundAsset.color }] : []),
        { name: translations.general.investments, value: totalInvestments, color: assetColors.totalInvestments }
    ], [totalTraditional, totalEmergencySecurity, totalInvestments, translations, emergencyFundAsset.color]);

    const detailedPieData = useMemo(() => [
        ...traditionalAssets.filter(asset => asset.value > 0).map(asset => ({
            name: asset.name,
            value: asset.value,
            color: asset.color
        })),
        ...(emergencyFundAsset.value > 0 ? [{
            name: emergencyFundAsset.name,
            value: emergencyFundAsset.value,
            color: emergencyFundAsset.color
        }] : []),
        ...investments.filter(investment => investment.value > 0).map(investment => ({
            name: investment.name,
            value: investment.value,
            color: investment.color
        }))
    ], [traditionalAssets, emergencyFundAsset, investments]);

    // Dati per il grafico entrate/uscite (memoizzati)
    const incExpData = useMemo(() => [
        { 
            name: translations.general.incomes, 
            value: incomesMonth >= 0 ? incomesMonth : 0,
            color: assetColors.income
        },
        { 
            name: translations.general.outflows, 
            value: expensesMonth >= 0 ? expensesMonth : 0,
            color: assetColors.expense
        },
        { 
            name: translations.general.saved, 
            value: savedMonth >= 0 ? savedMonth : 0,
            color: assetColors.savings
        },
    ], [incomesMonth, expensesMonth, savedMonth, translations]);

    // Dati shuffled per la privacy (come nel Dashboard originale)
    const pieDataShuffle = [...pieData].sort(() => Math.random() - 0.5);
    const detailedPieDataShuffle = [...detailedPieData].sort(() => Math.random() - 0.5);
    const investmentsShuffle = [...investments].sort(() => Math.random() - 0.5);

    const { formatAmount: ctxFormatAmount } = React.useContext(CurrencyContext);
    const formatCurrency = (value) => {
        if (isHidden) return '****';
        return ctxFormatAmount(value);
    };

    const formatPercentage = (value, total) => {
        if (isHidden || total === 0) return '***';
        return ((value / total) * 100).toFixed(1) + '%';
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${data.payload.color}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ color: assetColors.textPrimary, fontWeight: 'bold', margin: '0 0 4px 0' }}>
                        {isHidden ? '****' : data.payload.name}
                    </p>
                    <p style={{ color: data.payload.color, fontWeight: 'bold', margin: 0 }}>
                        {formatCurrency(data.payload.value)}
                    </p>
                    <p style={{ color: assetColors.textSecondary, fontSize: '12px', margin: '4px 0 0 0' }}>
                        {formatPercentage(data.payload.value, totalBalance)}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <MainDashboardLayout theme={theme}>
                <DashboardContent theme={theme}>
                    <DashboardSkeleton theme={theme} />
                </DashboardContent>
            </MainDashboardLayout>
        );
    }

    // Check if a section is visible
    const isSectionVisible = (sectionId) => visibleSections.includes(sectionId);
    const getSectionOrder = (sectionId) => {
        const index = sections.findIndex((section) => section.id === sectionId);
        return index === -1 ? sections.length : index;
    };

    return (
        <MainDashboardLayout theme={theme}>
            <DashboardContent theme={theme}>
                <ResponsivePadding>

                    {/* Dashboard Toolbar: compact view toggle + customize */}
                    <DashboardToolbar
                        theme={theme}
                        sections={sections}
                        moveSection={moveSection}
                        toggleSection={toggleSection}
                        resetLayout={resetLayout}
                        viewMode={viewMode}
                        toggleViewMode={toggleViewMode}
                    />

                    {/* Onboarding for new users with no data */}
                    {isNewUser(userData) && (
                        <Suspense fallback={null}>
                            <OnboardingWelcome userData={userData} theme={theme} />
                        </Suspense>
                    )}

                    <OrderedDashboardSections>
                    {/* Balance Overview */}
                    {isSectionVisible('balance-overview') && <DashboardSectionSlot $order={viewMode === 'cards' ? getSectionOrder('balance-overview') : 0}>
                    <ModernDashboardHeader theme={theme}>
                                <ModernDashboardTitle theme={theme}>
                                    {translations.dashboard.title}
                                </ModernDashboardTitle>
                                <ModernBalanceOverview theme={theme}>
                        <div className="balance-main">
                            <h2>{translations.dashboard.totalBalance}</h2>
                            <div className="balance-value">
                                {formatCurrency(totalBalance)}
                            </div>
                            <div className="balance-subtitle">
                                <BiTrendingUp style={{ marginRight: '8px', color: assetColors.income }} />
                                {isHidden ? '****' : `${translations.dashboard.capitalAt} ${new Date().toLocaleDateString('it-IT')}`}
                            </div>
                        </div>
                        
                        <div className="balance-metrics">
                            <ModernMetricCard theme={theme}>
                                <BiWallet className="metric-icon" />
                                <div className="metric-content">
                                    <div className="metric-value">{formatCurrency(totalTraditional)}</div>
                                    <div className="metric-label">{translations.dashboard.liquidity}</div>
                                    <div className="metric-percentage">{formatPercentage(totalTraditional, totalBalance)}</div>
                                </div>
                            </ModernMetricCard>
                            
                            {totalEmergencySecurity > 0 && (
                                <ModernMetricCard theme={theme}>
                                    <GiUmbrella className="metric-icon" />
                                    <div className="metric-content">
                                        <div className="metric-value">{formatCurrency(totalEmergencySecurity)}</div>
                                        <div className="metric-label">{translations.dashboard.emergencySecurity}</div>
                                        <div className="metric-percentage">{formatPercentage(totalEmergencySecurity, totalBalance)}</div>
                                    </div>
                                </ModernMetricCard>
                            )}
                            
                            <ModernMetricCard theme={theme}>
                                <FaRocket className="metric-icon" />
                                <div className="metric-content">
                                    <div className="metric-value">{formatCurrency(totalInvestments)}</div>
                                    <div className="metric-label">{translations.general.investments}</div>
                                    <div className="metric-percentage">{formatPercentage(totalInvestments, totalBalance)}</div>
                                </div>
                            </ModernMetricCard>
                        </div>
                    </ModernBalanceOverview>
                    </ModernDashboardHeader>
                    </DashboardSectionSlot>}

                {!isMobileScreen && <QuickAddTransaction theme={theme} />}

                {/* View Mode: Compact (table) vs Cards (detailed sections) */}
                {viewMode === 'compact' ? (
                    <DashboardSectionSlot $order={1}>
                    <DashboardCompactView
                        theme={theme}
                        isHidden={isHidden}
                        traditionalAssets={traditionalAssets}
                        emergencyFundAsset={emergencyFundAsset}
                        investments={investments}
                        incExpData={incExpData}
                        totalBalance={totalBalance}
                        totalTraditional={totalTraditional}
                        totalInvestments={totalInvestments}
                        totalEmergencySecurity={totalEmergencySecurity}
                        formatCurrency={formatCurrency}
                        formatPercentage={formatPercentage}
                        holdingsByAssetKey={activeHoldingsByAssetKey}
                        liquidityAccountsByAssetKey={liquidityAccountsByAssetKey}
                        categoryPreMonthTotals={categoryPreMonthTotals}
                    />
                    </DashboardSectionSlot>
                ) : (
                <>

                {isSectionVisible('liquidity-investments') && (
                <DashboardSectionSlot $order={getSectionOrder('liquidity-investments')}>
                <div style={{ display: 'flex', flexDirection: isMobileScreen ? 'column' : 'row', gap: isMobileScreen ? '0.75rem' : '1.25rem' }}>
                    {/* Colonna Sinistra - Liquidità + Emergency Fund */}
                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                        {(() => {
                            const activeAssets = traditionalAssets.filter(a => a.value > 0);
                            if (activeAssets.length === 0) return null;
                            return (
                                <PortfolioSection
                                    theme={theme}
                                    icon={MdAccountBalance}
                                    title={translations.dashboard.liquidityAvailability}
                                    totalLabel={formatCurrency(totalTraditional)}
                                    accent={assetColors.totalLiquidity}
                                    collapsed={!!collapsedGroups.liquidity}
                                    onToggleCollapsed={() => toggleGroupCollapsed('liquidity')}
                                    expandLabel={translations.dashboard.expandSection}
                                    collapseLabel={translations.dashboard.collapseSection}
                                >
                                    <PortfolioGrid>
                                        {activeAssets.map((asset) => {
                                            const IconComponent = asset.icon;
                                            const subEntries = (liquidityAccountsByAssetKey[asset.key] || [])
                                                .slice()
                                                .sort((a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0));
                                            return (
                                                <PortfolioAssetCard
                                                    key={asset.key}
                                                    theme={theme}
                                                    icon={IconComponent}
                                                    color={asset.color}
                                                    gradient={asset.gradient}
                                                    name={isHidden ? '****' : asset.name}
                                                    value={formatCurrency(asset.value)}
                                                    pills={[`${formatPercentage(asset.value, totalBalance)} ${translations.dashboard.ofTotal}`]}
                                                    progressPercent={isHidden ? null : (totalBalance > 0 ? (asset.value / totalBalance) * 100 : 0)}
                                                    showDetailsLabel={translations.dashboard.showDetails}
                                                    hideDetailsLabel={translations.dashboard.hideDetails}
                                                    subEntries={!isHidden ? subEntries.slice(0, 4).map((entry) => ({
                                                        id: entry.id,
                                                        label: entry.label,
                                                        value: formatCurrency(entry.currentValue ?? 0)
                                                    })) : []}
                                                    subEntriesMoreLabel={!isHidden && subEntries.length > 4
                                                        ? translations.liquidityAccounts.calculatedFromN.replace('{count}', subEntries.length)
                                                        : undefined}
                                                    actions={(
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="icon-action"
                                                                onClick={() => setOpenSubAccountsAssetKey(asset.key)}
                                                                aria-label={translations.liquidityAccounts.manageLink}
                                                                title={translations.liquidityAccounts.manageLink}
                                                                data-umami-event="dashboard-manage-liquidity"
                                                            >
                                                                <BiListUl />
                                                            </button>
                                                            <LocalizedLink
                                                                to="/insert-values?section=balance"
                                                                className="icon-action"
                                                                aria-label={translations.dashboard.addBalance}
                                                                title={translations.dashboard.addBalance}
                                                                data-umami-event="dashboard-add-balance"
                                                            >
                                                                <AiOutlinePlusCircle />
                                                            </LocalizedLink>
                                                        </>
                                                    )}
                                                />
                                            );
                                        })}
                                    </PortfolioGrid>
                                </PortfolioSection>
                            );
                        })()}

                        {emergencyFundAsset.value > 0 && (
                            <PortfolioSection
                                theme={theme}
                                icon={GiUmbrella}
                                title={translations.dashboard.emergencySecurity}
                                totalLabel={formatCurrency(emergencyFundAsset.value)}
                                accent={emergencyFundAsset.color}
                                collapsed={!!collapsedGroups.emergencyFund}
                                onToggleCollapsed={() => toggleGroupCollapsed('emergencyFund')}
                                expandLabel={translations.dashboard.expandSection}
                                collapseLabel={translations.dashboard.collapseSection}
                            >
                                <PortfolioGrid>
                                    <PortfolioAssetCard
                                        theme={theme}
                                        icon={GiUmbrella}
                                        color={emergencyFundAsset.color}
                                        gradient={emergencyFundAsset.gradient}
                                        name={isHidden ? '****' : emergencyFundAsset.name}
                                        value={formatCurrency(emergencyFundAsset.value)}
                                        pills={[`${formatPercentage(emergencyFundAsset.value, totalBalance)} ${translations.dashboard.ofTotal}`]}
                                        progressPercent={isHidden ? null : (totalBalance > 0 ? (emergencyFundAsset.value / totalBalance) * 100 : 0)}
                                        showDetailsLabel={translations.dashboard.showDetails}
                                        hideDetailsLabel={translations.dashboard.hideDetails}
                                        extraInfo={emergencyFundProgress !== null && !isHidden ? (
                                            <PortfolioExtraInfo theme={theme}>
                                                {translations.general.objective}: {emergencyFundProgress.toFixed(0)}% ({formatCurrency(emergencyFundAsset.value)} / {formatCurrency(emergencyFundTarget)})
                                            </PortfolioExtraInfo>
                                        ) : null}
                                        subEntries={!isHidden ? (liquidityAccountsByAssetKey.emergencyFund || [])
                                            .slice()
                                            .sort((a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0))
                                            .slice(0, 4)
                                            .map((entry) => ({ id: entry.id, label: entry.label, value: formatCurrency(entry.currentValue ?? 0) })) : []}
                                        actions={(
                                            <>
                                                <button
                                                    type="button"
                                                    className="icon-action"
                                                    onClick={() => setOpenSubAccountsAssetKey('emergencyFund')}
                                                    aria-label={translations.liquidityAccounts.manageLink}
                                                    title={translations.liquidityAccounts.manageLink}
                                                    data-umami-event="dashboard-manage-emergency"
                                                >
                                                    <BiListUl />
                                                </button>
                                                <LocalizedLink
                                                    to="/insert-values?section=balance"
                                                    className="icon-action"
                                                    aria-label={translations.dashboard.addBalance}
                                                    title={translations.dashboard.addBalance}
                                                    data-umami-event="dashboard-add-emergency"
                                                >
                                                    <AiOutlinePlusCircle />
                                                </LocalizedLink>
                                            </>
                                        )}
                                    />
                                </PortfolioGrid>
                            </PortfolioSection>
                        )}
                    </div>

                    {/* Colonna Destra - Investimenti */}
                    <div style={{ flex: '1' }}>
                        {investments.length > 0 && (
                            <PortfolioSection
                                theme={theme}
                                icon={FaChartLine}
                                title={translations.dashboard.portfolioInvestments}
                                totalLabel={formatCurrency(totalInvestments)}
                                accent={assetColors.totalInvestments}
                                collapsed={!!collapsedGroups.investments}
                                onToggleCollapsed={() => toggleGroupCollapsed('investments')}
                                expandLabel={translations.dashboard.expandSection}
                                collapseLabel={translations.dashboard.collapseSection}
                            >
                                <PortfolioGrid>
                                    {investments.map((investment) => {
                                        const IconComponent = investment.icon;
                                        const subEntries = (activeHoldingsByAssetKey[investment.key] || [])
                                            .slice()
                                            .sort((a, b) => (b.currentValue ?? b.investedAmount ?? 0) - (a.currentValue ?? a.investedAmount ?? 0));
                                        return (
                                            <PortfolioAssetCard
                                                key={investment.key}
                                                theme={theme}
                                                icon={IconComponent}
                                                color={investment.color}
                                                gradient={investment.gradient}
                                                name={isHidden ? '****' : investment.name}
                                                value={formatCurrency(investment.value)}
                                                badge={investment.comingSoon ? (language === 'it' ? 'Presto' : 'Soon') : undefined}
                                                pills={[
                                                    `${formatPercentage(investment.value, totalInvestments)} ${translations.dashboard.ofPortfolio}`,
                                                    `${formatPercentage(investment.value, totalBalance)} ${translations.dashboard.ofTotal}`
                                                ]}
                                                progressPercent={isHidden ? null : (totalInvestments > 0 ? (investment.value / totalInvestments) * 100 : 0)}
                                                showDetailsLabel={translations.dashboard.showDetails}
                                                hideDetailsLabel={translations.dashboard.hideDetails}
                                                subEntries={!isHidden ? subEntries.slice(0, 4).map((entry) => ({
                                                    id: entry.id,
                                                    label: entry.instrument?.symbol ?? '—',
                                                    value: formatCurrency(entry.currentValue ?? entry.investedAmount ?? 0)
                                                })) : []}
                                                subEntriesMoreLabel={!isHidden && subEntries.length > 4
                                                    ? translations.investments.holdings.calculatedFromN.replace('{count}', subEntries.length)
                                                    : undefined}
                                                actions={(
                                                    <>
                                                        {isVerifiableAssetKey(investment.key) && (
                                                            <button
                                                                type="button"
                                                                className="icon-action"
                                                                onClick={() => setOpenSubAccountsAssetKey(investment.key)}
                                                                aria-label={translations.investments.holdings.manageLink}
                                                                title={translations.investments.holdings.manageLink}
                                                                data-umami-event="dashboard-manage-holdings"
                                                            >
                                                                <BiListUl />
                                                            </button>
                                                        )}
                                                        <LocalizedLink
                                                            to="/insert-values?section=balance"
                                                            className="icon-action"
                                                            aria-label={translations.dashboard.updateValue}
                                                            title={translations.dashboard.updateValue}
                                                            data-umami-event="dashboard-update-investment"
                                                        >
                                                            <HiOutlinePencilAlt />
                                                        </LocalizedLink>
                                                    </>
                                                )}
                                            />
                                        );
                                    })}
                                </PortfolioGrid>
                            </PortfolioSection>
                        )}
                    </div>
                </div>
                </DashboardSectionSlot>
                )}

                {/* Sezione Entrate e Uscite */}
                {isSectionVisible('income-expense') && (
                <DashboardSectionSlot $order={getSectionOrder('income-expense')}>
                <ModernIncomeExpenseSection theme={theme}>
                    <h3 style={{ color: theme.textColor, marginBottom: isMobileScreen ? '0.75rem' : '1rem', fontSize: isMobileScreen ? '1.2rem' : '1.8rem', fontWeight: '600', textAlign: 'center' }}>
                        <FaEuroSign style={{ marginRight: isMobileScreen ? '8px' : '12px', color: assetColors.savings }} />
                        {translations.dashboard.titleGraph3}
                    </h3>

                    {/* Card principali: Entrate, Uscite, Risparmiato */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobileScreen ? 'repeat(3, minmax(0, 1fr))' : 'repeat(3, minmax(220px, 1fr))',
                        gap: isMobileScreen ? '0.75rem' : '1.25rem',
                    }}>
                        {incExpData.map((item, index) => (
                            <ModernIncomeExpenseCard key={index} theme={theme} itemColor={item.color}>
                                <FloatingElement delay={index * 0.1}>
                                    <div className="expense-icon">
                                        {item.name === translations.general.incomes && <BsArrowUpRight />}
                                        {item.name === translations.general.outflows && <BsArrowDownLeft />}
                                        {item.name === translations.general.saved && <BsWallet2 />}
                                    </div>
                                    <div className="expense-content">
                                        <h4 className="expense-name">{isHidden ? '****' : item.name}</h4>
                                        <div className="expense-value">{formatCurrency(item.value)}</div>
                                        <div className="expense-description">
                                            {item.name === translations.general.incomes && translations.dashboard.thisMonth}
                                            {item.name === translations.general.outflows && translations.dashboard.thisMonth}
                                            {item.name === translations.general.saved && translations.dashboard.saved}
                                        </div>
                                        {item.name === translations.general.incomes && (
                                            <LocalizedLink to="/insert-values?section=income" className="income-outflow-button" data-umami-event="dashboard-add-income">
                                                <AiOutlinePlusCircle style={{ marginRight: '6px' }} />
                                                {translations.dashboard.addIncome || 'Add Income'}
                                            </LocalizedLink>
                                        )}
                                        {item.name === translations.general.outflows && (
                                            <LocalizedLink to="/insert-values?section=outflow" className="income-outflow-button" data-umami-event="dashboard-add-outflow">
                                                <AiOutlinePlusCircle style={{ marginRight: '6px' }} />
                                                {translations.dashboard.addOutflow || 'Add Outflow'}
                                            </LocalizedLink>
                                        )}
                                    </div>
                                </FloatingElement>
                            </ModernIncomeExpenseCard>
                        ))}
                    </div>

                    {/* Obiettivi e Limiti - Card più piccole sotto */}
                    {(userData?.limits?.notificationsEnabled && !isHidden && 
                      (userData?.limits?.monthlySpendingLimit || userData?.limits?.savingsGoalPercentage)) && (
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobileScreen ? 'column' : 'row',
                            gap: '0.75rem',
                            justifyContent: 'center',
                            maxWidth: '500px',
                            margin: '1rem auto 0 auto'
                        }}>
                            {/* Card Limite Spesa - più piccola */}
                            {userData.limits.monthlySpendingLimit && (
                                (() => {
                                    const currentExpenses = expensesMonth;
                                    const progress = (currentExpenses / userData.limits.monthlySpendingLimit) * 100;
                                    const isOverLimit = progress > 100;
                                    const isNearLimit = progress > 80;
                                    const limitColor = isOverLimit ? '#e74c3c' : isNearLimit ? '#f39c12' : '#27ae60';
                                    
                                    return (
                                        <div key="spending-limit" style={{
                                            background: theme.mode === 'dark' 
                                                ? `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)`
                                                : `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)`,
                                            border: `2px solid ${limitColor}`,
                                            borderRadius: '10px',
                                            padding: '0.75rem',
                                            flex: '1',
                                            textAlign: 'center',
                                            minHeight: '90px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}>
                                            <FloatingElement delay={0.4}>
                                                <FaExclamationTriangle style={{ 
                                                    color: limitColor, 
                                                    fontSize: '1.2rem', 
                                                    marginBottom: '0.3rem' 
                                                }} />
                                                <div style={{ 
                                                    color: theme.mode === 'dark' ? '#ffffff' : '#1a1a1a',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.2rem'
                                                }}>
                                                    {language === 'it' ? 'Limite Spesa' : 'Spending Limit'}
                                                </div>
                                                <div style={{ 
                                                    color: limitColor,
                                                    fontSize: '1.3rem',
                                                    fontWeight: '700',
                                                    marginBottom: '0.2rem'
                                                }}>
                                                    {progress.toFixed(0)}%
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.65rem',
                                                    color: theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                                    marginBottom: '0.15rem'
                                                }}>
                                                    {formatCurrency(currentExpenses)} / {formatCurrency(userData.limits.monthlySpendingLimit)}
                                                </div>
                                                <div style={{ 
                                                    color: limitColor,
                                                    fontWeight: '600',
                                                    fontSize: '0.6rem',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {isOverLimit 
                                                        ? (language === 'it' ? 'SUPERATO' : 'EXCEEDED')
                                                        : isNearLimit 
                                                            ? (language === 'it' ? 'ATTENZIONE' : 'WARNING')
                                                            : (language === 'it' ? 'OK' : 'ON TRACK')
                                                    }
                                                </div>
                                            </FloatingElement>
                                        </div>
                                    );
                                })()
                            )}

                            {/* Card Obiettivo Risparmio - più piccola */}
                            {userData.limits.savingsGoalPercentage && (
                                (() => {
                                    const savingsTarget = (incomesMonth * userData.limits.savingsGoalPercentage) / 100;
                                    const progress = savingsTarget > 0 ? (savedMonth / savingsTarget) * 100 : 0;
                                    const isGoodProgress = progress >= 100;
                                    const isOkProgress = progress >= 50;
                                    const savingsColor = isGoodProgress ? '#27ae60' : isOkProgress ? '#f39c12' : '#e74c3c';
                                    
                                    return (
                                        <div key="savings-goal" style={{
                                            background: theme.mode === 'dark' 
                                                ? `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)`
                                                : `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)`,
                                            border: `2px solid ${savingsColor}`,
                                            borderRadius: '10px',
                                            padding: '0.75rem',
                                            flex: '1',
                                            textAlign: 'center',
                                            minHeight: '90px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}>
                                            <FloatingElement delay={0.5}>
                                                <FaBullseye style={{ 
                                                    color: savingsColor, 
                                                    fontSize: '1.2rem', 
                                                    marginBottom: '0.3rem' 
                                                }} />
                                                <div style={{ 
                                                    color: theme.mode === 'dark' ? '#ffffff' : '#1a1a1a',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.2rem'
                                                }}>
                                                    {language === 'it' ? 'Obiettivo Risparmio' : 'Savings Goal'}
                                                </div>
                                                <div style={{ 
                                                    color: savingsColor,
                                                    fontSize: '1.3rem',
                                                    fontWeight: '700',
                                                    marginBottom: '0.2rem'
                                                }}>
                                                    {progress.toFixed(0)}%
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.65rem',
                                                    color: theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                                    marginBottom: '0.15rem'
                                                }}>
                                                    {formatCurrency(savedMonth)} / {formatCurrency(savingsTarget)}
                                                </div>
                                                <div style={{ 
                                                    color: savingsColor,
                                                    fontWeight: '600',
                                                    fontSize: '0.6rem',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {isGoodProgress 
                                                        ? (language === 'it' ? 'RAGGIUNTO' : 'ACHIEVED')
                                                        : isOkProgress 
                                                            ? (language === 'it' ? 'IN CORSO' : 'IN PROGRESS')
                                                            : (language === 'it' ? 'DA MIGLIORARE' : 'NEEDS WORK')
                                                    }
                                                </div>
                                            </FloatingElement>
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    )}
                </ModernIncomeExpenseSection>
                </DashboardSectionSlot>
                )}

                {/* Sezione Grafici */}
                {isSectionVisible('charts') && (
                <DashboardSectionSlot $order={getSectionOrder('charts')}>
                <ModernChartsSection theme={theme}>
                    <h3 style={{ color: theme.textColor, marginBottom: isMobileScreen ? '0.6rem' : '1rem', fontSize: isMobileScreen ? '1.2rem' : '1.8rem', fontWeight: '600', textAlign: 'center' }}>
                        <BsGraphUpArrow style={{ marginRight: isMobileScreen ? '8px' : '12px', color: assetColors.savings }} />
                        {translations.dashboard.patrimonialAnalysis}
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: isMobileScreen ? '0.75rem' : '1.25rem',
                        width: '100%'
                    }}>
                        {/* Grafico Distribuzione Patrimonio Completa */}
                        <ModernChartContainer theme={theme} style={{ minWidth: isMobileScreen ? 'auto' : '450px' }}>
                            <h4>{translations.dashboard.titleGraph2}</h4>
                            <ResponsiveContainer width="100%" height={isMobileScreen ? 200 : 300}>
                                <PieChart>
                                    <Pie
                                        data={isHidden ? detailedPieDataShuffle : detailedPieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={RenderCustomizedLabel}
                                        outerRadius={isMobileScreen ? 80 : 120}
                                        fill={assetColors.totalBalance}
                                        dataKey="value"
                                    >
                                        {(isHidden ? detailedPieDataShuffle : detailedPieData).map((entry, index) => {
                                            if (isHidden) {
                                                const greyScale = Math.floor(Math.random() * 256);
                                                const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
                                                return <Cell key={`cell-${index}`} fill={greyColor} />;
                                            }
                                            return <Cell key={`cell-${index}`} fill={entry.color} />;
                                        })}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="chart-legend detailed" style={{ maxHeight: '150px' }}>
                                {(isHidden ? detailedPieDataShuffle : detailedPieData).map((entry, index) => {
                                    const legendColor = isHidden ? `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})` : entry.color;
                                    return (
                                        <div key={index} className="legend-item">
                                            <div 
                                                className="legend-color" 
                                                style={{ backgroundColor: legendColor }}
                                            />
                                            <span>{isHidden ? '****' : entry.name}</span>
                                            <span className="legend-value">{formatCurrency(entry.value)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </ModernChartContainer>

                        {/* Grafico Solo Investimenti */}
                        <ModernChartContainer theme={theme} style={{ minWidth: isMobileScreen ? 'auto' : '450px' }}>
                            <h4>Portfolio {translations.general.investments}</h4>
                            <ResponsiveContainer width="100%" height={isMobileScreen ? 200 : 300}>
                                <PieChart>
                                    <Pie
                                        data={isHidden ? investmentsShuffle?.filter(inv => inv?.value > 0) || [] : investments?.filter(inv => inv?.value > 0) || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={RenderCustomizedLabel}
                                        outerRadius={isMobileScreen ? 80 : 120}
                                        fill={assetColors.totalBalance}
                                        dataKey="value"
                                    >
                                        {(isHidden ? investmentsShuffle?.filter(inv => inv?.value > 0) || [] : investments?.filter(inv => inv?.value > 0) || []).map((entry, index) => {
                                            if (isHidden) {
                                                const greyScale = Math.floor(Math.random() * 256);
                                                const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
                                                return <Cell key={`inv-${index}`} fill={greyColor} />;
                                            }
                                            return <Cell key={`inv-${index}`} fill={entry.color} />;
                                        })}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="chart-legend">
                                {(isHidden ? investmentsShuffle?.filter(inv => inv?.value > 0) || [] : investments?.filter(inv => inv?.value > 0) || []).map((entry, index) => {
                                    const legendColor = isHidden ? `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})` : entry.color;
                                    return (
                                        <div key={index} className="legend-item">
                                            <div 
                                                className="legend-color" 
                                                style={{ backgroundColor: legendColor }}
                                            />
                                            <span>{isHidden ? '****' : entry.name}</span>
                                            <span className="legend-value">{formatCurrency(entry.value)} ({formatPercentage(entry.value, totalInvestments)})</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </ModernChartContainer>

                        {/* Grafico Distribuzione Patrimonio */}
                        <ModernChartContainer theme={theme} style={{ minWidth: isMobileScreen ? 'auto' : '450px' }}>
                            <h4>{translations.dashboard.titleGraph}</h4>
                            <ResponsiveContainer width="100%" height={isMobileScreen ? 200 : 300}>
                                <PieChart>
                                    <Pie
                                        data={isHidden ? pieDataShuffle : pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={RenderCustomizedLabel}
                                        outerRadius={isMobileScreen ? 80 : 120}
                                        innerRadius={isMobileScreen ? 40 : 60}
                                        fill={assetColors.totalBalance}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={450}
                                    >
                                        {(isHidden ? pieDataShuffle : pieData).map((entry, index) => {
                                            if (isHidden) {
                                                const greyScale = Math.floor(Math.random() * 256);
                                                const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
                                                return <Cell key={`liq-${index}`} fill={greyColor} />;
                                            }
                                            return <Cell key={`liq-${index}`} fill={entry.color} />;
                                        })}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <div className="legend-color" style={{ backgroundColor: assetColors.totalLiquidity }} />
                                    <span>{isHidden ? '****' : translations.dashboard.liquidity}</span>
                                    <span className="legend-value">{formatCurrency(totalTraditional)} ({formatPercentage(totalTraditional, totalBalance)})</span>
                                </div>
                                {totalEmergencySecurity > 0 && (
                                    <div className="legend-item">
                                        <div className="legend-color" style={{ backgroundColor: emergencyFundAsset.color }} />
                                        <span>{isHidden ? '****' : translations.dashboard.emergencySecurity}</span>
                                        <span className="legend-value">{formatCurrency(totalEmergencySecurity)} ({formatPercentage(totalEmergencySecurity, totalBalance)})</span>
                                    </div>
                                )}
                                <div className="legend-item">
                                    <div className="legend-color" style={{ backgroundColor: assetColors.totalInvestments }} />
                                    <span>{isHidden ? '****' : translations.general.investments}</span>
                                    <span className="legend-value">{formatCurrency(totalInvestments)} ({formatPercentage(totalInvestments, totalBalance)})</span>
                                </div>
                            </div>
                        </ModernChartContainer>
                    </div>
                </ModernChartsSection>
                </DashboardSectionSlot>
                )}

                {/* Financial Insights Section (lazy loaded) */}
                {isSectionVisible('financial-insights') && (
                <DashboardSectionSlot $order={getSectionOrder('financial-insights')}>
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: theme.textColor, opacity: 0.5 }}>{translations.general.loading || 'Loading...'}</div>}>
                    <FinancialInsights theme={theme} userData={userData} isHidden={isHidden} />
                </Suspense>
                </DashboardSectionSlot>
                )}

                {/* Goal Tracking Section */}
                {isSectionVisible('goal-tracker') && (
                <DashboardSectionSlot $order={getSectionOrder('goal-tracker')}>
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: theme.textColor, opacity: 0.5 }}>{translations.general.loading || 'Loading...'}</div>}>
                    <GoalTracker theme={theme} userData={userData} isHidden={isHidden} />
                </Suspense>
                </DashboardSectionSlot>
                )}

                </>
                )}
                </OrderedDashboardSections>

                </ResponsivePadding>
            </DashboardContent>

            {openSubAccountsAssetKey && LIQUIDITY_KEYS.includes(openSubAccountsAssetKey) && (
                <LiquidityAccountsPanel
                    assetKey={openSubAccountsAssetKey}
                    accounts={liquidityAccountsByAssetKey[openSubAccountsAssetKey] || []}
                    onClose={() => setOpenSubAccountsAssetKey(null)}
                    onChanged={refreshLiquidityAccounts}
                />
            )}

            {openSubAccountsAssetKey && isVerifiableAssetKey(openSubAccountsAssetKey) && (
                <InvestmentHoldingsPanel
                    assetKey={openSubAccountsAssetKey}
                    holdings={holdingsByAssetKey[openSubAccountsAssetKey] || []}
                    onClose={() => setOpenSubAccountsAssetKey(null)}
                    onChanged={refreshInvestmentHoldings}
                />
            )}
        </MainDashboardLayout>
    );
};

export default Dashboard;
