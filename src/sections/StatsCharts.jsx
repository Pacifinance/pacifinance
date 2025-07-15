import React, {useState, useContext} from 'react';
import BalancesStatsMonth from '../components/BalancesStatsMonth';
import BalancesStatsYear from '../components/BalancesStatsYear';
import BalancesCharts from '../components/BalancesCharts';
import BalancesLinesCharts from '../components/BalancesLinesChart';
import InOutCharts from '../components/InOutChart';
import PercentageOutflowsChart from '../components/PercentageOutflowsChart';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { StandardPageTitle, StyledSectionStats, SecondaryTitle } from '../styles/MyStyled';
import styled from 'styled-components';
import InOutStatsMonth from '../components/InOutStatsMonth';
import InOutStatsYear from '../components/InOutStatsYear';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { CustomTick } from '../utils/customGraphsInfo';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';

const StatsContainer = styled.div`
  background: ${props => props.theme.backgroundColor};
  min-height: 100vh;
  padding: 0;
  margin: 0;
  border: none !important;
  box-shadow: none !important;
  width: 100%;
  margin-left: 0;
  padding-top: 0;
  
  @media (min-width: 768px) {
    margin-left: 5.5rem;
    width: calc(100% - 5.5rem);
  }
`;

const StatsTitle = styled(StandardPageTitle)`
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
  text-align: center;
  font-weight: 700;
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.secondaryColor || '#047857'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
    font-size: 1.75rem;
    padding: 0 0.5rem;
  }
`;

const ModernButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  padding: 0 1rem;
  margin: 2rem 0;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    margin: 1.5rem 0;
    padding: 0 0.5rem;
    flex-direction: column;
    align-items: center;
  }
`;

const ModernButton = styled.button`
  background: ${props => props.active 
    ? `linear-gradient(135deg, ${props.theme.buttonBackgroundColor} 0%, ${props.theme.secondaryColor || '#047857'} 100%)`
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.02)'
  };
  color: ${props => props.active 
    ? 'white' 
    : props.theme.textColor
  };
  border: 2px solid ${props => props.active 
    ? 'transparent' 
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'
  };
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active 
    ? '0 4px 15px rgba(7, 145, 100, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.05)'
  };
  flex: 1;
  max-width: 200px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.active 
      ? '0 6px 20px rgba(7, 145, 100, 0.4)' 
      : `0 4px 15px rgba(7, 145, 100, 0.2)`
    };
    background: ${props => !props.active && `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}15 0%, ${props.theme.secondaryColor || '#047857'}10 100%)`};
    border-color: ${props => !props.active && `${props.theme.buttonBackgroundColor}40`};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 0.9rem;
    max-width: 280px;
    width: 100%;
  }
`;

const ContentSection = styled.div`
  padding: 0 1rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const ModernStyledSectionStats = styled.div`
  background: ${props => props.theme.backgroundColor};
  padding: 1rem;
  margin: 0;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const ModernSecondaryTitle = styled(SecondaryTitle)`
  text-align: center;
  margin: 2.5rem 0 1.5rem 0;
  padding: 0 1rem;
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 600;
  color: ${props => props.theme.textColor};
  
  @media (max-width: 768px) {
    margin: 2rem 0 1rem 0;
    padding: 0 0.5rem;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 1.5rem 0;
  overflow-x: auto;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
    margin: 1rem 0;
    
    > div {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
`;

const ModernChartCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.08)'
  };
  border-radius: 16px;
  padding: 2rem;
  margin: 0 1rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)'
  };
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 900px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
      : '0 8px 30px rgba(0, 0, 0, 0.12)'
    };
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 0 0.5rem;
    border-radius: 12px;
    max-width: calc(100vw - 2rem);
  }
`;

export default function StatsCharts() {
    const { userData } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const { language } = useContext(LanguageContext);
    const { isHidden } = useContext(PrivacyContext);
    const [activePage, setActivePage] = useState("statsBilancio");
    const formattedPreMonthDate = userData?.preMonthDate
      ? new Date(userData.preMonthDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })
      : "";

    const formattedPreYearSameMonthDate = userData?.preYearSameMonthDate
      ? new Date(userData.preYearSameMonthDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })
      : "";

    const handlePageChange = (page) => {
        setActivePage(page);
    };

    const renderPage = () => {
        if (activePage === "statsBilancio") {
          return (
            <>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.titleGraph}</ModernSecondaryTitle>
                <ChartContainer>
                  <ModernChartCard theme={theme}>
                    <BalancesLinesCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                  </ModernChartCard>
                </ChartContainer>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.titleGraph2}</ModernSecondaryTitle>
                <ChartContainer>
                  <ModernChartCard theme={theme}>
                    <BalancesCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                  </ModernChartCard>
                </ChartContainer>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.detailedVision}</ModernSecondaryTitle>
                <BalancesStatsMonth theme={theme} userData={userData} isHidden={isHidden}/>
                <BalancesStatsYear theme={theme} userData={userData} isHidden={isHidden}/>
            </>
          );
        } else if (activePage === "statsIncomesOutflows") {
          return (
            <>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.titleGraph}</ModernSecondaryTitle>
                <ChartContainer>
                  <ModernChartCard theme={theme}>
                    <InOutCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                  </ModernChartCard>
                </ChartContainer>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.titleGraph2}</ModernSecondaryTitle>
                <ChartContainer>
                  <ModernChartCard theme={theme}>
                    <PercentageOutflowsChart theme={theme} userData={userData} isHidden={isHidden}/>
                  </ModernChartCard>
                </ChartContainer>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.detailedVision}</ModernSecondaryTitle>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.titleDetailsMonth} - {formattedPreMonthDate}</ModernSecondaryTitle>
                <InOutStatsMonth theme={theme} userData={userData} isHidden={isHidden}/>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.titleDetailsYear} - {formattedPreYearSameMonthDate}</ModernSecondaryTitle>
                <InOutStatsYear theme={theme} userData={userData} isHidden={isHidden}/>
            </>
          );
        }
      };

    return (
        <StatsContainer theme={theme}>
            <StatsTitle theme={theme}>{languages[language].graphs.title}</StatsTitle>
            
            <ModernButtonGroup>
                <ModernButton
                    theme={theme}
                    active={activePage === "statsBilancio"}
                    onClick={() => handlePageChange("statsBilancio")}
                >
                    {languages[language].graphs.statsBalance.title}
                </ModernButton>
                <ModernButton
                    theme={theme}
                    active={activePage === "statsIncomesOutflows"}
                    onClick={() => handlePageChange("statsIncomesOutflows")}
                >
                    {languages[language].graphs.statsOutflows.title}
                </ModernButton>
            </ModernButtonGroup>
            
            <ModernStyledSectionStats theme={theme}>
                <ContentSection>
                    {renderPage()}
                </ContentSection>
            </ModernStyledSectionStats>
        </StatsContainer>
      );
}
