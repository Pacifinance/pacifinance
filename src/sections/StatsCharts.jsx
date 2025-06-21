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
  border: none;
  width: 100%;
  margin-left: 0;
  
  @media (min-width: 768px) {
    margin-left: 5.5rem;
    width: calc(100% - 5.5rem);
  }
`;

const StatsTitle = styled(StandardPageTitle)`
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 1.75rem;
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
    padding: 10px 16px;
    font-size: 0.85rem;
    max-width: none;
  }
`;

const ContentSection = styled.div`
  padding: 0 1rem;
  
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
  
  @media (max-width: 768px) {
    margin: 2rem 0 1rem 0;
    padding: 0 0.5rem;
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
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.title}</ModernSecondaryTitle>
                <BalancesLinesCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.titleGraph2}</ModernSecondaryTitle>
                <BalancesCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.detailedVision}</ModernSecondaryTitle>
                <BalancesStatsMonth theme={theme} userData={userData} isHidden={isHidden}/>
                <BalancesStatsYear theme={theme} userData={userData} isHidden={isHidden}/>
            </>
          );
        } else if (activePage === "statsIncomesOutflows") {
          return (
            <>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.title}</ModernSecondaryTitle>
                <InOutCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                <ModernSecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.titleGraph2}</ModernSecondaryTitle>
                <PercentageOutflowsChart theme={theme} userData={userData} isHidden={isHidden}/>
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
            <StatsTitle theme={theme}>
                {activePage === "statsBilancio" 
                    ? languages[language].graphs.statsBalance.title 
                    : languages[language].graphs.statsOutflows.title}
            </StatsTitle>
            
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