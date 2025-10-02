import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
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
import languages from '../data/languages.json';
import { assetColors, getAssetColor } from '../data/assetColors.js';
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
    DashboardContent
} from '../styles/ModernDashboardStyled';

const Dashboard = ({ theme, userData, isHidden, CustomTick }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { language } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const colorsBalances = getColorsBalances(language);
    const colorsIncExp = getColorsIncExp(language);
    
    // Stati per i bilanci
    const [stocksReal, setStocksReal] = useState(0);
    const [etfReal, setETFReal] = useState(0);
    const [bankReal, setBankReal] = useState(0);
    const [cashReal, setCashReal] = useState(0);
    const [cryptoReal, setCryptoReal] = useState(0);
    const [bitcoinReal, setBitcoinReal] = useState(0);
    const [digitalServicesReal, setDigitalServicesReal] = useState(0);
    const [totalReal, setTotalReal] = useState(0);
    const [incomesMonth, setIncomesMonth] = useState(0);
    const [expensesMonth, setExpensesMonth] = useState(0);
    const [savedMonth, setSavedMonth] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (userData) {
                try {
                    setStocksReal(userData ? userData.stocksReal : 0);
                    setETFReal(userData ? userData.etfReal : 0);
                    setBitcoinReal(userData ? userData.bitcoinReal : 0);
                    setCryptoReal(userData ? userData.cryptoReal : 0);
                    setBankReal(userData? userData.bankReal : 0);
                    setCashReal(userData ? userData.cashReal : 0);
                    setDigitalServicesReal(userData ? userData.digitalServicesReal : 0);
                    setTotalReal(userData ? userData.totalReal : 0);
                    setExpensesMonth(userData ? userData.outflowsArray[0] : 0);
                    setIncomesMonth(userData ? userData.incomesArray[0] : 0);
                    setSavedMonth(userData ? (userData.incomesArray[0] - userData.outflowsArray[0]) : 0);
                    
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error set balances:', error);
                }
            }
        };
        fetchData();
    }, [userData]);

    // Dati per i bilanci tradizionali (Banca, Contanti, Servizi Digitali)
    const traditionalAssets = [
        { 
            name: languages[language].assets.bank, 
            value: bankReal >= 0 ? bankReal : 0,
            icon: assetIcons.bank,
            color: assetColors.bank.primary,
            gradient: assetColors.bank.gradient
        },
        { 
            name: languages[language].assets.cash, 
            value: cashReal >= 0 ? cashReal : 0,
            icon: assetIcons.cash,
            color: assetColors.cash.primary,
            gradient: assetColors.cash.gradient
        },
        { 
            name: languages[language].assets.digitalServices, 
            value: digitalServicesReal >= 0 ? digitalServicesReal : 0,
            icon: assetIcons.digitalServices,
            color: assetColors.digitalServices.primary,
            gradient: assetColors.digitalServices.gradient
        },
    ];

    // Dati per gli investimenti (Azioni, ETF, Bitcoin, Crypto)
    const investments = [
        { 
            name: languages[language].assets.stocks, 
            value: stocksReal >= 0 ? stocksReal : 0,
            icon: assetIcons.stocks,
            color: assetColors.stocks.primary,
            gradient: assetColors.stocks.gradient,
            description: languages[language].dashboard.stockDescription
        },
        { 
            name: languages[language].assets.etf, 
            value: etfReal >= 0 ? etfReal : 0,
            icon: assetIcons.etf,
            color: assetColors.etf.primary,
            gradient: assetColors.etf.gradient,
            description: languages[language].dashboard.etfDescription
        },
        { 
            name: languages[language].assets.bitcoin, 
            value: bitcoinReal >= 0 ? bitcoinReal : 0,
            icon: assetIcons.bitcoin,
            color: assetColors.bitcoin.primary,
            gradient: assetColors.bitcoin.gradient,
            description: languages[language].dashboard.bitcoinDescription
        },
        { 
            name: languages[language].assets.crypto, 
            value: cryptoReal >= 0 ? cryptoReal : 0,
            icon: assetIcons.crypto,
            color: assetColors.crypto.primary,
            gradient: assetColors.crypto.gradient,
            description: languages[language].dashboard.cryptoDescription
        },
    ];

    const totalTraditional = traditionalAssets.reduce((acc, asset) => acc + asset.value, 0);
    const totalInvestments = investments.reduce((acc, investment) => acc + investment.value, 0);
    const totalBalance = totalReal;

    // Dati per i grafici patrimoniali
    const pieData = [
        { name: languages[language].dashboard.liquidity, value: totalTraditional, color: assetColors.totalLiquidity },
        { name: languages[language].general.investments, value: totalInvestments, color: assetColors.totalInvestments }
    ];

    const detailedPieData = [
        ...traditionalAssets.filter(asset => asset.value > 0).map(asset => ({
            name: asset.name,
            value: asset.value,
            color: asset.color
        })),
        ...investments.filter(investment => investment.value > 0).map(investment => ({
            name: investment.name,
            value: investment.value,
            color: investment.color
        }))
    ];

    // Dati per il grafico entrate/uscite
    const incExpData = [
        { 
            name: languages[language].general.incomes, 
            value: incomesMonth >= 0 ? incomesMonth : 0,
            color: assetColors.income
        },
        { 
            name: languages[language].general.outflows, 
            value: expensesMonth >= 0 ? expensesMonth : 0,
            color: assetColors.expense
        },
        { 
            name: languages[language].general.saved, 
            value: savedMonth >= 0 ? savedMonth : 0,
            color: assetColors.savings
        },
    ];

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

    return (
        <MainDashboardLayout theme={theme}>
            <DashboardContent theme={theme}>
                <div style={{ padding: '0 2rem' }}> {/* Padding interno controllato */}
                    <ModernDashboardHeader theme={theme}>
                    <ModernDashboardTitle theme={theme}>
                        {languages[language].dashboard.title}
                    </ModernDashboardTitle>                    <ModernBalanceOverview theme={theme}>
                        <div className="balance-main">
                            <h2>{languages[language].dashboard.totalBalance}</h2>
                            <div className="balance-value">
                                {formatCurrency(totalBalance)}
                            </div>
                            <div className="balance-subtitle">
                                <BiTrendingUp style={{ marginRight: '8px', color: assetColors.income }} />
                                {isHidden ? '****' : `${languages[language].dashboard.capitalAt} ${new Date().toLocaleDateString('it-IT')}`}
                            </div>
                        </div>
                        
                        <div className="balance-metrics">
                            <ModernMetricCard theme={theme}>
                                <BiWallet className="metric-icon" />
                                <div className="metric-content">
                                    <div className="metric-value">{formatCurrency(totalTraditional)}</div>
                                    <div className="metric-label">{languages[language].dashboard.liquidity}</div>
                                    <div className="metric-percentage">{formatPercentage(totalTraditional, totalBalance)}</div>
                                </div>
                            </ModernMetricCard>
                            
                            <ModernMetricCard theme={theme}>
                                <FaRocket className="metric-icon" />
                                <div className="metric-content">
                                    <div className="metric-value">{formatCurrency(totalInvestments)}</div>
                                    <div className="metric-label">{languages[language].general.investments}</div>
                                    <div className="metric-percentage">{formatPercentage(totalInvestments, totalBalance)}</div>
                                </div>
                            </ModernMetricCard>
                        </div>
                    </ModernBalanceOverview>
                </ModernDashboardHeader>

                <div style={{ display: 'flex', flexDirection: isMobileScreen ? 'column' : 'row', gap: '2rem' }}>
                    {/* Sezione Bilanci Tradizionali */}
                    <div style={{ flex: '1' }}>
                        <h3 style={{ color: theme.textColor, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                            <MdAccountBalance style={{ marginRight: '8px', color: assetColors.totalLiquidity }} />
                            {languages[language].dashboard.liquidityAvailability}
                        </h3>
                        <ModernAssetsGrid theme={theme}>
                            {traditionalAssets.map((asset, index) => {
                                const IconComponent = asset.icon;
                                return (
                                    <ModernAssetCard key={index} theme={theme} gradient={asset.gradient}>
                                        <FloatingElement delay={index * 0.2}>
                                            <div className="card-header">
                                                <div className="icon-container">
                                                    <IconComponent className="asset-icon" />
                                                </div>
                                                <Link to="/insert-values?section=balance" className="action-button" data-umami-event="dashboard-add-balance">
                                                    <AiOutlinePlusCircle />
                                                </Link>
                                            </div>
                                            
                                            <div className="card-content">
                                                <h4 className="asset-name">{isHidden ? '****' : asset.name}</h4>
                                                <div className="asset-value">{formatCurrency(asset.value)}</div>
                                                <div className="asset-percentage">
                                                    {formatPercentage(asset.value, totalBalance)} {languages[language].dashboard.ofTotal}
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
                                );
                            })}
                        </ModernAssetsGrid>
                    </div>

                    {/* Sezione Investimenti */}
                    <div style={{ flex: '1' }}>
                        <h3 style={{ color: theme.textColor, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                            <FaChartLine style={{ marginRight: '8px', color: assetColors.totalInvestments }} />
                            {languages[language].dashboard.portfolioInvestments}
                        </h3>
                        <ModernInvestmentsGrid theme={theme}>
                            {investments.map((investment, index) => {
                                const IconComponent = investment.icon;
                                return (
                                    <ModernInvestmentCard key={index} theme={theme} gradient={investment.gradient}>
                                        <FloatingElement delay={index * 0.15}>
                                            <div className="card-header">
                                                <div className="icon-container">
                                                    <IconComponent className="investment-icon" />
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
                                                        <span className="stat-label">{languages[language].dashboard.ofPortfolio}</span>
                                                        <span className="stat-value">{formatPercentage(investment.value, totalInvestments)}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="stat-label">{languages[language].dashboard.ofTotal}</span>
                                                        <span className="stat-value">{formatPercentage(investment.value, totalBalance)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="card-footer">
                                                <Link to="/insert-values?section=balance" className="update-button" data-umami-event="dashboard-update-investment">
                                                    <HiOutlinePencilAlt style={{ marginRight: '6px' }} />
                                                    {languages[language].dashboard.updateValue}
                                                </Link>
                                            </div>
                                        </FloatingElement>
                                    </ModernInvestmentCard>
                                );
                            })}
                        </ModernInvestmentsGrid>
                    </div>
                </div>

                {/* Sezione Entrate e Uscite */}
                <ModernIncomeExpenseSection theme={theme}>
                    <h3 style={{ color: theme.textColor, marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '600', textAlign: 'center' }}>
                        <FaEuroSign style={{ marginRight: '12px', color: assetColors.savings }} />
                        {languages[language].dashboard.titleGraph3}
                    </h3>
                    
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
                                        {item.name === languages[language].general.incomes && <BsArrowUpRight />}
                                        {item.name === languages[language].general.outflows && <BsArrowDownLeft />}
                                        {item.name === languages[language].general.saved && <BsWallet2 />}
                                    </div>
                                    <div className="expense-content">
                                        <h4 className="expense-name">{isHidden ? '****' : item.name}</h4>
                                        <div className="expense-value">{formatCurrency(item.value)}</div>
                                        <div className="expense-description">
                                            {item.name === languages[language].general.incomes && languages[language].dashboard.thisMonth}
                                            {item.name === languages[language].general.outflows && languages[language].dashboard.thisMonth}
                                            {item.name === languages[language].general.saved && languages[language].dashboard.saved}
                                        </div>
                                        {item.name === languages[language].general.incomes && (
                                            <Link to="/insert-values?section=income" className="income-outflow-button" data-umami-event="dashboard-add-income">
                                                <AiOutlinePlusCircle style={{ marginRight: '6px' }} />
                                                {languages[language].dashboard.addIncome || 'Add Income'}
                                            </Link>
                                        )}
                                        {item.name === languages[language].general.outflows && (
                                            <Link to="/insert-values?section=outflow" className="income-outflow-button" data-umami-event="dashboard-add-outflow">
                                                <AiOutlinePlusCircle style={{ marginRight: '6px' }} />
                                                {languages[language].dashboard.addOutflow || 'Add Outflow'}
                                            </Link>
                                        )}
                                    </div>
                                </FloatingElement>
                            </ModernIncomeExpenseCard>
                        ))}
                    </div>
                </ModernIncomeExpenseSection>

                {/* Sezione Grafici */}
                <ModernChartsSection theme={theme}>
                    <h3 style={{ color: theme.textColor, marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '600', textAlign: 'center' }}>
                        <BsGraphUpArrow style={{ marginRight: '12px', color: assetColors.savings }} />
                        {languages[language].dashboard.patrimonialAnalysis}
                    </h3>
                    
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '2rem',
                        width: '100%'
                    }}>
                        {/* Grafico Distribuzione Patrimonio Completa */}
                        <ModernChartContainer theme={theme} style={{ minWidth: isMobileScreen ? 'auto' : '450px' }}>
                            <h4>{languages[language].dashboard.titleGraph}</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={isHidden ? detailedPieDataShuffle : detailedPieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={120}
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
                            <h4>Portfolio {languages[language].general.investments}</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={isHidden ? investmentsShuffle?.filter(inv => inv?.value > 0) || [] : investments?.filter(inv => inv?.value > 0) || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={120}
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

                        {/* Grafico Liquidità vs Investimenti */}
                        <ModernChartContainer theme={theme} style={{ minWidth: isMobileScreen ? 'auto' : '450px' }}>
                            <h4>Liquidità vs Investimenti</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={isHidden ? pieDataShuffle : pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={120}
                                        innerRadius={60}
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
                                    <span>{isHidden ? '****' : languages[language].dashboard.liquidity}</span>
                                    <span className="legend-value">{formatCurrency(totalTraditional)} ({formatPercentage(totalTraditional, totalBalance)})</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-color" style={{ backgroundColor: assetColors.totalInvestments }} />
                                    <span>{isHidden ? '****' : languages[language].general.investments}</span>
                                    <span className="legend-value">{formatCurrency(totalInvestments)} ({formatPercentage(totalInvestments, totalBalance)})</span>
                                </div>
                            </div>
                        </ModernChartContainer>
                    </div>
                </ModernChartsSection>
                </div> {/* Chiusura del padding interno */}
            </DashboardContent>
        </MainDashboardLayout>
    );
};

export default Dashboard;