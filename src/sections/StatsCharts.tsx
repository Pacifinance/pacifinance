import React, {useState, useContext, useEffect} from 'react';
import BalancesStats from '../components/BalancesStats';
import BalancesChart from '../components/BalancesChart';
import InOutCharts from '../components/InOutChart';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../contexts/ThemeContext';
import { StandardPageTitle, StyledSectionStats, SecondaryTitle } from '../styles/MyStyled';
import styled from 'styled-components';
import InOutStats from '../components/InOutStats';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { CustomTick } from '../utils/customGraphsInfo';
import { LanguageContext } from '../contexts/LanguageContext';
import { TrendingUp, BarChart3, PieChart, LineChart, DollarSign, TrendingDown, Brain } from 'lucide-react';
import AdvancedInsightsSection from '../components/AdvancedInsightsSection';
import DetailedExpenseAnalysis from '../components/DetailedOutflowsAnalysis';
import { getIncomesArray, getOutflowsArray, getBalanceChartData } from '../utils/userDataSelectors';

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
    padding-top: 4rem; /* Aggiunto padding-top per mobile */
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

// Aggiungiamo le keyframes per le animazioni
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
    const auth = useAuth();
    const { userData } = auth;
    const { theme } = useContext(ThemeContext);
    const { language, translations } = useContext(LanguageContext);
    const { isHidden } = useContext(PrivacyContext);
    const [activePage, setActivePage] = useState("statsBilancio");
    const [isLoading, setIsLoading] = useState(true);
    
    // Simula il caricamento dei dati
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
                    <ChartGrid columns={2}>
                        <ChartCard theme={theme} className="slide-in-left">
                            <BalancesChart 
                                type="area"
                                theme={theme} 
                                userData={userData} 
                                isHidden={isHidden} 
                                CustomTick={CustomTick}
                            />
                        </ChartCard>
                        <ChartCard theme={theme} className="slide-in-right">
                            <BalancesChart 
                                type="bar"
                                theme={theme} 
                                userData={userData} 
                                isHidden={isHidden} 
                                CustomTick={CustomTick}
                            />
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
                    
                    <ChartGrid columns={2}>
                        <ChartCard theme={theme} className="slide-in-left">
                            <InOutCharts 
                                theme={theme} 
                                userData={userData} 
                                isHidden={isHidden} 
                                CustomTick={CustomTick}
                            />
                        </ChartCard>
                        <ChartCard theme={theme} className="slide-in-right">
                            <InOutCharts 
                                theme={theme} 
                                userData={userData} 
                                isHidden={isHidden}
                                type="pie"
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
                {/* activePage === "insights" && renderInsightsContent() */}
            </MainContent>
        </StatsContainer>
        </>
    );
}
