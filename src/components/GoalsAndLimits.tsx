import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { useDemoServices } from '../hooks/useDemoServices';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
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
    FaBell
} from 'react-icons/fa';
import { BsPercent, BsCalendar3 } from 'react-icons/bs';
import { ASSET_KEYS } from '../constants/balanceSchema';
import { computeMonthlyContributionSeries } from '../utils/investmentAnalytics';

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

const MonthlyProgressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1rem;
  max-height: 220px;
  overflow-y: auto;
`;

const MonthlyProgressRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.85;
  .hit { color: #10b981; font-weight: 700; }
  .miss { color: #ef4444; font-weight: 700; }
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
    color-scheme: ${props => props.theme.mode === 'dark' ? 'dark' : 'light'};
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.secondaryColor};
    }
  }

  select option {
    background: ${props => props.theme.mode === 'dark' ? '#1f2937' : '#ffffff'};
    color: ${props => props.theme.mode === 'dark' ? '#f8fafc' : '#111827'};
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

const LinkedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin-left: 0.5rem;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  background: ${props => props.theme.secondaryColor}18;
  color: ${props => props.theme.secondaryColor};
  vertical-align: middle;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'};
  border: 1px dashed ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.14)'};
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.62)'};

  .empty-icon {
    color: ${props => props.theme.secondaryColor};
    font-size: 1.4rem;
    opacity: 0.85;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.5;
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
  z-index: 11000;
  backdrop-filter: blur(5px);
  padding: 1rem;
  box-sizing: border-box;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  
  h3 {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
    margin-bottom: 1.5rem;
    text-align: center;
  }

  @media (max-width: 768px) {
    border-radius: 12px;
    padding: 1.25rem;
    width: 100%;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;

  @media (max-width: 768px) {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(30,30,30,0.98)' : 'rgba(255,255,255,0.98)'};
    bottom: 0;
    margin: 1.5rem -1.25rem -1.25rem;
    padding: 0.85rem 1.25rem calc(0.85rem + env(safe-area-inset-bottom, 0px));
    position: sticky;
  }
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

  @media (max-width: 420px) {
    padding: 0.75rem 1.1rem;
  }
`;

const ProfileSettings = ({ theme }) => {
  const { language, translations } = useContext(LanguageContext);
  const { currencySymbol, formatAmount, toEUR, fromEUR } = useContext(CurrencyContext);
  useContext(MediaQueryContext);
  const { userData, setUserData } = useContext(UserContext);
  const { showSuccess, showError } = useToast();
  const { userService, goalService, investmentService } = useDemoServices();
  
  // Stati per i limiti e controlli
  const [settings, setSettings] = useState({
    monthlySpendingLimit: 2000,
    savingsGoalPercentage: 20,
    emergencyFundTarget: 10000,
    notificationsEnabled: true
  });

  // Stati per gli obiettivi
  const [goals, setGoals] = useState([]);
  const [monthlyInvestmentTarget, setMonthlyInvestmentTarget] = useState(null);
  const [monthlyTargetInput, setMonthlyTargetInput] = useState('');
  const [investmentHistory, setInvestmentHistory] = useState([]);
  const [savingMonthlyTarget, setSavingMonthlyTarget] = useState(false);
  
  // Stati per il modal di modifica
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [modalGoalData, setModalGoalData] = useState({
    name: '',
    target: 0,
    current: 0,
    deadline: '',
    type: 'savings',
    linkedAssetKey: null
  });

  const refreshGoals = () => {
    goalService.getGoals().then((fetched) => {
      setGoals((fetched || []).map((goal) => ({
        id: goal.id,
        name: goal.name,
        type: goal.goalType,
        current: goal.currentValue,
        target: goal.targetValue,
        deadline: goal.deadline || '',
        linkedAssetKey: goal.linkedAssetKey,
      })));
    });
  };

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
    }
  }, [userData]);

  // Carica i goal reali dal backend (indipendente da userData, stesso pattern
  // già usato per holding/conti dettagliati).
  useEffect(() => {
    refreshGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Promise.all([investmentService.getSettings(), investmentService.getHoldingHistory()])
      .then(([investmentSettings, history]) => {
        const target = investmentSettings?.monthlyTarget ?? null;
        setMonthlyInvestmentTarget(target);
        setMonthlyTargetInput(target == null ? '' : String(fromEUR(target)));
        setInvestmentHistory(Array.isArray(history) ? history : []);
      })
      .catch((error) => console.error('GoalsAndLimits: failed to load monthly investment target', error));
  }, [investmentService, fromEUR]);

  const saveMonthlyInvestmentTarget = async () => {
    if (savingMonthlyTarget) return;
    setSavingMonthlyTarget(true);
    try {
      const value = monthlyTargetInput.trim() === '' ? null : toEUR(Number(monthlyTargetInput));
      const saved = await investmentService.saveSettings({ monthly_target: value });
      setMonthlyInvestmentTarget(saved?.monthlyTarget ?? null);
    } finally {
      setSavingMonthlyTarget(false);
    }
  };

  const monthlyContributionSeries = computeMonthlyContributionSeries(investmentHistory, null);

  // Aggiorna i "limits" (expenses_limit/savings_percent/emergency_fund_goal) nel
  // UserContext locale dopo il salvataggio — invariato, non riguarda i goals.
  const updateUserContextData = (newData) => {
    setUserData(prev => ({
      ...prev,
      ...newData
    }));
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
      await userService.saveGoals({
        expenses_limit: expensesLimit,
        savings_percent: savingsPercent,
        emergency_fund_goal: emergencyFundGoal
      });

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
      id: null,
      name: language === 'it' ? 'Nuovo Obiettivo' : 'New Goal',
      target: 1000,
      current: 0,
      deadline: '2026-12-31',
      type: 'savings',
      linkedAssetKey: null
    };
    setModalGoalData(newGoal);
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await goalService.deleteGoal({ id: goalId });
      refreshGoals();
    } catch (error) {
      console.error('Errore eliminazione obiettivo:', error);
      showError(language === 'it' ? 'Errore nell\'eliminazione dell\'obiettivo' : 'Error deleting goal');
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setModalGoalData({ ...goal });
    setIsModalOpen(true);
  };

  const handleSaveGoal = async () => {
    try {
      await goalService.saveGoal({
        id: editingGoal ? editingGoal.id : undefined,
        name: modalGoalData.name,
        goal_type: modalGoalData.type,
        target_value: Number(modalGoalData.target) || 0,
        current_value: modalGoalData.linkedAssetKey ? 0 : (Number(modalGoalData.current) || 0),
        linked_asset_key: modalGoalData.linkedAssetKey || null,
        deadline: modalGoalData.deadline || null,
      });
      refreshGoals();
      closeModal();
    } catch (error) {
      console.error('Errore salvataggio obiettivo:', error);
      showError(language === 'it' ? 'Errore nel salvataggio dell\'obiettivo' : 'Error saving goal');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setModalGoalData({
      name: '',
      target: 0,
      current: 0,
      deadline: '',
      type: 'savings',
      linkedAssetKey: null
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
            <label>{language === 'it' ? `Limite spesa mensile (${currencySymbol})` : `Monthly spending limit (${currencySymbol})`}</label>
            <InputWithIcon theme={theme}>
              <span className="input-icon">{currencySymbol}</span>
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
            <label>{language === 'it' ? `Fondo emergenza target (${currencySymbol})` : `Emergency fund target (${currencySymbol})`}</label>
            <InputWithIcon theme={theme}>
              <span className="input-icon">{currencySymbol}</span>
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

        <Section id="monthly-investment-target" theme={theme}>
          <SectionHeader theme={theme}>
            <FaChartLine className="section-icon" />
            <h3>{translations.graphs.statsHoldings.insights.monthlyTargetTitle}</h3>
          </SectionHeader>
          <FormGroup theme={theme}>
            <label>{translations.graphs.statsHoldings.insights.monthlyTargetHint}</label>
            <InputWithIcon theme={theme}>
              <span className="input-icon">{currencySymbol}</span>
              <input
                type="number"
                min="0"
                value={monthlyTargetInput}
                onChange={(event) => setMonthlyTargetInput(event.target.value)}
                placeholder={translations.graphs.statsHoldings.insights.monthlyTargetPlaceholder}
              />
            </InputWithIcon>
          </FormGroup>
          <SaveButton theme={theme} onClick={saveMonthlyInvestmentTarget} disabled={savingMonthlyTarget}>
            <FaSave />
            {translations.graphs.statsHoldings.insights.saveButton}
          </SaveButton>
          {monthlyInvestmentTarget != null && monthlyContributionSeries.length > 0 && (
            <MonthlyProgressList>
              {monthlyContributionSeries.slice(-12).reverse().map((point) => {
                const hit = point.amount >= monthlyInvestmentTarget;
                const [year, month] = point.month.split('-').map(Number);
                const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
                  language === 'it' ? 'it-IT' : 'en-US',
                  { month: 'short', year: 'numeric', timeZone: 'UTC' }
                );
                return (
                  <MonthlyProgressRow key={point.month} theme={theme}>
                    <span>{monthLabel}</span>
                    <span className={hit ? 'hit' : 'miss'}>{formatAmount(point.amount)} {hit ? '✓' : '✗'}</span>
                  </MonthlyProgressRow>
                );
              })}
            </MonthlyProgressList>
          )}
        </Section>

        {/* Sezione Obiettivi Personalizzati */}
        <Section theme={theme}>
          <SectionHeader theme={theme}>
            <FaBullseye className="section-icon" />
            <h3>{language === 'it' ? 'Obiettivi Personalizzati' : 'Custom Goals'}</h3>
          </SectionHeader>
          {goals.length === 0 && (
            <EmptyState theme={theme}>
              <FaBullseye className="empty-icon" />
              <p>{language === 'it' ? 'Non hai ancora obiettivi personalizzati.' : 'You don\'t have any custom goals yet.'}</p>
            </EmptyState>
          )}
          {goals.map(goal => {
            const progress = (goal.current / goal.target) * 100;
            const deadlineLabel = goal.deadline
              ? new Date(goal.deadline).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')
              : (language === 'it' ? 'Nessuna scadenza' : 'No deadline');
            return (
              <GoalItem key={goal.id} theme={theme}>
                <div className="goal-header">
                  <h4>
                    {goal.name}
                    {goal.linkedAssetKey && (
                      <LinkedBadge theme={theme} title={translations?.goals?.linkedHint}>
                        🔗 {translations?.assets?.[goal.linkedAssetKey] || goal.linkedAssetKey}
                      </LinkedBadge>
                    )}
                  </h4>
                  <div className="goal-actions">
                    <ActionButton theme={theme} onClick={() => handleEditGoal(goal)}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton theme={theme} variant="danger" onClick={() => handleDeleteGoal(goal.id)}>
                      <FaTrash />
                    </ActionButton>
                  </div>
                </div>
                <div className="goal-progress">
                  {currencySymbol}{goal.current.toLocaleString()} / {currencySymbol}{goal.target.toLocaleString()} ({progress.toFixed(1)}%)
                  <br />
                  {language === 'it' ? 'Scadenza' : 'Deadline'}: {deadlineLabel}
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
              <label>{translations?.goals?.sourceLabel || (language === 'it' ? 'Origine del valore' : 'Value source')}</label>
              <select
                value={modalGoalData.linkedAssetKey || ''}
                onChange={(e) => handleModalInputChange('linkedAssetKey', e.target.value || null)}
              >
                <option value="">{translations?.goals?.manualOption || (language === 'it' ? 'Manuale' : 'Manual')}</option>
                {ASSET_KEYS.map((key) => (
                  <option key={key} value={key}>{translations?.assets?.[key] || key}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup theme={theme}>
              <label>{language === 'it' ? `Importo target (${currencySymbol})` : `Target amount (${currencySymbol})`}</label>
              <InputWithIcon theme={theme}>
                <span className="input-icon">{currencySymbol}</span>
                <input
                  type="number"
                  value={modalGoalData.target}
                  onChange={(e) => handleModalInputChange('target', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </InputWithIcon>
            </FormGroup>

            <FormGroup theme={theme}>
              <label>{language === 'it' ? `Importo attuale (${currencySymbol})` : `Current amount (${currencySymbol})`}</label>
              <InputWithIcon theme={theme}>
                <span className="input-icon">{currencySymbol}</span>
                <input
                  type="number"
                  value={modalGoalData.current}
                  onChange={(e) => handleModalInputChange('current', parseInt(e.target.value) || 0)}
                  min="0"
                  disabled={Boolean(modalGoalData.linkedAssetKey)}
                  readOnly={Boolean(modalGoalData.linkedAssetKey)}
                />
              </InputWithIcon>
              {modalGoalData.linkedAssetKey && (
                <small style={{ opacity: 0.65, fontSize: '0.72rem' }}>
                  {translations?.goals?.linkedCurrentHint
                    || (language === 'it'
                      ? 'Calcolato automaticamente dal saldo attuale — non modificabile.'
                      : 'Calculated automatically from the current balance — not editable.')}
                </small>
              )}
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

            <ModalActions theme={theme}>
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
