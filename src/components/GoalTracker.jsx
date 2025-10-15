import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import languages from '../data/languages.json';
import { 
    FaBullseye, 
    FaPiggyBank, 
    FaCreditCard, 
    FaChartLine,
    FaPlus,
    FaEdit,
    FaTrash
} from 'react-icons/fa';
import { 
    BsTrophyFill, 
    BsCalendarCheck,
    BsPercent
} from 'react-icons/bs';
import { MdSavings, MdTrendingUp } from 'react-icons/md';

// Styled Components
const GoalsContainer = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? `linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, ${props.theme.backgroundColor} 100%)`
    : `linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(255,255,255,0.9) 100%)`};
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid rgba(168, 85, 247, 0.3);
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
    background: linear-gradient(90deg, #a855f7, #8b5cf6);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem 0;
  }
`;

const GoalsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  h3 {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
  }
`;

const AddGoalButton = styled.button`
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 8px;
  color: #a855f7;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(168, 85, 247, 0.25);
    transform: translateY(-1px);
  }
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const GoalCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? `${props.theme.backgroundColor}90` 
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)'};
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.15);
  }
`;

const GoalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  .goal-icon {
    color: #a855f7;
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
  
  .goal-type {
    color: #a855f7;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: rgba(168, 85, 247, 0.1);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
  }
`;

const GoalContent = styled.div`
  .goal-title {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }
  
  .goal-description {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
    font-size: 0.85rem;
    line-height: 1.4;
    margin-bottom: 1rem;
  }
`;

const ProgressBar = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.8rem;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #a855f7, #8b5cf6);
    border-radius: 8px;
    transition: width 0.3s ease;
    width: ${props => Math.min(props.progress || 0, 100)}%;
  }
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  
  .progress-text {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'};
  }
  
  .progress-percentage {
    color: #a855f7;
    font-weight: 600;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  
  .empty-icon {
    font-size: 2rem;
    color: #a855f7;
    margin-bottom: 1rem;
  }
  
  .empty-title {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'};
  }
  
  .empty-description {
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

// Dati di esempio per gli obiettivi (in futuro questi verranno dal backend)
const generateSampleGoals = (userData, language) => {
  if (!userData) return [];
  
  // Per ora creiamo obiettivi di esempio basati sui dati dell'utente
  const totalAssets = userData.assets?.reduce((sum, asset) => sum + (asset.value || 0), 0) || 0;
  const totalExpenses = userData.expenses?.reduce((sum, exp) => sum + (exp.value || 0), 0) || 0;
  
  return [
    {
      id: 1,
      type: language === 'it' ? 'Risparmio' : 'Savings',
      title: language === 'it' ? 'Fondo Emergenze' : 'Emergency Fund',
      description: language === 'it' 
        ? 'Raggiungere 6 mesi di spese per sicurezza finanziaria'
        : 'Reach 6 months of expenses for financial security',
      targetAmount: totalExpenses * 6,
      currentAmount: totalAssets * 0.3, // Supponiamo il 30% degli asset sia liquido
      deadline: '2024-12-31',
      icon: FaPiggyBank,
      color: '#10b981'
    },
    {
      id: 2,
      type: language === 'it' ? 'Investimenti' : 'Investment',
      title: language === 'it' ? 'Portfolio €50k' : '€50k Portfolio',
      description: language === 'it' 
        ? 'Costruire un portfolio diversificato di investimenti'
        : 'Build a diversified investment portfolio',
      targetAmount: 50000,
      currentAmount: userData.assets?.filter(a => ['stocks', 'etf', 'crypto', 'bitcoin'].includes(a.typology))
        .reduce((sum, asset) => sum + (asset.value || 0), 0) || 0,
      deadline: '2025-06-30',
      icon: FaChartLine,
      color: '#3b82f6'
    },
    {
      id: 3,
      type: language === 'it' ? 'Debito' : 'Debt',
      title: language === 'it' ? 'Riduzione Debiti' : 'Debt Reduction',
      description: language === 'it' 
        ? 'Eliminare tutti i debiti della carta di credito'
        : 'Eliminate all credit card debt',
      targetAmount: 5000,
      currentAmount: 2000, // Già pagati
      deadline: '2024-08-31',
      icon: FaCreditCard,
      color: '#ef4444'
    }
  ];
};

const GoalTracker = ({ theme, userData }) => {
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Per ora usiamo dati di esempio, in futuro questi verranno dal backend
    const sampleGoals = generateSampleGoals(userData, language);
    setGoals(sampleGoals);
  }, [userData, language]);

  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!goals || goals.length === 0) {
    return (
      <GoalsContainer theme={theme}>
        <GoalsHeader theme={theme}>
          <h3>
            <FaBullseye style={{ color: '#a855f7', fontSize: '1.4rem', marginRight: '0.5rem' }} />
            {language === 'it' ? '🎯 I Tuoi Obiettivi' : '🎯 Your Goals'}
          </h3>
          <AddGoalButton onClick={() => setShowAddModal(true)}>
            <FaPlus />
            {language === 'it' ? 'Nuovo Obiettivo' : 'New Goal'}
          </AddGoalButton>
        </GoalsHeader>
        
        <EmptyState theme={theme}>
          <FaBullseye className="empty-icon" />
          <div className="empty-title">
            {language === 'it' ? 'Nessun obiettivo impostato' : 'No goals set'}
          </div>
          <div className="empty-description">
            {language === 'it' 
              ? 'Inizia a impostare i tuoi obiettivi finanziari per tracciare i progressi e rimanere motivato.'
              : 'Start setting your financial goals to track progress and stay motivated.'
            }
          </div>
        </EmptyState>
      </GoalsContainer>
    );
  }

  return (
    <GoalsContainer theme={theme}>
      <GoalsHeader theme={theme}>
        <h3>
          <FaBullseye style={{ color: '#a855f7', fontSize: '1.4rem', marginRight: '0.5rem' }} />
          {language === 'it' ? '🎯 I Tuoi Obiettivi' : '🎯 Your Goals'}
        </h3>
        <AddGoalButton onClick={() => setShowAddModal(true)}>
          <FaPlus />
          {language === 'it' ? 'Nuovo Obiettivo' : 'New Goal'}
        </AddGoalButton>
      </GoalsHeader>
      
      <GoalsGrid>
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const IconComponent = goal.icon;
          
          return (
            <GoalCard key={goal.id} theme={theme}>
              <GoalHeader>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconComponent className="goal-icon" />
                  <div className="goal-type">{goal.type}</div>
                </div>
              </GoalHeader>
              
              <GoalContent theme={theme}>
                <div className="goal-title">{goal.title}</div>
                <div className="goal-description">{goal.description}</div>
                
                <ProgressBar theme={theme} progress={progress}>
                  <div className="progress-fill" />
                </ProgressBar>
                
                <ProgressStats theme={theme}>
                  <div className="progress-text">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </div>
                  <div className="progress-percentage">
                    {progress.toFixed(1)}%
                  </div>
                </ProgressStats>
              </GoalContent>
            </GoalCard>
          );
        })}
      </GoalsGrid>
    </GoalsContainer>
  );
};

export default GoalTracker;