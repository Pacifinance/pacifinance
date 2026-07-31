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
  getEmergencyFundTarget,
  getTotalIncomesCurrentMonth,
  getTotalOutflowsCurrentMonth,
  getEmergencyFund,
  getTotalValue
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

const ControlCard = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.02)'};
  h4 { margin: 0 0 .35rem; color: ${props => props.theme.mode === 'dark' ? '#fff' : '#171717'}; }
  p { margin: 0 0 .85rem; opacity: .7; font-size: .8rem; line-height: 1.45; }
`;

const ThresholdGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .75rem;
  ${FormGroup} { margin: 0; }
  @media (max-width: 520px) { grid-template-columns: 1fr; }
`;

const StatusLine = styled.div`
  margin-top: .8rem;
  padding: .55rem .7rem;
  border-radius: 8px;
  font-size: .78rem;
  background: ${props => props.$ok ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)'};
  color: ${props => props.$ok ? '#10b981' : '#f59e0b'};
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
  const { userService, goalService, investmentService, recurringTransactionService } = useDemoServices();
  
  // Stati per i limiti e controlli
  const [settings, setSettings] = useState({
    monthlySpendingLimit: 2000,
    monthlySpendingLimitEnabled: true,
    expensesLimitPercent: '',
    savingsAmountGoal: '',
    savingsGoalPercentage: 20,
    savingsGoalPercentageEnabled: true,
    emergencyFundTarget: 10000,
    emergencyFundTargetEnabled: true,
    emergencyFundMonths: '',
    fixedExpensesPercent: '',
    categorySpendingLimits: {},
    debtReductionGoal: '',
    positionConcentrationLimit: '',
    assetCategoryConcentrationLimit: '',
    annualPassiveIncomeGoal: '',
    notificationsEnabled: true
  });

  // Stati per gli obiettivi
  const [goals, setGoals] = useState([]);
  const [monthlyTargetInput, setMonthlyTargetInput] = useState('');
  const [monthlyTargetPercentInput, setMonthlyTargetPercentInput] = useState('');
  const [savingMonthlyTarget, setSavingMonthlyTarget] = useState(false);
  const [newCategoryLimit, setNewCategoryLimit] = useState({ name: '', value: '' });
  const [monthlyFixedExpenses, setMonthlyFixedExpenses] = useState(0);
  
  // Stati per il modal di modifica
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [modalGoalData, setModalGoalData] = useState({
    name: '',
    target: 0,
    current: 0,
    deadline: '',
    type: 'savings',
    linkedAssetKey: null,
    targetPercentOfNetWorth: ''
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
        targetPercentOfNetWorth: goal.targetPercentOfNetWorth ?? '',
      })));
    });
  };

  // Carica i dati dal UserContext al montaggio del componente
  useEffect(() => {
    if (userData) {
      // Carica i settings dall'UserContext usando i selector
      setSettings({
        monthlySpendingLimit: fromEUR(getMonthlySpendingLimit(userData)),
        monthlySpendingLimitEnabled: userData?.limits?.monthlySpendingLimitEnabled ?? true,
        expensesLimitPercent: userData?.limits?.expensesLimitPercent ?? '',
        savingsAmountGoal: userData?.limits?.savingsAmountGoal == null ? '' : fromEUR(userData.limits.savingsAmountGoal),
        savingsGoalPercentage: getSavingsGoalPercentage(userData),
        savingsGoalPercentageEnabled: userData?.limits?.savingsGoalPercentageEnabled ?? true,
        emergencyFundTarget: fromEUR(getEmergencyFundTarget(userData)),
        emergencyFundTargetEnabled: userData?.limits?.emergencyFundTargetEnabled ?? true,
        emergencyFundMonths: userData?.limits?.emergencyFundMonths ?? '',
        fixedExpensesPercent: userData?.limits?.fixedExpensesPercent ?? '',
        categorySpendingLimits: Object.fromEntries(Object.entries(userData?.limits?.categorySpendingLimits ?? {}).map(([key, value]) => [key, fromEUR(Number(value))])),
        debtReductionGoal: userData?.limits?.debtReductionGoal == null ? '' : fromEUR(userData.limits.debtReductionGoal),
        positionConcentrationLimit: userData?.limits?.positionConcentrationLimit ?? '',
        assetCategoryConcentrationLimit: userData?.limits?.assetCategoryConcentrationLimit ?? '',
        annualPassiveIncomeGoal: userData?.limits?.annualPassiveIncomeGoal == null ? '' : fromEUR(userData.limits.annualPassiveIncomeGoal),
        notificationsEnabled: true // Questo potrebbe venire dal backend in futuro
      });
    }
  }, [userData, fromEUR]);

  // Carica i goal reali dal backend (indipendente da userData, stesso pattern
  // già usato per holding/conti dettagliati).
  useEffect(() => {
    refreshGoals();
    recurringTransactionService.getRecurring()
      .then((items) => setMonthlyFixedExpenses(items.filter((item) => item.active && item.isExpense).reduce((sum, item) => sum + item.amount, 0)))
      .catch((error) => console.error('GoalsAndLimits: failed to load recurring expenses', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    investmentService.getSettings()
      .then((investmentSettings) => {
        const target = investmentSettings?.monthlyTarget ?? null;
        setMonthlyTargetInput(target == null ? '' : String(fromEUR(target)));
        setMonthlyTargetPercentInput(investmentSettings?.monthlyTargetPercent == null ? '' : String(investmentSettings.monthlyTargetPercent));
      })
      .catch((error) => console.error('GoalsAndLimits: failed to load monthly investment target', error));
  }, [investmentService, fromEUR]);

  const saveMonthlyInvestmentTarget = async () => {
    if (savingMonthlyTarget) return;
    setSavingMonthlyTarget(true);
    try {
      const value = monthlyTargetInput.trim() === '' ? null : toEUR(Number(monthlyTargetInput));
      await investmentService.saveSettings({
        monthly_target: value,
        monthly_target_percent: monthlyTargetPercentInput === '' ? null : Number(monthlyTargetPercentInput),
      });
    } finally {
      setSavingMonthlyTarget(false);
    }
  };


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
      const expensesLimit = settings.monthlySpendingLimitEnabled && settings.monthlySpendingLimit >= 0 ? toEUR(settings.monthlySpendingLimit) : -1;
      const savingsPercent = settings.savingsGoalPercentageEnabled && settings.savingsGoalPercentage >= 0 && settings.savingsGoalPercentage <= 100 ? settings.savingsGoalPercentage : -1;
      const emergencyFundGoal = settings.emergencyFundTargetEnabled && settings.emergencyFundTarget >= 0 ? toEUR(settings.emergencyFundTarget) : -1;

      // Invia i dati al backend
      await userService.saveGoals({
        expenses_limit: expensesLimit,
        savings_percent: savingsPercent,
        emergency_fund_goal: emergencyFundGoal,
        expenses_limit_percent: settings.expensesLimitPercent === '' ? null : Number(settings.expensesLimitPercent),
        savings_amount_goal: settings.savingsAmountGoal === '' ? null : toEUR(Number(settings.savingsAmountGoal)),
        emergency_fund_months: settings.emergencyFundMonths === '' ? null : Number(settings.emergencyFundMonths),
        fixed_expenses_percent: settings.fixedExpensesPercent === '' ? null : Number(settings.fixedExpensesPercent),
        category_spending_limits: Object.fromEntries(Object.entries(settings.categorySpendingLimits).map(([key, value]) => [key, toEUR(Number(value))])),
        debt_reduction_goal: settings.debtReductionGoal === '' ? null : toEUR(Number(settings.debtReductionGoal)),
        position_concentration_limit: settings.positionConcentrationLimit === '' ? null : Number(settings.positionConcentrationLimit),
        asset_category_concentration_limit: settings.assetCategoryConcentrationLimit === '' ? null : Number(settings.assetCategoryConcentrationLimit),
        annual_passive_income_goal: settings.annualPassiveIncomeGoal === '' ? null : toEUR(Number(settings.annualPassiveIncomeGoal)),
      });

      // Aggiorna il UserContext locale
      updateUserContextData({
        limits: {
          ...userData.limits,
          monthlySpendingLimit: expensesLimit !== -1 ? expensesLimit : 2000,
          monthlySpendingLimitEnabled: expensesLimit !== -1,
          savingsGoalPercentage: savingsPercent !== -1 ? savingsPercent : 20,
          savingsGoalPercentageEnabled: savingsPercent !== -1,
          emergencyFundTarget: emergencyFundGoal !== -1 ? emergencyFundGoal : 10000,
          emergencyFundTargetEnabled: emergencyFundGoal !== -1,
          expensesLimitPercent: settings.expensesLimitPercent === '' ? null : Number(settings.expensesLimitPercent),
          savingsAmountGoal: settings.savingsAmountGoal === '' ? null : toEUR(Number(settings.savingsAmountGoal)),
          emergencyFundMonths: settings.emergencyFundMonths === '' ? null : Number(settings.emergencyFundMonths),
          fixedExpensesPercent: settings.fixedExpensesPercent === '' ? null : Number(settings.fixedExpensesPercent),
          categorySpendingLimits: Object.fromEntries(Object.entries(settings.categorySpendingLimits).map(([key, value]) => [key, toEUR(Number(value))])),
          debtReductionGoal: settings.debtReductionGoal === '' ? null : toEUR(Number(settings.debtReductionGoal)),
          positionConcentrationLimit: settings.positionConcentrationLimit === '' ? null : Number(settings.positionConcentrationLimit),
          assetCategoryConcentrationLimit: settings.assetCategoryConcentrationLimit === '' ? null : Number(settings.assetCategoryConcentrationLimit),
          annualPassiveIncomeGoal: settings.annualPassiveIncomeGoal === '' ? null : toEUR(Number(settings.annualPassiveIncomeGoal)),
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
      linkedAssetKey: null,
      targetPercentOfNetWorth: ''
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
        target_percent_of_net_worth: modalGoalData.targetPercentOfNetWorth === '' ? null : Number(modalGoalData.targetPercentOfNetWorth),
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
      linkedAssetKey: null,
      targetPercentOfNetWorth: ''
    });
  };

  const handleModalInputChange = (key, value) => {
    setModalGoalData(prev => ({ ...prev, [key]: value }));
  };

  const controlsT = translations.goals.financialControls;
  const currentIncome = getTotalIncomesCurrentMonth(userData);
  const currentSpending = getTotalOutflowsCurrentMonth(userData);
  const currentSavings = currentIncome - currentSpending;
  const emergencyFundValue = getEmergencyFund(userData);
  const netWorth = getTotalValue(userData);
  const spendingPercent = currentIncome > 0 ? (currentSpending / currentIncome) * 100 : null;
  const savingsPercent = currentIncome > 0 ? (currentSavings / currentIncome) * 100 : null;
  const emergencyMonths = currentSpending > 0 ? emergencyFundValue / currentSpending : null;

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
            <label><input type="checkbox" checked={settings.monthlySpendingLimitEnabled} onChange={(e) => handleSettingChange('monthlySpendingLimitEnabled', e.target.checked)} /> {language === 'it' ? `Limite spesa mensile (${currencySymbol})` : `Monthly spending limit (${currencySymbol})`}</label>
            <InputWithIcon theme={theme}>
              <span className="input-icon">{currencySymbol}</span>
              <input
                type="number"
                value={settings.monthlySpendingLimit}
                onChange={(e) => handleSettingChange('monthlySpendingLimit', parseInt(e.target.value))}
                min="0"
                disabled={!settings.monthlySpendingLimitEnabled}
              />
            </InputWithIcon>
          </FormGroup>

          <FormGroup theme={theme}>
            <label>{controlsT.spendingPercent}</label>
            <InputWithIcon theme={theme}><BsPercent className="input-icon" /><input type="number" min="0" max="100" value={settings.expensesLimitPercent} onChange={(e) => handleSettingChange('expensesLimitPercent', e.target.value)} /></InputWithIcon>
          </FormGroup>
          <StatusLine $ok={(!settings.monthlySpendingLimitEnabled || currentSpending <= toEUR(settings.monthlySpendingLimit)) && (settings.expensesLimitPercent === '' || (spendingPercent !== null && spendingPercent <= Number(settings.expensesLimitPercent)))}>
            {controlsT.currentSpending.replace('{amount}', `${currencySymbol}${fromEUR(currentSpending).toFixed(0)}`).replace('{percent}', spendingPercent === null ? '—' : `${spendingPercent.toFixed(1)}%`)}
          </StatusLine>

          <FormGroup theme={theme}>
            <label><input type="checkbox" checked={settings.savingsGoalPercentageEnabled} onChange={(e) => handleSettingChange('savingsGoalPercentageEnabled', e.target.checked)} /> {language === 'it' ? 'Obiettivo risparmio mensile (%)' : 'Monthly savings goal (%)'}</label>
            <InputWithIcon theme={theme}>
              <BsPercent className="input-icon" />
              <input
                type="number"
                value={settings.savingsGoalPercentage}
                onChange={(e) => handleSettingChange('savingsGoalPercentage', parseInt(e.target.value))}
                min="0"
                max="100"
                disabled={!settings.savingsGoalPercentageEnabled}
              />
            </InputWithIcon>
          </FormGroup>

          <FormGroup theme={theme}>
            <label>{controlsT.savingsAmount}</label>
            <InputWithIcon theme={theme}><span className="input-icon">{currencySymbol}</span><input type="number" min="0" value={settings.savingsAmountGoal} onChange={(e) => handleSettingChange('savingsAmountGoal', e.target.value)} /></InputWithIcon>
          </FormGroup>
          <StatusLine $ok={(settings.savingsAmountGoal === '' || currentSavings >= toEUR(Number(settings.savingsAmountGoal))) && (!settings.savingsGoalPercentageEnabled || (savingsPercent !== null && savingsPercent >= settings.savingsGoalPercentage))}>
            {controlsT.currentSavings.replace('{amount}', `${currencySymbol}${fromEUR(currentSavings).toFixed(0)}`).replace('{percent}', savingsPercent === null ? '—' : `${savingsPercent.toFixed(1)}%`)}
          </StatusLine>

          <FormGroup theme={theme}>
            <label><input type="checkbox" checked={settings.emergencyFundTargetEnabled} onChange={(e) => handleSettingChange('emergencyFundTargetEnabled', e.target.checked)} /> {language === 'it' ? `Fondo emergenza target (${currencySymbol})` : `Emergency fund target (${currencySymbol})`}</label>
            <InputWithIcon theme={theme}>
              <span className="input-icon">{currencySymbol}</span>
              <input
                type="number"
                value={settings.emergencyFundTarget}
                onChange={(e) => handleSettingChange('emergencyFundTarget', parseInt(e.target.value))}
                min="0"
                disabled={!settings.emergencyFundTargetEnabled}
              />
            </InputWithIcon>
          </FormGroup>

          <FormGroup theme={theme}>
            <label>{controlsT.emergencyMonths}</label>
            <input type="number" min="0" step="0.5" value={settings.emergencyFundMonths} onChange={(e) => handleSettingChange('emergencyFundMonths', e.target.value)} />
          </FormGroup>
          <StatusLine $ok={(!settings.emergencyFundTargetEnabled || emergencyFundValue >= toEUR(settings.emergencyFundTarget)) && (settings.emergencyFundMonths === '' || (emergencyMonths !== null && emergencyMonths >= Number(settings.emergencyFundMonths)))}>
            {controlsT.currentEmergency.replace('{amount}', `${currencySymbol}${fromEUR(emergencyFundValue).toFixed(0)}`).replace('{months}', emergencyMonths === null ? '—' : emergencyMonths.toFixed(1))}
          </StatusLine>

          <ControlCard theme={theme}>
            <h4>{controlsT.advancedTitle}</h4><p>{controlsT.advancedHint}</p>
            <ThresholdGrid>
              <FormGroup theme={theme}><label>{controlsT.fixedExpensesPercent}</label><InputWithIcon theme={theme}><BsPercent className="input-icon" /><input type="number" min="0" max="100" value={settings.fixedExpensesPercent} onChange={(e) => handleSettingChange('fixedExpensesPercent', e.target.value)} /></InputWithIcon></FormGroup>
              <FormGroup theme={theme}><label>{controlsT.debtReduction}</label><InputWithIcon theme={theme}><span className="input-icon">{currencySymbol}</span><input type="number" min="0" value={settings.debtReductionGoal} onChange={(e) => handleSettingChange('debtReductionGoal', e.target.value)} /></InputWithIcon></FormGroup>
              <FormGroup theme={theme}><label>{controlsT.positionConcentration}</label><InputWithIcon theme={theme}><BsPercent className="input-icon" /><input type="number" min="0" max="100" value={settings.positionConcentrationLimit} onChange={(e) => handleSettingChange('positionConcentrationLimit', e.target.value)} /></InputWithIcon></FormGroup>
              <FormGroup theme={theme}><label>{controlsT.categoryConcentration}</label><InputWithIcon theme={theme}><BsPercent className="input-icon" /><input type="number" min="0" max="100" value={settings.assetCategoryConcentrationLimit} onChange={(e) => handleSettingChange('assetCategoryConcentrationLimit', e.target.value)} /></InputWithIcon></FormGroup>
              <FormGroup theme={theme}><label>{controlsT.passiveIncome}</label><InputWithIcon theme={theme}><span className="input-icon">{currencySymbol}</span><input type="number" min="0" value={settings.annualPassiveIncomeGoal} onChange={(e) => handleSettingChange('annualPassiveIncomeGoal', e.target.value)} /></InputWithIcon></FormGroup>
            </ThresholdGrid>
            {settings.fixedExpensesPercent !== '' && <StatusLine $ok={currentIncome > 0 && monthlyFixedExpenses / currentIncome * 100 <= Number(settings.fixedExpensesPercent)}>{controlsT.currentFixedExpenses.replace('{percent}', currentIncome > 0 ? `${(monthlyFixedExpenses / currentIncome * 100).toFixed(1)}%` : '—')}</StatusLine>}
            <FormGroup theme={theme}>
              <label>{controlsT.categorySpending}</label>
              {Object.entries(settings.categorySpendingLimits).map(([name, value]) => (
                <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 36px', gap: '.5rem', marginBottom: '.5rem' }}>
                  <input value={name} readOnly aria-label={controlsT.categoryName} />
                  <input type="number" min="0" value={value} onChange={(e) => handleSettingChange('categorySpendingLimits', { ...settings.categorySpendingLimits, [name]: e.target.value })} aria-label={controlsT.categoryAmount} />
                  <ActionButton type="button" variant="danger" theme={theme} onClick={() => { const next = { ...settings.categorySpendingLimits }; delete next[name]; handleSettingChange('categorySpendingLimits', next); }}><FaTrash /></ActionButton>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 36px', gap: '.5rem' }}>
                <input value={newCategoryLimit.name} onChange={(e) => setNewCategoryLimit((current) => ({ ...current, name: e.target.value }))} placeholder={controlsT.categoryName} />
                <input type="number" min="0" value={newCategoryLimit.value} onChange={(e) => setNewCategoryLimit((current) => ({ ...current, value: e.target.value }))} placeholder={controlsT.categoryAmount} />
                <ActionButton type="button" theme={theme} onClick={() => { if (!newCategoryLimit.name.trim() || newCategoryLimit.value === '') return; handleSettingChange('categorySpendingLimits', { ...settings.categorySpendingLimits, [newCategoryLimit.name.trim()]: newCategoryLimit.value }); setNewCategoryLimit({ name: '', value: '' }); }}><FaPlus /></ActionButton>
              </div>
            </FormGroup>
          </ControlCard>

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
          <FormGroup theme={theme}>
            <label>{controlsT.investmentPercent}</label>
            <InputWithIcon theme={theme}><BsPercent className="input-icon" /><input type="number" min="0" max="100" value={monthlyTargetPercentInput} onChange={(event) => setMonthlyTargetPercentInput(event.target.value)} /></InputWithIcon>
          </FormGroup>
          <StatusLine $ok>
            {controlsT.bothRequired}
          </StatusLine>

          <SaveButton theme={theme} onClick={saveMonthlyInvestmentTarget} disabled={savingMonthlyTarget}>
            <FaSave />
            {translations.graphs.statsHoldings.insights.saveButton}
          </SaveButton>
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
            const percentTarget = goal.targetPercentOfNetWorth === '' || goal.targetPercentOfNetWorth == null ? 0 : netWorth * Number(goal.targetPercentOfNetWorth) / 100;
            const effectiveTarget = Math.max(goal.target, percentTarget);
            const progress = effectiveTarget > 0 ? (goal.current / effectiveTarget) * 100 : 0;
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
                  {formatAmount(goal.current)} / {formatAmount(effectiveTarget)} ({progress.toFixed(1)}%)
                  {goal.targetPercentOfNetWorth !== '' && goal.targetPercentOfNetWorth != null && <><br />{controlsT.netWorthRequirement.replace('{percent}', String(goal.targetPercentOfNetWorth)).replace('{amount}', formatAmount(percentTarget))}</>}
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
              <label>{controlsT.customNetWorthPercent}</label>
              <InputWithIcon theme={theme}><BsPercent className="input-icon" /><input type="number" min="0" max="100" value={modalGoalData.targetPercentOfNetWorth} onChange={(e) => handleModalInputChange('targetPercentOfNetWorth', e.target.value)} /></InputWithIcon>
              <small style={{ opacity: 0.65, fontSize: '0.72rem' }}>{controlsT.bothRequired}</small>
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
