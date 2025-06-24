import React, { useState, useContext } from 'react';
import { Section } from '../styles/MyStyled';
import { 
  StyledMonth, 
  StyledLabel, 
  StyledRankingsSection, 
  StandardPageTitleGreen, 
  StyledRankingPage, 
  CenteredRankings 
} from '../styles/MyStyled';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualIcon from '@mui/icons-material/DragHandle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import Tooltip from '@mui/material/Tooltip';
import styled from 'styled-components';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import Leaderboard from './Leaderboard';

const ComparisonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    gap: 1.5rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: ${props => props.theme.textColor};
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  p {
    color: ${props => props.theme.textColor};
    font-size: 1.1rem;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

export const SectionTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
  background: ${props => props.theme.cardBackgroundColor};
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: fit-content;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
    max-width: 100%;
  }
`;

const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? props.theme.buttonBackgroundColor : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.textColor};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.active ? props.theme.buttonBackgroundColor : `${props.theme.buttonBackgroundColor}15`};
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ComparisonCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? props.theme.primaryColor : 'white'};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border: 1px solid ${props => props.theme.borderColor || 'transparent'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 35px rgba(0,0,0,0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.accent || props.theme.buttonBackgroundColor};
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  h3 {
    color: ${props => props.theme.textColor};
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#eee'};
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .value {
    color: ${props => props.theme.textColor};
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ComingSoonCard = styled(ComparisonCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 200px;
  background: linear-gradient(135deg, ${props => props.theme.mode === 'dark' ? props.theme.primaryColor : 'white'} 0%, ${props => props.theme.buttonBackgroundColor}15 100%);
  
  h3 {
    color: ${props => props.theme.textColor};
    font-weight: 600;
    margin: 0.5rem 0;
  }
  
  p {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
    font-weight: 500;
  }
  
  .coming-soon-text {
    color: ${props => props.theme.buttonBackgroundColor};
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 1rem;
  }
`;

const InsightCard = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}15 0%, ${props => props.theme.buttonBackgroundColor}05 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  border-left: 4px solid ${props => props.theme.buttonBackgroundColor};
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  
  h4 {
    color: ${props => props.theme.textColor};
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }
  
  p {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'};
    margin: 0;
    line-height: 1.5;
    font-weight: 500;
  }
`;

function Comparison({ theme, userData, handleSetIsUpdated, isHidden}) {
    const { language } = useContext(LanguageContext);
    const [activeTab, setActiveTab] = useState('insights');

    // Mock data for comparisons - in a real app, this would come from API
    const mockComparisonData = {
        avgBalance: {
            user: userData?.totalReal || 0,
            similarUsers: 45000,
            allUsers: 38000
        },
        avgIncome: {
            user: userData?.incomesArray?.[0] || 0,
            similarUsers: 3200,
            allUsers: 2800
        },
        avgExpenses: {
            user: userData?.expensesArray?.[0] || 0,
            similarUsers: 2400,
            allUsers: 2200
        }
    };

    const formatCurrency = (value) => {
        if (isHidden) return '****';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getComparisonIcon = (userValue, compareValue) => {
        if (userValue > compareValue) return <TrendingUpIcon style={{ color: '#27ae60' }} />;
        if (userValue < compareValue) return <TrendingDownIcon style={{ color: '#e74c3c' }} />;
        return <EqualIcon style={{ color: '#f39c12' }} />;
    };

    const generateInsights = () => {
        const insights = [];
        const { avgBalance, avgIncome, avgExpenses } = mockComparisonData;
        
        if (avgBalance.user > avgBalance.similarUsers) {
            insights.push({
                type: 'positive',
                title: languages[language].comparison.insights.betterThan + ' 70% ' + languages[language].comparison.insights.ofUsers,
                description: languages[language].comparison.tips.goodBalance
            });
        }
        
        if (avgExpenses.user > avgIncome.user * 0.8) {
            insights.push({
                type: 'warning',
                title: languages[language].comparison.tips.title,
                description: languages[language].comparison.tips.highExpenses
            });
        }
        
        return insights;
    };

    const renderInsightsTab = () => (
        <>
            <GridContainer>
                <ComparisonCard theme={theme} accent="#3498db">
                    <CardHeader theme={theme}>
                        <h3><AccountBalanceIcon /> {languages[language].comparison.cards.avgBalance.title}</h3>
                        <Tooltip title={languages[language].comparison.cards.avgBalance.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgBalance.yourBalance}</span>
                        <span className="value">
                            {formatCurrency(mockComparisonData.avgBalance.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgBalance.avgSimilar}</span>
                        <span className="value">
                            {formatCurrency(mockComparisonData.avgBalance.similarUsers)}
                            {getComparisonIcon(mockComparisonData.avgBalance.user, mockComparisonData.avgBalance.similarUsers)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgBalance.avgAll}</span>
                        <span className="value">
                            {formatCurrency(mockComparisonData.avgBalance.allUsers)}
                            {getComparisonIcon(mockComparisonData.avgBalance.user, mockComparisonData.avgBalance.allUsers)}
                        </span>
                    </MetricRow>
                </ComparisonCard>

                <ComparisonCard theme={theme} accent="#27ae60">
                    <CardHeader theme={theme}>
                        <h3><MonetizationOnIcon /> {languages[language].comparison.cards.avgIncome.title}</h3>
                        <Tooltip title={languages[language].comparison.cards.avgIncome.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgIncome.yourIncome}</span>
                        <span className="value">
                            {formatCurrency(mockComparisonData.avgIncome.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgIncome.avgSimilar}</span>
                        <span className="value">
                            {formatCurrency(mockComparisonData.avgIncome.similarUsers)}
                            {getComparisonIcon(mockComparisonData.avgIncome.user, mockComparisonData.avgIncome.similarUsers)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgIncome.avgAll}</span>
                        <span className="value">
                            {formatCurrency(mockComparisonData.avgIncome.allUsers)}
                            {getComparisonIcon(mockComparisonData.avgIncome.user, mockComparisonData.avgIncome.allUsers)}
                        </span>
                    </MetricRow>
                </ComparisonCard>

                <ComparisonCard theme={theme} accent="#e74c3c">
                    <CardHeader theme={theme}>
                        <h3><TrendingDownIcon /> {languages[language].comparison.cards.avgExpenses.title}</h3>
                        <Tooltip title={languages[language].comparison.cards.avgExpenses.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgExpenses.yourExpenses}</span>
                        <span className="value">
                            {formatCurrency(mockComparisonData.avgExpenses.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgExpenses.avgSimilar}</span>
                        <span className="value">
                            {formatCurrency(mockComparisonData.avgExpenses.similarUsers)}
                            {getComparisonIcon(mockComparisonData.avgExpenses.similarUsers, mockComparisonData.avgExpenses.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgExpenses.avgAll}</span>
                        <span className="value">
                            {formatCurrency(mockComparisonData.avgExpenses.allUsers)}
                            {getComparisonIcon(mockComparisonData.avgExpenses.allUsers, mockComparisonData.avgExpenses.user)}
                        </span>
                    </MetricRow>
                </ComparisonCard>

                <ComingSoonCard theme={theme}>
                    <SavingsIcon style={{ fontSize: '3rem', color: theme.buttonBackgroundColor }} />
                    <h3>{languages[language].comparison.cards.savingsRate.title}</h3>
                    <p>{languages[language].comparison.cards.savingsRate.description}</p>
                    <div className="coming-soon-text">{languages[language].comparison.cards.savingsRate.comingSoon}</div>
                </ComingSoonCard>

                <ComingSoonCard theme={theme}>
                    <PieChartIcon style={{ fontSize: '3rem', color: theme.buttonBackgroundColor }} />
                    <h3>{languages[language].comparison.cards.assetAllocation.title}</h3>
                    <p>{languages[language].comparison.cards.assetAllocation.description}</p>
                    <div className="coming-soon-text">{languages[language].comparison.cards.assetAllocation.comingSoon}</div>
                </ComingSoonCard>

                <ComingSoonCard theme={theme}>
                    <BarChartIcon style={{ fontSize: '3rem', color: theme.buttonBackgroundColor }} />
                    <h3>{languages[language].comparison.cards.spendingCategories.title}</h3>
                    <p>{languages[language].comparison.cards.spendingCategories.description}</p>
                    <div className="coming-soon-text">{languages[language].comparison.cards.spendingCategories.comingSoon}</div>
                </ComingSoonCard>
            </GridContainer>

            {generateInsights().map((insight, index) => (
                <InsightCard key={index} theme={theme}>
                    <h4><TipsAndUpdatesIcon /> {insight.title}</h4>
                    <p>{insight.description}</p>
                </InsightCard>
            ))}
        </>
    );

    const renderRankingsTab = () => (
        <Leaderboard 
          theme={theme} 
          userData={userData} 
          handleSetIsUpdated={handleSetIsUpdated} 
          isHidden={isHidden} 
        />
    );

    return (
        <Section theme={theme}>
            <ComparisonContainer>
                <SectionHeader theme={theme}>
                    <h1>{languages[language].comparison.title}</h1>
                    <p>{languages[language].comparison.subtitle}</p>
                </SectionHeader>

                <SectionTabs theme={theme}>
                    <TabButton 
                        theme={theme} 
                        active={activeTab === 'insights'} 
                        onClick={() => setActiveTab('insights')}
                    >
                        <BarChartIcon />
                        {languages[language].comparison.sections.insights.title}
                    </TabButton>
                    <TabButton 
                        theme={theme} 
                        active={activeTab === 'rankings'} 
                        onClick={() => setActiveTab('rankings')}
                    >
                        <CompareArrowsIcon />
                        {languages[language].comparison.sections.rankings.title}
                    </TabButton>
                </SectionTabs>

                {activeTab === 'insights' && renderInsightsTab()}
                {activeTab === 'rankings' && renderRankingsTab()}
            </ComparisonContainer>
        </Section>
    );
}

export default Comparison;

