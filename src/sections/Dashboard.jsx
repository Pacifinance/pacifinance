import React, { useEffect, useState, useContext, useMemo, lazy, Suspense } from 'react';
import { LocalizedLink } from '../components/LocalizedLink';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
    BsGraphUpArrow,
    BsWallet2,
    BsArrowUpRight,
    BsArrowDownLeft
} from "react-icons/bs";
import { 
    FaChartLine, 
    FaCoins,
    FaRocket,
    FaEuroSign
} from "react-icons/fa";
import { 
    AiOutlinePlusCircle,
    AiOutlineEuro
} from "react-icons/ai";
import { 
    MdAccountBalance,
    MdTrendingUp,
    MdDashboard
} from "react-icons/md";
import { assetIcons } from '../data/assetIcons';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { BiTrendingUp, BiWallet } from 'react-icons/bi';
import { primaryColor, secondaryColor, getColorsBalances, getColorsIncExp } from '../styles/Themes';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { renderCustomizedLabel } from '../utils/customGraphsInfo';
import { assetColors, getAssetColor } from '../data/assetColors.js';
import {
    getCashValue, getBankValue, getDigitalServicesValue, getEmergencyFund,
    getStocksValue, getEtfValue, getBitcoinValue, getCryptoValue, getBondsValue,
    getFundsValue, getGoldValue, getTotalValue, getOutflowsArray, getIncomesArray
} from '../utils/userDataSelectors';
import { 
    ModernDashboardContainer,
    ModernDashboardHeader,
    ModernBalanceOverview,
    ModernAssetsGrid,
    ModernInvestmentsGrid,
    ModernAssetCard,
    ModernInvestmentCard,
    ModernChartsSection,
    ModernChartContainer,
    GradientBackground,
    FloatingElement,
    ModernMetricCard,
    ModernDashboardTitle,
    ModernIncomeExpenseSection,
    ModernIncomeExpenseCard,
    MainDashboardLayout,
    DashboardContent,
    InvestmentCardWrapper,
    InvestmentRowWrapper,
    AssetCardWrapper,
    AssetRowWrapper
} from '../styles/ModernDashboardStyled';
const FinancialInsights = lazy(() => import('../components/FinancialInsights'));
const GoalTracker = lazy(() => import('../components/GoalTracker'));
import DashboardSkeleton from '../components/DashboardSkeleton';
import DashboardToolbar from '../components/DashboardToolbar';
import DashboardCompactView from '../components/DashboardCompactView';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { FaExclamationTriangle, FaBullseye } from 'react-icons/fa';
import { BsPercent } from 'react-icons/bs';
import { GiUmbrella } from 'react-icons/gi';

const ResponsivePadding = styled.div`
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const Dashboard = ({ theme, userData, isHidden, CustomTick }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { language, translations } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const { sections, visibleSections, moveSection, toggleSection, resetLayout, viewMode, toggleViewMode } = useDashboardLayout();
    const colorsBalances = getColorsBalances(translations);
    const colorsIncExp = getColorsIncExp(translations);
    
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
    const [goldValue, setGoldValue] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [incomesMonth, setIncomesMonth] = useState(0);
    const [expensesMonth, setExpensesMonth] = useState(0);
    const [savedMonth, setSavedMonth] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (userData) {
                try {
                    // Verify the total calculation is working
                    const calculatedTotal = getTotalValue(userData);
                    console.log('Dashboard total value calculated:', calculatedTotal);
                    
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
                    setGoldValue(getGoldValue(userData));
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
    const traditionalAssets = [
        { 
            name: translations.assets.bank, 
            value: bankValue >= 0 ? bankValue : 0,
            icon: assetIcons.bank,
            color: assetColors.bank.primary,
            gradient: assetColors.bank.gradient
        },
        { 
            name: translations.assets.cash, 
            value: cashValue >= 0 ? cashValue : 0,
            icon: assetIcons.cash,
            color: assetColors.cash.primary,
            gradient: assetColors.cash.gradient
        },
        { 
            name: translations.assets.digitalServices, 
            value: digitalServicesValue >= 0 ? digitalServicesValue : 0,
            icon: assetIcons.digitalServices,
            color: assetColors.digitalServices.primary,
            gradient: assetColors.digitalServices.gradient
        },
    ];

    // Fondo di Emergenza - Sezione separata
    const emergencyFundAsset = {
        name: translations.assets.emergencyFund, 
        value: emergencyFund >= 0 ? emergencyFund : 0,
        icon: assetIcons.emergencyFund,
        color: assetColors.emergencyFund.primary,
        gradient: assetColors.emergencyFund.gradient
    };

    // Dati per gli investimenti (Azioni, ETF, Bitcoin, Crypto, Bonds, Funds, Gold)
    const allInvestments = [
        { 
            name: translations.assets.stocks, 
            value: stocksValue >= 0 ? stocksValue : 0,
            icon: assetIcons.stocks,
            color: assetColors.stocks.primary,
            gradient: assetColors.stocks.gradient,
            description: translations.dashboard.stockDescription
        },
        { 
            name: translations.assets.etf, 
            value: etfValue >= 0 ? etfValue : 0,
            icon: assetIcons.etf,
            color: assetColors.etf.primary,
            gradient: assetColors.etf.gradient,
            description: translations.dashboard.etfDescription
        },
        { 
            name: translations.assets.bitcoin, 
            value: bitcoinValue >= 0 ? bitcoinValue : 0,
            icon: assetIcons.bitcoin,
            color: assetColors.bitcoin.primary,
            gradient: assetColors.bitcoin.gradient,
            description: translations.dashboard.bitcoinDescription
        },
        { 
            name: translations.assets.crypto, 
            value: cryptoValue >= 0 ? cryptoValue : 0,
            icon: assetIcons.crypto,
            color: assetColors.crypto.primary,
            gradient: assetColors.crypto.gradient,
            description: translations.dashboard.cryptoDescription
        },
        { 
            name: translations.assets.bonds, 
            value: bondsValue >= 0 ? bondsValue : 0,
            icon: assetIcons.bonds,
            color: assetColors.bonds.primary,
            gradient: assetColors.bonds.gradient,
            description: translations.dashboard.bondsDescription,
        },
        { 
            name: translations.assets.funds, 
            value: fundsValue >= 0 ? fundsValue : 0,
            icon: assetIcons.funds,
            color: assetColors.funds.primary,
            gradient: assetColors.funds.gradient,
            description: translations.dashboard.fundsDescription,
        },
        { 
            name: translations.assets.gold, 
            value: goldValue >= 0 ? goldValue : 0,
            icon: assetIcons.gold,
            color: assetColors.gold.primary,
            gradient: assetColors.gold.gradient,
            description: translations.dashboard.goldDescription,
        },
    ];

    // Filtra gli investimenti per mostrare solo quelli con valore > 0
    const investments = allInvestments.filter(investment => investment.value > 0);

    const totalTraditional = traditionalAssets.reduce((acc, asset) => acc + asset.value, 0);
    const totalInvestments = allInvestments.reduce((acc, investment) => acc + investment.value, 0);
    const totalEmergencySecurity = emergencyFundAsset.value; // For now only emergency fund, but prepared for future additions
    const totalBalance = totalValue;

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
    const incExpDataShuffle = [...incExpData].sort(() => Math.random() - 0.5);
    const traditionalAssetsShuffle = [...traditionalAssets].sort(() => Math.random() - 0.5);
    const investmentsShuffle = [...investments].sort(() => Math.random() - 0.5);

    const formatCurrency = (value) => {
        if (isHidden) return '****';
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatPercentage = (value, total) => {
        if (isHidden || total === 0) return '***';
        return ((value / total) * 100).toFixed(1) + '%';
    };

    const CustomTooltip = ({ active, payload, label }) => {
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
    
    // Get section CSS order
    const getSectionOrder = (sectionId) => visibleSections.indexOf(sectionId);

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

                    {/* Balance Overview */}
                    {isSectionVisible('balance-overview') && <ModernDashboardHeader theme={theme}>
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
                </ModernDashboardHeader>}

                {/* View Mode: Compact (table) vs Cards (detailed sections) */}
                {viewMode === 'compact' ? (
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
                    />
                ) : (
                <>

                {isSectionVisible('liquidity-investments') && (
                <div style={{ display: 'flex', flexDirection: isMobileScreen ? 'column' : 'row', gap: isMobileScreen ? '1rem' : '2rem' }}>
                    {/* Colonna Sinistra - Liquidità + Emergency Fund */}
                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: isMobileScreen ? '1rem' : '2rem' }}>
                        {/* Sezione Bilanci Tradizionali - Layout intelligente */}
                        <div>
                            <h3 style={{ color: theme.textColor, marginBottom: isMobileScreen ? '0.75rem' : '1.5rem', fontSize: isMobileScreen ? '1.1rem' : '1.5rem', fontWeight: '600' }}>
                                <MdAccountBalance style={{ marginRight: '8px', color: assetColors.totalLiquidity }} />
                                {translations.dashboard.liquidityAvailability}
                            </h3>
                            {(() => {
                                // Filtra gli asset con valore > 0 per il layout
                                const activeAssets = traditionalAssets.filter(a => a.value > 0);
                                const count = activeAssets.length;
                                
                                // Funzione helper per renderizzare una card asset
                                const renderAssetCard = (asset, index) => {
                                    const IconComponent = asset.icon;
                                    return (
                                        <AssetCardWrapper 
                                            key={index} 
                                            $itemCount={count}
                                            $index={index}
                                        >
                                            <ModernAssetCard theme={theme} gradient={asset.gradient}>
                                                <FloatingElement delay={index * 0.2}>
                                                    <div className="card-header">
                                                        <div className="icon-container">
                                                            <IconComponent className="asset-icon" />
                                                        </div>
                                                        <LocalizedLink to="/insert-values?section=balance" className="action-button" data-umami-event="dashboard-add-balance">
                                                            <AiOutlinePlusCircle />
                                                        </LocalizedLink>
                                                    </div>
                                                    
                                                    <div className="card-content">
                                                        <h4 className="asset-name">{isHidden ? '****' : asset.name}</h4>
                                                        <div className="asset-value">{formatCurrency(asset.value)}</div>
                                                        <div className="asset-percentage">
                                                            {formatPercentage(asset.value, totalBalance)} {translations.dashboard.ofTotal}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="card-footer">
                                                        <div className="progress-bar">
                                                            <div 
                                                                className="progress-fill" 
                                                                style={{ 
                                                                    width: `${formatPercentage(asset.value, totalBalance)}%`,
                                                                    backgroundColor: asset.color
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </FloatingElement>
                                            </ModernAssetCard>
                                        </AssetCardWrapper>
                                    );
                                };

                                // Layout standard - solo asset con valore > 0
                                return (
                                    <ModernAssetsGrid theme={theme} $itemCount={activeAssets.length}>
                                        {activeAssets.map((asset, index) => renderAssetCard(asset, index))}
                                    </ModernAssetsGrid>
                                );
                            })()}
                        </div>

                        {/* Sezione Fondo di Emergenza - Layout intelligente */}
                        {emergencyFundAsset.value > 0 && (
                            <div>
                                <h3 style={{ color: theme.textColor, marginBottom: isMobileScreen ? '0.75rem' : '1.5rem', fontSize: isMobileScreen ? '1.1rem' : '1.5rem', fontWeight: '600' }}>
                                    <GiUmbrella style={{ marginRight: '8px', color: emergencyFundAsset.color }} />
                                    {translations.dashboard.emergencySecurity}
                                </h3>
                                <ModernAssetsGrid theme={theme} $itemCount={1}>
                                    <AssetCardWrapper $itemCount={1} $index={0}>
                                        <ModernAssetCard theme={theme} gradient={emergencyFundAsset.gradient}>
                                            <FloatingElement delay={0.3}>
                                                <div className="card-header">
                                                    <div className="icon-container">
                                                        <GiUmbrella className="asset-icon" />
                                                    </div>
                                                    <LocalizedLink to="/insert-values?section=balance" className="action-button" data-umami-event="dashboard-add-emergency">
                                                        <AiOutlinePlusCircle />
                                                    </LocalizedLink>
                                                </div>
                                                
                                                <div className="card-content">
                                                    <h4 className="asset-name">{isHidden ? '****' : emergencyFundAsset.name}</h4>
                                                    <div className="asset-value">{formatCurrency(emergencyFundAsset.value)}</div>
                                                    <div className="asset-percentage">
                                                        {formatPercentage(emergencyFundAsset.value, totalBalance)} {translations.dashboard.ofTotal}
                                                    </div>
                                                    {emergencyFundProgress !== null && !isHidden && (
                                                        <div style={{
                                                            fontSize: isMobileScreen ? '0.55rem' : '0.8rem',
                                                            color: theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                                            marginTop: '0.15rem',
                                                            lineHeight: '1.2'
                                                        }}>
                                                            {translations.general.objective}: {emergencyFundProgress.toFixed(0)}% ({formatCurrency(emergencyFundAsset.value)} / {formatCurrency(emergencyFundTarget)})
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="card-footer">
                                                    <div className="progress-bar">
                                                        <div 
                                                            className="progress-fill" 
                                                            style={{ 
                                                                width: `${formatPercentage(emergencyFundAsset.value, totalBalance)}%`,
                                                                backgroundColor: emergencyFundAsset.color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </FloatingElement>
                                        </ModernAssetCard>
                                    </AssetCardWrapper>
                                </ModernAssetsGrid>
                            </div>
                        )}
                    </div>

                    {/* Colonna Destra - Investimenti */}
                    <div style={{ flex: '1' }}>
                        <h3 style={{ color: theme.textColor, marginBottom: isMobileScreen ? '0.75rem' : '1.5rem', fontSize: isMobileScreen ? '1.1rem' : '1.5rem', fontWeight: '600' }}>
                            <FaChartLine style={{ marginRight: '8px', color: assetColors.totalInvestments }} />
                            {translations.dashboard.portfolioInvestments}
                        </h3>
                        {/* Layout intelligente per gli investimenti */}
                        {(() => {
                            const count = investments.length;
                            
                            // Funzione helper per renderizzare una card
                            const renderInvestmentCard = (investment, index) => {
                                const IconComponent = investment.icon;
                                return (
                                    <InvestmentCardWrapper 
                                        key={index} 
                                        $itemCount={count} 
                                        $index={index}
                                    >
                                        <ModernInvestmentCard theme={theme} gradient={investment.gradient}>
                                            <FloatingElement delay={index * 0.15}>
                                                <div className="card-header">
                                                    <div className="icon-container">
                                                        <IconComponent className="investment-icon" />
                                                        {investment.comingSoon && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '-8px',
                                                                right: '-8px',
                                                                backgroundColor: '#22c55e',
                                                                color: 'white',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '600',
                                                                padding: '2px 6px',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                            }}>
                                                                {language === 'it' ? 'Presto' : 'Soon'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="investment-type">
                                                        <span>{isHidden ? '****' : investment.description}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="card-content">
                                                    <h4 className="investment-name">{isHidden ? '****' : investment.name}</h4>
                                                    <div className="investment-value">{formatCurrency(investment.value)}</div>
                                                    <div className="investment-stats">
                                                        <div className="stat">
                                                            <span className="stat-label">{translations.dashboard.ofPortfolio}</span>
                                                            <span className="stat-value">{formatPercentage(investment.value, totalInvestments)}</span>
                                                        </div>
                                                        <div className="stat">
                                                            <span className="stat-label">{translations.dashboard.ofTotal}</span>
                                                            <span className="stat-value">{formatPercentage(investment.value, totalBalance)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="card-footer">
                                                    <LocalizedLink to="/insert-values?section=balance" className="update-button" data-umami-event="dashboard-update-investment">
                                                        <HiOutlinePencilAlt style={{ marginRight: '6px' }} />
                                                        {translations.dashboard.updateValue}
                                                    </LocalizedLink>
                                                </div>
                                            </FloatingElement>
                                        </ModernInvestmentCard>
                                    </InvestmentCardWrapper>
                                );
                            };

                            // Layout per 3 card: 2 sopra + 1 centrata sotto
                            if (count === 3) {
                                return (
                                    <ModernInvestmentsGrid theme={theme} $itemCount={count}>
                                        <InvestmentRowWrapper>
                                            {investments.slice(0, 2).map((inv, idx) => renderInvestmentCard(inv, idx))}
                                        </InvestmentRowWrapper>
                                        <InvestmentRowWrapper $centered>
                                            {renderInvestmentCard(investments[2], 2)}
                                        </InvestmentRowWrapper>
                                    </ModernInvestmentsGrid>
                                );
                            }
                            
                            // Layout per 5 card: 3 sopra + 2 centrate sotto
                            if (count === 5) {
                                return (
                                    <ModernInvestmentsGrid theme={theme} $itemCount={count}>
                                        <InvestmentRowWrapper>
                                            {investments.slice(0, 3).map((inv, idx) => renderInvestmentCard(inv, idx))}
                                        </InvestmentRowWrapper>
                                        <InvestmentRowWrapper $centered>
                                            {investments.slice(3, 5).map((inv, idx) => renderInvestmentCard(inv, idx + 3))}
                                        </InvestmentRowWrapper>
                                    </ModernInvestmentsGrid>
                                );
                            }
                            
                            // Layout per 7 card: 4 sopra + 3 centrate sotto
                            if (count === 7) {
                                return (
                                    <ModernInvestmentsGrid theme={theme} $itemCount={count}>
                                        <InvestmentRowWrapper>
                                            {investments.slice(0, 4).map((inv, idx) => renderInvestmentCard(inv, idx))}
                                        </InvestmentRowWrapper>
                                        <InvestmentRowWrapper $centered>
                                            {investments.slice(4, 7).map((inv, idx) => renderInvestmentCard(inv, idx + 4))}
                                        </InvestmentRowWrapper>
                                    </ModernInvestmentsGrid>
                                );
                            }

                            // Layout standard per altri numeri (1, 2, 4, 6, 8+)
                            return (
                                <ModernInvestmentsGrid theme={theme} $itemCount={count}>
                                    {investments.map((investment, index) => renderInvestmentCard(investment, index))}
                                </ModernInvestmentsGrid>
                            );
                        })()}
                    </div>
                </div>
                )}

                {/* Sezione Entrate e Uscite */}
                {isSectionVisible('income-expense') && (
                <ModernIncomeExpenseSection theme={theme}>
                    <h3 style={{ color: theme.textColor, marginBottom: isMobileScreen ? '1rem' : '2rem', fontSize: isMobileScreen ? '1.2rem' : '1.8rem', fontWeight: '600', textAlign: 'center' }}>
                        <FaEuroSign style={{ marginRight: isMobileScreen ? '8px' : '12px', color: assetColors.savings }} />
                        {translations.dashboard.titleGraph3}
                    </h3>
                    
                    {/* Card principali: Entrate, Uscite, Risparmiato */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: isMobileScreen ? 'column' : 'row', 
                        gap: '2rem',
                        justifyContent: 'space-around'
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
                            marginTop: '1.5rem',
                            maxWidth: '500px',
                            margin: '1.5rem auto 0 auto'
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
                )}

                {/* Sezione Grafici */}
                {isSectionVisible('charts') && (
                <ModernChartsSection theme={theme}>
                    <h3 style={{ color: theme.textColor, marginBottom: isMobileScreen ? '1rem' : '2rem', fontSize: isMobileScreen ? '1.2rem' : '1.8rem', fontWeight: '600', textAlign: 'center' }}>
                        <BsGraphUpArrow style={{ marginRight: isMobileScreen ? '8px' : '12px', color: assetColors.savings }} />
                        {translations.dashboard.patrimonialAnalysis}
                    </h3>
                    
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: isMobileScreen ? '1rem' : '2rem',
                        width: '100%'
                    }}>
                        {/* Grafico Distribuzione Patrimonio Completa */}
                        <ModernChartContainer theme={theme} style={{ minWidth: isMobileScreen ? 'auto' : '450px' }}>
                            <h4>{translations.dashboard.titleGraph2}</h4>
                            <ResponsiveContainer width="100%" height={isMobileScreen ? 220 : 350}>
                                <PieChart>
                                    <Pie
                                        data={isHidden ? detailedPieDataShuffle : detailedPieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
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
                            <ResponsiveContainer width="100%" height={isMobileScreen ? 220 : 350}>
                                <PieChart>
                                    <Pie
                                        data={isHidden ? investmentsShuffle?.filter(inv => inv?.value > 0) || [] : investments?.filter(inv => inv?.value > 0) || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
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
                            <ResponsiveContainer width="100%" height={isMobileScreen ? 220 : 350}>
                                <PieChart>
                                    <Pie
                                        data={isHidden ? pieDataShuffle : pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
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
                )}

                {/* Financial Insights Section (lazy loaded) */}
                {isSectionVisible('financial-insights') && (
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: theme.textColor, opacity: 0.5 }}>{translations.general.loading || 'Loading...'}</div>}>
                    <FinancialInsights theme={theme} userData={userData} isHidden={isHidden} />
                </Suspense>
                )}

                {/* Goal Tracking Section (lazy loaded) */}
                {isSectionVisible('goal-tracker') && (
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: theme.textColor, opacity: 0.5 }}>{translations.general.loading || 'Loading...'}</div>}>
                    <GoalTracker theme={theme} userData={userData} isHidden={isHidden} />
                </Suspense>
                )}

                </>
                )}

                </ResponsivePadding>
            </DashboardContent>
        </MainDashboardLayout>
    );
};

export default Dashboard;