import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { ThemeContext } from '../contexts/ThemeContext';
import languages from '../data/languages.json';
import FinancialInsights from '../components/FinancialInsights';
import GoalTracker from '../components/GoalTracker';
import { 
    FaBrain, 
    FaBullseye, 
    FaChartBar,
    FaRocket
} from 'react-icons/fa';

// Styled Components
const InsightsPageContainer = styled.div`
  padding: 0;
  background: transparent;
  min-height: auto;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  
  @media (max-width: 768px) {
    justify-content: stretch;
  }
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  color: ${props => props.active ? props.theme.secondaryColor : '#ffffff'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.theme.secondaryColor};
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: ${props => props.theme.secondaryColor};
  }
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 0.8rem 1rem;
    font-size: 1.1rem;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const AdvancedInsightsSection = ({ theme, userData, isHidden = false }) => {
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const [activeTab, setActiveTab] = useState('insights');

  const tabs = [
    {
      id: 'insights',
      name: language === 'it' ? 'Analisi Personale' : 'Personal Analysis',
      icon: FaBrain
    },
    {
      id: 'goals',
      name: language === 'it' ? 'Obiettivi' : 'Goals',
      icon: FaBullseye
    },
    {
      id: 'predictions',
      name: language === 'it' ? 'Previsioni' : 'Predictions',
      icon: FaRocket
    }
  ];

  return (
    <InsightsPageContainer theme={theme}>
      <ContentContainer>
        <TabsContainer theme={theme}>
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={tab.id}
                active={activeTab === tab.id}
                theme={theme}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent />
                {tab.name}
              </Tab>
            );
          })}
        </TabsContainer>
        
        {activeTab === 'insights' && (
          <FinancialInsights theme={theme} userData={userData} isHidden={isHidden} />
        )}
        
        {activeTab === 'goals' && (
          <GoalTracker theme={theme} userData={userData} isHidden={isHidden} />
        )}
        
        {activeTab === 'predictions' && (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            borderRadius: '16px',
            border: `2px dashed ${theme.secondaryColor}40`
          }}>
            <FaRocket style={{ fontSize: '3rem', color: theme.secondaryColor, marginBottom: '1rem' }} />
            <h3 style={{ color: theme.textColor, marginBottom: '1rem' }}>
              {language === 'it' ? '🔮 Previsioni AI' : '🔮 AI Predictions'}
            </h3>
            <p style={{ color: theme.textColor + '80' }}>
              {language === 'it' 
                ? 'Previsioni intelligenti sui tuoi trend finanziari in arrivo!'
                : 'Smart predictions on your financial trends coming soon!'
              }
            </p>
          </div>
        )}
      </ContentContainer>
    </InsightsPageContainer>
  );
};

export default AdvancedInsightsSection;