import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import languages from '../data/languages.json';
import {
    FaBullseye, 
    FaChartLine, 
    FaExclamationTriangle,
    FaSave,
    FaEdit,
    FaTrash,
    FaPlus,
    FaBell,
    FaEuroSign
} from 'react-icons/fa';
import { BsPercent, BsCalendar3 } from 'react-icons/bs';

// Styled Components
const ProfileContainer = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? `linear-gradient(135deg, ${props.theme.backgroundColor} 0%, ${props.theme.secondaryColor}08 100%)`
    : `linear-gradient(135deg, ${props.theme.backgroundColor} 0%, rgba(255,255,255,0.9) 100%)`};
  min-height: 100vh;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  
  p {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'};
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const Section = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    transition: all 0.3s ease;
    border-color: ${props => props.theme.secondaryColor}50;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  
  h3 {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
  }
  
  .section-icon {
    color: ${props => props.theme.secondaryColor};
    font-size: 1.3rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'};
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
    border-radius: 8px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'};
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.secondaryColor};
    }
  }
`;

const InputWithIcon = styled.div`
  position: relative;
  
  input {
    padding-left: 2.5rem;
  }
  
  .input-icon {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.secondaryColor};
    font-size: 0.9rem;
  }
`;

const GoalItem = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  .goal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    
    h4 {
      color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }
    
    .goal-actions {
      display: flex;
      gap: 0.5rem;
    }
  }
  
  .goal-progress {
    font-size: 0.8rem;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
  }
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'danger' 
    ? 'rgba(239, 68, 68, 0.1)' 
    : `${props.theme.secondaryColor}15`};
  border: 1px solid ${props => props.variant === 'danger' 
    ? 'rgba(239, 68, 68, 0.3)' 
    : `${props.theme.secondaryColor}30`};
  color: ${props => props.variant === 'danger' ? '#ef4444' : props.theme.secondaryColor};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    background: ${props => props.variant === 'danger' 
      ? 'rgba(239, 68, 68, 0.2)' 
      : `${props.theme.secondaryColor}25`};
  }
`;

const AddGoalButton = styled.button`
  width: 100%;
  background: transparent;
  border: 2px dashed ${props => props.theme.secondaryColor}50;
  color: ${props => props.theme.secondaryColor};
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => `${props.theme.secondaryColor}10`};
    border-color: ${props => props.theme.secondaryColor};
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme.secondaryColor};
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover {
    background: ${props => props.theme.secondaryColor}CC;
    transform: translateY(-1px);
  }
`;

const ProfileSettings = ({ theme }) => {
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  
  const [settings, setSettings] = useState({
    monthlySpendingLimit: 2000,
    savingsGoalPercentage: 20,
    emergencyFundTarget: 10000,
    notificationsEnabled: true
  });

  const [goals, setGoals] = useState([
    { id: 1, name: 'Fondo Emergenza', target: 10000, current: 3500, deadline: '2025-12-31', type: 'savings' },
    { id: 2, name: 'Vacanze Estate', target: 3000, current: 1200, deadline: '2025-06-30', type: 'savings' },
    { id: 3, name: 'Nuovo Laptop', target: 2500, current: 800, deadline: '2025-03-31', type: 'purchase' }
  ]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAddGoal = () => {
    const newGoal = {
      id: Date.now(),
      name: 'Nuovo Obiettivo',
      target: 1000,
      current: 0,
      deadline: '2025-12-31',
      type: 'savings'
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  return (
    <ProfileContainer theme={theme}>
      <ProfileHeader theme={theme}>
        <h1>
          <FaBullseye />
          {language === 'it' ? 'Obiettivi e Limiti' : 'Goals & Limits'}
        </h1>
        <p>
          {language === 'it' 
            ? 'Gestisci i tuoi obiettivi finanziari, limiti di spesa e preferenze personali'
            : 'Manage your financial goals, spending limits and personal preferences'
          }
        </p>
      </ProfileHeader>

      <SectionsGrid>
        {/* Sezione Limiti e Controlli */}
        <Section theme={theme}>
          <SectionHeader theme={theme}>
            <FaExclamationTriangle className="section-icon" />
            <h3>{language === 'it' ? 'Limiti e Controlli' : 'Limits & Controls'}</h3>
          </SectionHeader>
          
          <FormGroup theme={theme}>
            <label>{language === 'it' ? 'Limite spesa mensile (€)' : 'Monthly spending limit (€)'}</label>
            <InputWithIcon theme={theme}>
              <FaEuroSign className="input-icon" />
              <input
                type="number"
                value={settings.monthlySpendingLimit}
                onChange={(e) => handleSettingChange('monthlySpendingLimit', parseInt(e.target.value))}
                min="0"
              />
            </InputWithIcon>
          </FormGroup>

          <FormGroup theme={theme}>
            <label>{language === 'it' ? 'Obiettivo risparmio mensile (%)' : 'Monthly savings goal (%)'}</label>
            <InputWithIcon theme={theme}>
              <BsPercent className="input-icon" />
              <input
                type="number"
                value={settings.savingsGoalPercentage}
                onChange={(e) => handleSettingChange('savingsGoalPercentage', parseInt(e.target.value))}
                min="0"
                max="100"
              />
            </InputWithIcon>
          </FormGroup>

          <FormGroup theme={theme}>
            <label>{language === 'it' ? 'Fondo emergenza target (€)' : 'Emergency fund target (€)'}</label>
            <InputWithIcon theme={theme}>
              <FaEuroSign className="input-icon" />
              <input
                type="number"
                value={settings.emergencyFundTarget}
                onChange={(e) => handleSettingChange('emergencyFundTarget', parseInt(e.target.value))}
                min="0"
              />
            </InputWithIcon>
          </FormGroup>

          <FormGroup theme={theme}>
            <label>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              {language === 'it' ? 'Attiva notifiche per limiti' : 'Enable limit notifications'}
            </label>
          </FormGroup>

          <SaveButton theme={theme}>
            <FaSave />
            {language === 'it' ? 'Salva Impostazioni' : 'Save Settings'}
          </SaveButton>
        </Section>

        {/* Sezione Obiettivi Personalizzati */}
        <Section theme={theme}>
          <SectionHeader theme={theme}>
            <FaBullseye className="section-icon" />
            <h3>{language === 'it' ? 'Obiettivi Personalizzati' : 'Custom Goals'}</h3>
          </SectionHeader>

          {goals.map(goal => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <GoalItem key={goal.id} theme={theme}>
                <div className="goal-header">
                  <h4>{goal.name}</h4>
                  <div className="goal-actions">
                    <ActionButton theme={theme}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton 
                      theme={theme} 
                      variant="danger"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <FaTrash />
                    </ActionButton>
                  </div>
                </div>
                <div className="goal-progress">
                  €{goal.current.toLocaleString()} / €{goal.target.toLocaleString()} ({progress.toFixed(1)}%)
                  <br />
                  Scadenza: {new Date(goal.deadline).toLocaleDateString('it-IT')}
                </div>
              </GoalItem>
            );
          })}

          <AddGoalButton theme={theme} onClick={handleAddGoal}>
            <FaPlus />
            {language === 'it' ? 'Aggiungi Nuovo Obiettivo' : 'Add New Goal'}
          </AddGoalButton>
        </Section>
      </SectionsGrid>
    </ProfileContainer>
  );
};

export default ProfileSettings;