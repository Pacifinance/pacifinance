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
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import { TrendingUp, BarChart3, PieChart, LineChart, DollarSign, TrendingDown } from 'lucide-react';

const StatsContainer = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
  };
  min-height: 150vh;
  padding: 0;
  margin: 0;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  padding-bottom: 60vh;
  
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
  padding: 3rem 1rem 2rem 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem 1.5rem 1rem;
  }
`;

const StatsTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin: 0 0 1rem 0;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 30%, #079164 70%, #065f46 100%)'
    : 'linear-gradient(135deg, #1e293b 0%, #475569 30%, #079164 70%, #065f46 100%)'
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const StatsSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
  margin: 0 0 2rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    padding: 0 1rem;
  }
`;

const NavigationTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    gap: 0.25rem;
    margin-bottom: 2rem;
    padding: 0 0.5rem;
  }
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  background: ${props => props.active 
    ? `linear-gradient(135deg, ${props.theme.buttonBackgroundColor} 0%, ${props.theme.secondaryColor || '#047857'} 100%)`
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(255, 255, 255, 0.8)'
  };
  
  color: ${props => props.active 
    ? 'white' 
    : props.theme.textColor
  };
  
  box-shadow: ${props => props.active 
    ? '0 8px 25px rgba(7, 145, 100, 0.35), 0 4px 15px rgba(7, 145, 100, 0.2)' 
    : props.theme.mode === 'dark'
      ? '0 4px 15px rgba(0, 0, 0, 0.3)'
      : '0 4px 15px rgba(0, 0, 0, 0.1)'
  };
  
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.active 
    ? 'rgba(255, 255, 255, 0.2)' 
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.08)'
  };
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${props => props.active 
      ? '0 12px 35px rgba(7, 145, 100, 0.4), 0 6px 20px rgba(7, 145, 100, 0.25)' 
      : `0 8px 25px rgba(7, 145, 100, 0.25), 0 4px 15px rgba(7, 145, 100, 0.15)`
    };
    
    background: ${props => !props.active && (props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'rgba(255, 255, 255, 0.95)'
    )};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(0.98);
  }
  
  svg {
    width: 20px;
    height: 20px;
    transition: all 0.3s ease;
  }
  
  &:hover svg {
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
    gap: 0.5rem;
    border-radius: 12px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.85rem;
    
    span {
      display: none;
    }
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const MainContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem 4rem 1rem;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem 3rem 0.5rem;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #079164 100%)'
    : 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #079164 100%)'
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
`;

const SectionDescription = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)'};
  margin: 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: ${props => props.columns === 2 ? '1fr 1fr' : '1fr'};
  }
  
  @media (max-width: 768px) {
    gap: 1.5rem;
    margin-bottom: 2rem;
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
  border-radius: 24px;
  padding: 2rem;
  padding-top: 4rem;
  min-height: 650px;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 10px 40px rgba(0, 0, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)' 
    : '0 10px 40px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(0, 0, 0, 0.04)'
  };
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${props => props.theme.mode === 'dark'
      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(7,145,100,0.3), transparent)'
    };
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 25px rgba(0, 0, 0, 0.3)' 
      : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.08)'
    };
    border-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(7, 145, 100, 0.2)'
    };
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
    
    &:hover {
      transform: translateY(-4px) scale(1.005);
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  
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



export default function StatsCharts() {
    const auth = useAuth();
    const { userData } = auth;
    const { theme } = useContext(ThemeContext);
    const { language } = useContext(LanguageContext);
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
    
    const formattedPreMonthDate = userData?.preMonthDate
      ? new Date(userData.preMonthDate).toLocaleDateString('it-IT', { 
          year: 'numeric', 
          month: 'long' 
        })
      : "";

    const formattedPreYearSameMonthDate = userData?.preYearSameMonthDate
      ? new Date(userData.preYearSameMonthDate).toLocaleDateString('it-IT', { 
          year: 'numeric', 
          month: 'long' 
        })
      : "";

    const handlePageChange = (page) => {
        setActivePage(page);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 800);
    };
    
    const hasData = userData && (
        (userData.last12MonthsData && userData.last12MonthsData.length > 0) ||
        (userData.incomesArray && userData.incomesArray.length > 0) ||
        (userData.outflowsArray && userData.outflowsArray.length > 0)
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
                        <p>{languages[language].graphs.loading.balance}</p>
                    </div>
                </LoadingContainer>
            );
        }

        if (!hasData) {
            return (
                <EmptyStateContainer theme={theme}>
                    <h3>{languages[language].graphs.emptyState.title}</h3>
                    <p>
                        {languages[language].graphs.emptyState.balanceDescription}
                    </p>
                </EmptyStateContainer>
            );
        }

        return (
            <>
                <SectionContainer>
                    <SectionHeader>
                        <SectionTitle theme={theme}>
                            {languages[language].graphs.statsBalance.titleGraph}
                        </SectionTitle>
                        <SectionDescription theme={theme}>
                            {languages[language].graphs.descriptions.balanceOverview}
                        </SectionDescription>
                    </SectionHeader>
                    
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
                            {languages[language].graphs.statsBalance.detailedVision}
                        </SectionTitle>
                        <SectionDescription theme={theme}>
                            {languages[language].graphs.descriptions.balanceDetails}
                        </SectionDescription>
                    </SectionHeader>
                    
                    <StatsGrid>
                        <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <BalancesStats theme={theme} userData={userData} isHidden={isHidden} period="month"/>
                        </div>
                        <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <BalancesStats theme={theme} userData={userData} isHidden={isHidden} period="year"/>
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
                        <p>{languages[language].graphs.loading.incomeOutflow}</p>
                    </div>
                </LoadingContainer>
            );
        }

        if (!hasData) {
            return (
                <EmptyStateContainer theme={theme}>
                    <h3>{languages[language].graphs.emptyState.title}</h3>
                    <p>
                        {languages[language].graphs.emptyState.incomeOutflowDescription}
                    </p>
                </EmptyStateContainer>
            );
        }

        return (
            <>
                <SectionContainer>
                    <SectionHeader>
                        <SectionTitle theme={theme}>
                            {languages[language].graphs.statsOutflows.titleGraph}
                        </SectionTitle>
                        <SectionDescription theme={theme}>
                            {languages[language].graphs.descriptions.incomeOutflowOverview}
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
                            {languages[language].graphs.statsOutflows.detailedVision}
                        </SectionTitle>
                        <SectionDescription theme={theme}>
                            {languages[language].graphs.descriptions.incomeOutflowDetails}
                        </SectionDescription>
                    </SectionHeader>
                    
                    <StatsGrid>
                        <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <InOutStats period="month" theme={theme} userData={userData} isHidden={isHidden}/>
                        </div>
                        <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <InOutStats period="year" theme={theme} userData={userData} isHidden={isHidden}/>
                        </div>
                    </StatsGrid>
                </SectionContainer>
            </>
        );
    };

    return (
        <StatsContainer theme={theme}>
            <HeaderSection>
                <StatsTitle theme={theme}>
                    {languages[language].graphs.title}
                </StatsTitle>
                <StatsSubtitle theme={theme}>
                    {languages[language].graphs.subtitle}
                </StatsSubtitle>
                
                <NavigationTabs>
                    <TabButton
                        theme={theme}
                        active={activePage === "statsBilancio"}
                        onClick={() => handlePageChange("statsBilancio")}
                    >
                        <BarChart3 />
                        <span>{languages[language].graphs.statsBalance.title}</span>
                    </TabButton>
                    <TabButton
                        theme={theme}
                        active={activePage === "statsIncomesOutflows"}
                        onClick={() => handlePageChange("statsIncomesOutflows")}
                    >
                        <TrendingUp />
                        <span>{languages[language].graphs.statsOutflows.title}</span>
                    </TabButton>
                </NavigationTabs>
            </HeaderSection>

            <MainContent>
                {activePage === "statsBilancio" ? renderBalanceContent() : renderIncomeOutflowContent()}
            </MainContent>
        </StatsContainer>
    );
}
