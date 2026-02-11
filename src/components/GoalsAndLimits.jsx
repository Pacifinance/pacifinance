import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { UserContext } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import {
  getMonthlySpendingLimit,
  getSavingsGoalPercentage,
  getEmergencyFundTarget
} from '../utils/userDataSelectors';
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  backdrop-filter: blur(10px);
  
  h3 {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  background: transparent;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  }
`;

const ProfileSettings = ({ theme }) => {
  const { language } = useContext(LanguageContext);
  useContext(MediaQueryContext);
  const { userData, setUserData } = useContext(UserContext);
  const { showSuccess, showError } = useToast();
  
  // Stati per i limiti e controlli
  const [settings, setSettings] = useState({
    monthlySpendingLimit: 2000,
    savingsGoalPercentage: 20,
    emergencyFundTarget: 10000,
    notificationsEnabled: true
  });

  // Stati per gli obiettivi
  const [goals, setGoals] = useState([]);
  
  // Stati per il modal di modifica
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [modalGoalData, setModalGoalData] = useState({
    name: '',
    target: 0,
    current: 0,
    deadline: '',
    type: 'savings'
  });

  // Carica i dati dal UserContext al montaggio del componente
  useEffect(() => {
    if (userData) {
      // Carica i settings dall'UserContext usando i selector
      setSettings({
        monthlySpendingLimit: getMonthlySpendingLimit(userData),
        savingsGoalPercentage: getSavingsGoalPercentage(userData),
        emergencyFundTarget: getEmergencyFundTarget(userData),
        notificationsEnabled: true // Questo potrebbe venire dal backend in futuro
      });
      
      // Carica i goals
      setGoals(userData.goals || []);
    }
  }, [userData]);

  // Funzione per aggiornare i dati nel UserContext (preparazione per DB)
  const updateUserContextData = (newData) => {
    setUserData(prev => ({
      ...prev,
      ...newData
    }));
    // TODO: Quando il backend sarà pronto, qui andrà chiamata l'API per salvare nel DB
    // await axios.post('/user/updateGoalsAndLimits', newData, { withCredentials: true });
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const handleSaveSettings = async () => {
    try {
      // Prepara i dati per il backend con validazione
      const expensesLimit = (settings.monthlySpendingLimit >= 0) ? settings.monthlySpendingLimit : -1;
      const savingsPercent = (settings.savingsGoalPercentage >= 0 && settings.savingsGoalPercentage <= 100) ? settings.savingsGoalPercentage : -1;
      const emergencyFundGoal = (settings.emergencyFundTarget >= 0) ? settings.emergencyFundTarget : -1;

      // Invia i dati al backend
      await axios.post('/user/goals', {
        expenses_limit: expensesLimit,
        savings_percent: savingsPercent,
        emergency_fund_goal: emergencyFundGoal
      }, { withCredentials: true });

      // Aggiorna il UserContext locale
      updateUserContextData({
        limits: {
          ...userData.limits,
          monthlySpendingLimit: expensesLimit !== -1 ? expensesLimit : 2000,
          savingsGoalPercentage: savingsPercent !== -1 ? savingsPercent : 20,
          emergencyFundTarget: emergencyFundGoal !== -1 ? emergencyFundGoal : 10000,
          notificationsEnabled: settings.notificationsEnabled
        }
      });

      // Mostra messaggio di successo
      showSuccess(language === 'it' ? 'Impostazioni salvate con successo!' : 'Settings saved successfully!');
    } catch (error) {
      console.error('Errore nel salvataggio delle impostazioni:', error);
      showError(language === 'it' ? 'Errore nel salvataggio delle impostazioni' : 'Error saving settings');
    }
  };

  const handleAddGoal = () => {
    const newGoal = {
      id: Date.now(),
      name: language === 'it' ? 'Nuovo Obiettivo' : 'New Goal',
      target: 1000,
      current: 0,
      deadline: '2025-12-31',
      type: 'savings'
    };
    setModalGoalData(newGoal);
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = (goalId) => {
    const newGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(newGoals);
    updateUserContextData({ goals: newGoals });
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setModalGoalData({ ...goal });
    setIsModalOpen(true);
  };

  const handleSaveGoal = () => {
    let newGoals;
    if (editingGoal) {
      // Modifica obiettivo esistente
      newGoals = goals.map(goal => 
        goal.id === editingGoal.id ? modalGoalData : goal
      );
    } else {
      // Nuovo obiettivo - assicurati che abbia un ID unico
      const goalWithId = { ...modalGoalData, id: modalGoalData.id || Date.now() };
      newGoals = [...goals, goalWithId];
    }
    
    setGoals(newGoals);
    updateUserContextData({ goals: newGoals });
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setModalGoalData({
      name: '',
      target: 0,
      current: 0,
      deadline: '',
      type: 'savings'
    });
  };

  const handleModalInputChange = (key, value) => {
    setModalGoalData(prev => ({ ...prev, [key]: value }));
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

          <SaveButton theme={theme} onClick={handleSaveSettings}>
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
                    <ActionButton theme={theme} onClick={() => handleEditGoal(goal)}>
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

      {/* Modal per modifica obiettivo */}
      {isModalOpen && (
        <Modal onClick={closeModal}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingGoal 
                ? (language === 'it' ? 'Modifica Obiettivo' : 'Edit Goal')
                : (language === 'it' ? 'Nuovo Obiettivo' : 'New Goal')
              }
            </h3>
            
            <FormGroup theme={theme}>
              <label>{language === 'it' ? 'Nome obiettivo' : 'Goal name'}</label>
              <input
                type="text"
                value={modalGoalData.name}
                onChange={(e) => handleModalInputChange('name', e.target.value)}
                placeholder={language === 'it' ? 'Es. Fondo emergenza' : 'Ex. Emergency fund'}
              />
            </FormGroup>

            <FormGroup theme={theme}>
              <label>{language === 'it' ? 'Importo target (€)' : 'Target amount (€)'}</label>
              <InputWithIcon theme={theme}>
                <FaEuroSign className="input-icon" />
                <input
                  type="number"
                  value={modalGoalData.target}
                  onChange={(e) => handleModalInputChange('target', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </InputWithIcon>
            </FormGroup>

            <FormGroup theme={theme}>
              <label>{language === 'it' ? 'Importo attuale (€)' : 'Current amount (€)'}</label>
              <InputWithIcon theme={theme}>
                <FaEuroSign className="input-icon" />
                <input
                  type="number"
                  value={modalGoalData.current}
                  onChange={(e) => handleModalInputChange('current', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </InputWithIcon>
            </FormGroup>

            <FormGroup theme={theme}>
              <label>{language === 'it' ? 'Data scadenza' : 'Deadline'}</label>
              <InputWithIcon theme={theme}>
                <BsCalendar3 className="input-icon" />
                <input
                  type="date"
                  value={modalGoalData.deadline}
                  onChange={(e) => handleModalInputChange('deadline', e.target.value)}
                />
              </InputWithIcon>
            </FormGroup>

            <FormGroup theme={theme}>
              <label>{language === 'it' ? 'Tipo obiettivo' : 'Goal type'}</label>
              <select
                value={modalGoalData.type}
                onChange={(e) => handleModalInputChange('type', e.target.value)}
              >
                <option value="savings">{language === 'it' ? 'Risparmio' : 'Savings'}</option>
                <option value="purchase">{language === 'it' ? 'Acquisto' : 'Purchase'}</option>
                <option value="investment">{language === 'it' ? 'Investimento' : 'Investment'}</option>
                <option value="debt">{language === 'it' ? 'Pagamento debito' : 'Debt payment'}</option>
              </select>
            </FormGroup>

            <ModalActions>
              <CancelButton theme={theme} onClick={closeModal}>
                {language === 'it' ? 'Annulla' : 'Cancel'}
              </CancelButton>
              <SaveButton theme={theme} onClick={handleSaveGoal}>
                <FaSave />
                {language === 'it' ? 'Salva' : 'Save'}
              </SaveButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </ProfileContainer>
  );
};

export default ProfileSettings;