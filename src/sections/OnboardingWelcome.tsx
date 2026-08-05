import React, { useContext, useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { ServiceContext } from '../contexts/ServiceContext';
import { getProfileCompletionPercentage } from '../utils/userDataSelectors';
import {
  AccountBalance as BankIcon,
  TrendingUp as InvestIcon,
  Receipt as ExpenseIcon,
  Person as ProfileIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  NotificationsActiveOutlined as ReminderIcon,
} from '@mui/icons-material';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const Container = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
  padding: 1rem;

  @media (max-width: 400px) {
    padding: 0.75rem;
  }

  @media (min-width: 769px) {
    padding: 2rem;
  }
`;

const WelcomeCard = styled.div`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(7, 145, 100, 0.15) 0%, rgba(7, 145, 100, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(7, 145, 100, 0.08) 0%, rgba(7, 145, 100, 0.02) 100%)'};
  border: 1px solid ${props => props.$isDark ? 'rgba(7, 145, 100, 0.3)' : 'rgba(7, 145, 100, 0.2)'};
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;

  @media (max-width: 400px) {
    padding: 1.25rem 1rem;
    border-radius: 16px;
  }

  @media (min-width: 769px) {
    padding: 2.5rem 3rem;
    margin-bottom: 2rem;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: ${props => props.$textColor};
  
  @media (min-width: 769px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${props => props.$subtextColor};
  margin: 0 0 1rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const StepsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StepCard = styled.div`
  animation: ${slideIn} 0.5s ease-out;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: backwards;
  background: ${props => props.$isDark 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.9)'};
  border: 2px solid ${props => props.$isComplete 
    ? 'rgba(7, 145, 100, 0.4)' 
    : props.$isActive 
      ? 'rgba(7, 145, 100, 0.5)'
      : props.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  border-radius: 16px;
  padding: 1.5rem;
  cursor: ${props => props.$isComplete ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: ${props => props.$isComplete ? 'none' : 'translateY(-3px)'};
    border-color: ${props => props.$isComplete ? 'rgba(7, 145, 100, 0.4)' : 'rgba(7, 145, 100, 0.6)'};
    box-shadow: ${props => props.$isComplete ? 'none' : '0 8px 25px rgba(7, 145, 100, 0.15)'};
  }
  
  ${props => props.$isActive && !props.$isComplete && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}

  /* The bonus (reminders) card spans the full row instead of leaving an
     orphaned half-empty row after the 4 numbered steps. */
  ${props => props.$bonus && css`
    @media (min-width: 769px) {
      grid-column: 1 / -1;
    }
  `}
`;

const StepNumber = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  background: ${props => props.$isComplete
    ? '#079164'
    : props.$isDark ? 'rgba(7, 145, 100, 0.2)' : 'rgba(7, 145, 100, 0.1)'};
  color: ${props => props.$isComplete ? 'white' : '#079164'};
  transition: all 0.3s ease;
`;

const BonusTag = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  background: ${props => props.$isComplete
    ? '#079164'
    : props.$isDark ? 'rgba(7, 145, 100, 0.2)' : 'rgba(7, 145, 100, 0.1)'};
  color: ${props => props.$isComplete ? 'white' : '#079164'};
`;

const StepTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.35rem;
  color: ${props => props.$textColor};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StepDescription = styled.p`
  font-size: 0.85rem;
  color: ${props => props.$subtextColor};
  margin: 0;
  line-height: 1.5;
`;

const StepAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #079164;
  opacity: ${props => props.$isComplete ? 0.5 : 1};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: ${props => props.$isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  margin-top: 1.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #079164, #0ab77d);
  width: ${props => props.$progress}%;
  transition: width 0.8s ease;
`;

const QuickTip = styled.div`
  background: ${props => props.$isDark 
    ? 'rgba(59, 130, 246, 0.1)' 
    : 'rgba(59, 130, 246, 0.05)'};
  border: 1px solid ${props => props.$isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'};
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-top: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: ${props => props.$subtextColor};
  line-height: 1.5;
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$subtextColor};
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  margin-top: 1rem;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
  }
`;

const OnboardingWelcome = ({ userData, theme }) => {
  const { translations } = useContext(LanguageContext);
  const { currencySymbol } = useContext(CurrencyContext);
  const services = useContext(ServiceContext);
  const userService = services?.userService;
  const navigate = useLocalizedNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [benchmarkConsent, setBenchmarkConsent] = useState(userData?.benchmarkConsent === true);
  const [isSavingBenchmarkConsent, setIsSavingBenchmarkConsent] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  const t = translations?.onboarding || {};
  const isDark = theme?.mode === 'dark';
  const textColor = theme?.textColor || (isDark ? '#e0e0e0' : '#333');
  const subtextColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';

  // Check dismissed state from localStorage
  useEffect(() => {
    const isDismissed = localStorage.getItem('onboarding_dismissed');
    if (isDismissed === 'true') setDismissed(true);
  }, []);

  // Cheap client-side signal for the "turn on reminders" bonus step — a real
  // preferences check would need an extra API round-trip just for this card.
  useEffect(() => {
    setRemindersEnabled(typeof Notification !== 'undefined' && Notification.permission === 'granted');
  }, []);
  
  if (dismissed) return null;
  
  // Calculate completion steps
  const profileComplete = getProfileCompletionPercentage(userData) > 30;
  const hasBalance = (userData?.balances?.length > 0) && 
    Object.values(userData?.balances?.[0]?.balance || {}).some(v => typeof v === 'number' && v > 0 && v !== userData?.balances?.[0]?.balance?.totalValue);
  const hasOutflows = (userData?.expenses?.allOutflows?.length > 0) && 
    userData.expenses.allOutflows.some(month => Array.isArray(month) && month.length > 0);
  const hasIncomes = (userData?.incomes?.allIncomes?.length > 0) && 
    userData.incomes.allIncomes.some(month => Array.isArray(month) && month.length > 0);
  
  const completedSteps = [profileComplete, hasBalance, hasOutflows, hasIncomes].filter(Boolean).length;
  const progress = (completedSteps / 4) * 100;
  
  // Auto-dismiss if all steps complete
  if (completedSteps === 4) {
    localStorage.setItem('onboarding_dismissed', 'true');
    return null;
  }
  
  // Find the first incomplete step
  const firstIncompleteStep = !profileComplete ? 0 : !hasBalance ? 1 : !hasOutflows ? 2 : 3;
  
  const handleDismiss = () => {
    localStorage.setItem('onboarding_dismissed', 'true');
    setDismissed(true);
  };

  const handleBenchmarkConsent = async () => {
    if (isSavingBenchmarkConsent || !userService?.setBenchmarkConsent) return;
    setIsSavingBenchmarkConsent(true);
    try {
      const result = await userService.setBenchmarkConsent(true);
      setBenchmarkConsent(result?.benchmarkConsent === true);
    } catch {
      // Keep the onboarding card actionable; the profile page exposes retry
      // and the full consent status when the request fails.
    } finally {
      setIsSavingBenchmarkConsent(false);
    }
  };
  
  const steps = [
    {
      icon: <ProfileIcon style={{ fontSize: 20 }} />,
      title: t.step1Title || 'Complete Profile',
      description: t.step1Desc || 'Set nationality, job, and age for personalized comparisons.',
      action: t.step1Action || 'Go to Profile',
      complete: profileComplete,
      onClick: () => navigate('/profile'),
    },
    {
      icon: <BankIcon style={{ fontSize: 20 }} />,
      title: t.step2Title || 'Add Your Balance',
      description: t.step2Desc || `Enter your current assets: bank, cash, investments (${currencySymbol}).`,
      action: t.step2Action || 'Insert Balance',
      complete: hasBalance,
      onClick: () => navigate('/insert-values?section=balance'),
    },
    {
      icon: <ExpenseIcon style={{ fontSize: 20 }} />,
      title: t.step3Title || 'Track Outflows',
      description: t.step3Desc || 'Add your monthly outflows to see where your money goes.',
      action: t.step3Action || 'Add Outflows',
      complete: hasOutflows,
      onClick: () => navigate('/insert-values?section=outflow'),
    },
    {
      icon: <InvestIcon style={{ fontSize: 20 }} />,
      title: t.step4Title || 'Record Income',
      description: t.step4Desc || 'Log your income sources to track savings and growth.',
      action: t.step4Action || 'Add Income',
      complete: hasIncomes,
      onClick: () => navigate('/insert-values?section=income'),
    },
    {
      icon: <ReminderIcon style={{ fontSize: 20 }} />,
      title: t.step5Title || 'Turn on reminders',
      description: t.step5Desc || "Get a gentle nudge when it's time to check in, so your data stays current without you having to remember.",
      action: t.step5Action || 'Enable reminders',
      complete: remindersEnabled,
      bonus: true,
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <Container>
      <WelcomeCard $isDark={isDark}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚀</div>
        <WelcomeTitle $textColor={textColor}>
          {t.welcomeTitle || 'See all your money in one place'}
        </WelcomeTitle>
        <WelcomeSubtitle $subtextColor={subtextColor}>
          {t.welcomeSubtitle || "Most people track their money across five different apps and still don't know their real net worth. Finish the steps below and Pacifinance keeps it updated automatically from here on."}
        </WelcomeSubtitle>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.secondaryColor }}>
            {completedSteps}/4 {t.stepsCompleted || 'completed'}
          </span>
        </div>
        <ProgressBar $isDark={isDark}>
          <ProgressFill $progress={progress} />
        </ProgressBar>
      </WelcomeCard>

      <StepsGrid>
        {steps.map((step, index) => (
          <StepCard
            key={index}
            $isDark={isDark}
            $isComplete={step.complete}
            $isActive={index === firstIncompleteStep}
            $bonus={step.bonus}
            $delay={`${index * 0.1}s`}
            onClick={step.complete ? undefined : step.onClick}
            data-umami-event={`onboarding-step-${index + 1}`}
          >
            {step.bonus ? (
              <BonusTag $isDark={isDark} $isComplete={step.complete}>
                {step.complete ? <CheckIcon style={{ fontSize: 14 }} /> : (t.bonusLabel || 'Bonus')}
              </BonusTag>
            ) : (
              <StepNumber $isDark={isDark} $isComplete={step.complete}>
                {step.complete ? <CheckIcon style={{ fontSize: 18 }} /> : index + 1}
              </StepNumber>
            )}
            <StepTitle $textColor={textColor}>
              {step.icon}
              {step.title}
            </StepTitle>
            <StepDescription $subtextColor={subtextColor}>
              {step.description}
            </StepDescription>
            <StepAction $isComplete={step.complete}>
              {step.complete 
                ? (t.done || '✓ Done')
                : <>{step.action} <ArrowIcon style={{ fontSize: 16 }} /></>
              }
            </StepAction>
          </StepCard>
        ))}
      </StepsGrid>

      <QuickTip $isDark={isDark} $subtextColor={subtextColor}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
        <span>
          {t.quickTip || 'Tip: Start with your balance — once you add at least one month of data, your dashboard will come alive with charts and analytics!'}
        </span>
      </QuickTip>

      {!benchmarkConsent && (
        <QuickTip $isDark={isDark} $subtextColor={subtextColor} style={{ borderColor: theme.secondaryColor, marginTop: '0.75rem' }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📊</span>
          <span style={{ flex: 1 }}>
            <strong style={{ color: textColor, display: 'block', marginBottom: '0.25rem' }}>
              {t.benchmarkTitle || 'Compare with similar users'}
            </strong>
            {t.benchmarkDesc || 'Opt in to receive anonymous benchmarks for net worth, income and outflows. We share aggregated data only, never transactions or notes.'}
            <button
              type="button"
              onClick={handleBenchmarkConsent}
              disabled={isSavingBenchmarkConsent}
              style={{ background: theme.secondaryColor, border: 0, borderRadius: 6, color: '#fff', cursor: 'pointer', display: 'block', fontWeight: 700, marginTop: '0.65rem', padding: '0.5rem 0.75rem' }}
            >
              {isSavingBenchmarkConsent
                ? (t.benchmarkButtonLoading || 'Activating...')
                : (t.benchmarkButton || 'Enable community comparison')}
            </button>
          </span>
        </QuickTip>
      )}
      
      <div style={{ textAlign: 'center' }}>
        <DismissButton 
          $subtextColor={subtextColor}
          onClick={handleDismiss}
          data-umami-event="onboarding-dismiss"
        >
          {t.dismiss || 'Dismiss guide'}
        </DismissButton>
      </div>
    </Container>
  );
};

export default OnboardingWelcome;
