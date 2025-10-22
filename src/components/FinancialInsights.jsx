import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import languages from '../data/languages.json';
import { 
    FaBrain, 
    FaLightbulb, 
    FaExclamationTriangle,
    FaChartLine,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';
import { 
    BsArrowUpRight, 
    BsArrowDownLeft, 
    BsGraphUp,
    BsInfoCircle
} from 'react-icons/bs';
import { MdInsights, MdTrendingUp } from 'react-icons/md';
import { getOutflowsArray, getIncomesArray } from '../utils/userDataSelectors';

// Styled Components
const InsightsContainer = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? `linear-gradient(135deg, ${props.theme.secondaryColor}10 0%, ${props.theme.backgroundColor} 100%)`
    : `linear-gradient(135deg, ${props.theme.secondaryColor}08 0%, rgba(255,255,255,0.9) 100%)`};
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid ${props => `${props.theme.secondaryColor}30`};
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.secondaryColor}, ${props => props.theme.secondaryColor}80);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem 0;
  }
`;

const InsightsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const InsightCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? `${props.theme.backgroundColor}80` 
    : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 12px;
  padding: 1.2rem;
  border-left: 4px solid ${props => props.insightColor || props.theme.secondaryColor};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${props => `${props.insightColor || props.theme.secondaryColor}20`};
    border-left-width: 6px;
  }
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  
  .insight-icon {
    color: ${props => props.insightColor || props.theme.secondaryColor};
    margin-right: 0.8rem;
    font-size: 1.1rem;
  }
  
  .insight-type {
    color: ${props => props.insightColor || props.theme.secondaryColor};
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const InsightContent = styled.div`
  padding: 1rem 0 0.5rem 0;
  
  .insight-title {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
    line-height: 1.3;
  }
  
  .insight-description {
    font-size: 0.875rem;
    line-height: 1.4;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
    margin-bottom: 0.5rem;
  }
  
  .insight-value {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${props => props.insightColor};
    opacity: 0.9;
  }
`;

const ViewMoreButton = styled.button`
  background: ${props => `${props.theme.secondaryColor}15`};
  border: 1px solid ${props => `${props.theme.secondaryColor}40`};
  border-radius: 8px;
  color: ${props => props.theme.secondaryColor};
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background: ${props => `${props.theme.secondaryColor}25`};
    transform: translateY(-1px);
  }
`;

// Funzione per generare insights basati sui dati utente
const generateInsights = (userData, language, isHidden) => {
  if (!userData || !userData.assets) return [];
  
  const insights = [];
  
  // Calcola totali usando i dati degli array del dashboard
  const totalAssets = userData.assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  
  // Usa i dati dal dashboard (indice 0 = mese corrente)
  const totalExpenses = getOutflowsArray(userData) && getOutflowsArray(userData)[0] ? getOutflowsArray(userData)[0] : 0;
  const totalIncome = getIncomesArray(userData) && getIncomesArray(userData)[0] ? getIncomesArray(userData)[0] : 0;

  // Insight 1: Analisi spese mensili
  if (totalExpenses > 0) {
    const spendingRate = totalIncome > 0 ? (totalExpenses / totalIncome * 100) : 100;
    const level = spendingRate <= 70 ? 'low' : spendingRate <= 85 ? 'moderate' : 'high';
    
    insights.push({
      type: languages[language].graphs.insights.spendingRate.title,
      icon: BsArrowDownLeft,
      color: level === 'low' ? '#10b981' : level === 'moderate' ? '#f59e0b' : '#ef4444',
      title: languages[language].graphs.insights.spendingRate[level].replace('{percentage}', isHidden ? '****' : spendingRate.toFixed(1)),
      description: languages[language].graphs.insights.spendingRate.recommendation[level],
      value: isHidden ? '****' : `€${totalExpenses.toLocaleString()}`
    });
  }

  // Insight 2: Diversificazione portfolio
  const investmentAssets = userData.assets.filter(asset => 
    ['stocks', 'etf', 'crypto', 'bitcoin', 'bonds', 'funds'].includes(asset.typology)
  );
  
  if (investmentAssets.length > 0) {
    const investmentTotal = investmentAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const diversification = investmentAssets.length;
    
    const level = diversification >= 3 ? 'excellent' : diversification >= 2 ? 'good' : 'poor';
    
    insights.push({
      type: languages[language].graphs.insights.diversification.title,
      icon: FaChartLine,
      color: level === 'excellent' ? '#10b981' : level === 'good' ? '#f59e0b' : '#ef4444',
      title: isHidden ? `Portfolio: ****` : `Portfolio: €${investmentTotal.toLocaleString()}`,
      description: languages[language].graphs.insights.diversification.recommendation[level],
      value: isHidden ? '****' : `${((investmentTotal / totalAssets) * 100).toFixed(1)}%`
    });
  }

  // Insight 3: Analisi liquidità
  const liquidAssets = userData.assets.filter(asset => 
    ['bank', 'cash', 'digitalServices'].includes(asset.typology)
  );
  const liquidTotal = liquidAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const liquidityRatio = (liquidTotal / totalAssets) * 100;

  const liquidityLevel = liquidityRatio >= 10 && liquidityRatio <= 30 ? 'adequate' 
                     : liquidityRatio < 10 ? 'low' : 'high';

  insights.push({
    type: languages[language].graphs.insights.liquidity.title,
    icon: BsGraphUp,
    color: liquidityLevel === 'adequate' ? '#10b981' 
         : liquidityLevel === 'low' ? '#ef4444' : '#f59e0b',
    title: `${languages[language].graphs.insights.liquidity.title}: ${isHidden ? '****' : liquidityRatio.toFixed(1)}%`,
    description: languages[language].graphs.insights.liquidity.recommendation[liquidityLevel],
    value: isHidden ? '****' : `€${liquidTotal.toLocaleString()}`
  });

  return insights.slice(0, 4); // Mostra max 4 insights
};

const FinancialInsights = ({ theme, userData, isHidden = false }) => {
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const [insights, setInsights] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (userData) {
      const generatedInsights = generateInsights(userData, language, isHidden);
      setInsights(generatedInsights);
    }
  }, [userData, language, isHidden]);

  if (!insights.length) return null;

  const displayedInsights = showAll ? insights : insights.slice(0, isMobileScreen ? 2 : 3);

  return (
    <InsightsContainer theme={theme}>
      <InsightsHeader theme={theme}>
        <FaBrain style={{ color: theme.secondaryColor, fontSize: '1.4rem' }} />
        <h3>
          🧠 {languages[language].graphs.insights.title}
        </h3>
      </InsightsHeader>
      
      <InsightsGrid>
        {displayedInsights.map((insight, index) => (
          <InsightCard 
            key={index} 
            theme={theme} 
            insightColor={insight.color}
          >
            <InsightHeader insightColor={insight.color}>
              <insight.icon className="insight-icon" />
              <span className="insight-type">{insight.type}</span>
            </InsightHeader>
            
            <InsightContent theme={theme} insightColor={insight.color}>
              <div className="insight-title">{insight.title}</div>
              <div className="insight-description">{insight.description}</div>
              {insight.value && (
                <div className="insight-value" style={{ marginTop: '0.5rem' }}>
                  {language === 'it' ? 'Valore: ' : 'Value: '}
                  <span className="insight-value">{insight.value}</span>
                </div>
              )}
            </InsightContent>
          </InsightCard>
        ))}
      </InsightsGrid>
      
      {insights.length > (isMobileScreen ? 2 : 3) && (
        <ViewMoreButton 
          theme={theme}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll 
            ? (language === 'it' ? 'Mostra meno' : 'Show less')
            : (language === 'it' ? `Mostra tutti (${insights.length})` : `Show all (${insights.length})`)
          }
        </ViewMoreButton>
      )}
    </InsightsContainer>
  );
};

export default FinancialInsights;