import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { 
  TrendingUp, 
  TrendingDown, 
  Repeat, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ShoppingBag,
  Clock,
  CalendarDays,
  CalendarCheck
} from 'lucide-react';
import languages from '../data/languages.json';
import { getCategoryIcon, getCategoryColor } from '../data/categoryIcons';
import { getAllOutflows, getTotalOutflowsPerCategoryPerMonth } from '../utils/userDataSelectors';

const AnalysisContainer = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 24px;
  padding: 2.5rem;
  margin-top: 2rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 10px 40px rgba(0, 0, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)' 
    : '0 10px 40px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(0, 0, 0, 0.04)'
  };
  backdrop-filter: blur(20px);

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
    color: white;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
  
  p {
    font-size: 1rem;
    color: white;
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
    opacity: 0.8;
  }
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  background: ${props => props.$active 
    ? `linear-gradient(135deg, ${props.theme.buttonBackgroundColor} 0%, ${props.theme.secondaryColor || '#047857'} 100%)`
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(255, 255, 255, 0.8)'
  };
  
  color: ${props => props.$active 
    ? 'white' 
    : props.theme.mode === 'dark' 
      ? 'white' 
      : '#1f2937'
  };
  
  border: 1px solid ${props => props.$active 
    ? 'rgba(255, 255, 255, 0.2)' 
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.08)'
  };
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => !props.$active && (props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'rgba(255, 255, 255, 0.95)'
    )};
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.8rem;
  }
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const OverviewCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.08)'
  };
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 8px 30px rgba(0, 0, 0, 0.3)' 
      : '0 8px 30px rgba(0, 0, 0, 0.1)'
    };
  }
  
  .icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem auto;
    padding: 12px;
    border-radius: 12px;
    background: ${props => `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}20, ${props.theme.buttonBackgroundColor}10)`};
    color: ${props => props.theme.buttonBackgroundColor};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
  }
  
  .label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const CategoryCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.08)'
  };
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 8px 30px rgba(0, 0, 0, 0.3)' 
      : '0 8px 30px rgba(0, 0, 0, 0.1)'
    };
    border-color: ${props => props.theme.buttonBackgroundColor}40;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  .category-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .category-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: white;
    }
    
    .category-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: ${props => props.color};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .category-amount {
    text-align: right;
    
    .amount {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }
    
    .percentage {
      font-size: 0.875rem;
      color: white;
    }
  }
`;

const CategoryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.02)'
  };
  
  .stat-value {
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
`;

const TrendIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  
  ${props => {
    if (props.trend === 'up') return `
      color: #ef4444;
      background: #ef444420;
    `;
    if (props.trend === 'down') return `
      color: #10b981;
      background: #10b98120;
    `;
    return `
      color: ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
      background: ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    `;
  }}
`;

const PaymentMethodsSection = styled.div`
  margin-top: 3rem;
  padding-top: 3rem;
  border-top: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.08)'
  };
`;

const SubscriptionOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const PaymentCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.08)'
  };
  border-radius: 16px;
  padding: 1.5rem;
  
  .payment-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    
    .payment-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: ${props => `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}20, ${props.theme.buttonBackgroundColor}10)`};
      color: ${props => props.theme.buttonBackgroundColor};
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .payment-info {
      .payment-name {
        font-size: 1.125rem;
        font-weight: 600;
        color: white;
        margin-bottom: 0.25rem;
      }
      
      .payment-subtitle {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
`;

const RecurringSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(7, 145, 100, 0.1) 0%, rgba(7, 145, 100, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(7, 145, 100, 0.05) 0%, rgba(7, 145, 100, 0.02) 100%)'
  };
  border: 1px solid ${props => `${props.theme.buttonBackgroundColor}30`};
  
  .recurring-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    
    .recurring-icon {
      color: ${props => props.theme.buttonBackgroundColor};
    }
    
    .recurring-title {
      font-size: 1rem;
      font-weight: 600;
      color: white;
    }
  }
  
  .recurring-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .recurring-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border-radius: 8px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.8)'
    };
    
    .recurring-category {
      font-size: 0.875rem;
      color: white;
    }
    
    .recurring-amount {
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
    }
  }
`;

export default function DetailedOutflowAnalysis({ theme, userData, language = 'it' }) {
  const t = languages[language].graphs.statsOutflows.expenseAnalysis;
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Analisi dati delle uscite
  const expenseAnalysis = useMemo(() => {
    const allOutflows = getAllOutflows(userData);
    const totalOutflowsPerCategoryPerMonth = getTotalOutflowsPerCategoryPerMonth(userData);
    
    if (!allOutflows || allOutflows.length === 0 || !totalOutflowsPerCategoryPerMonth) {
      return null;
    }

    const currentMonth = allOutflows[0] || [];
    const previousMonth = allOutflows[1] || [];
    const last12Months = allOutflows.slice(0, 12) || [];

    // Calcola totali per periodo
    const currentMonthTotal = currentMonth.reduce((sum, expense) => sum + expense.amount, 0);
    const previousMonthTotal = previousMonth.reduce((sum, expense) => sum + expense.amount, 0);
    const last12MonthsTotal = last12Months.flat().reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyAverage = last12MonthsTotal / 12;

    // Analisi per categoria
    const categoryAnalysis = {};
    const currentMonthCategories = totalOutflowsPerCategoryPerMonth[0] || {};

    Object.keys(currentMonthCategories).forEach(category => {
      const currentAmount = currentMonthCategories[category] || 0;
      const previousAmount = totalOutflowsPerCategoryPerMonth[1]?.[category] || 0;
      
      // Calcola media ultimi 12 mesi per questa categoria
      let totalLast12Months = 0;
      let monthsWithData = 0;
      
      for (let i = 0; i < 12; i++) {
        const monthData = totalOutflowsPerCategoryPerMonth[i];
        if (monthData && monthData[category]) {
          totalLast12Months += monthData[category];
          monthsWithData++;
        }
      }
      
      const averageAmount = monthsWithData > 0 ? totalLast12Months / monthsWithData : 0;
      const monthlyChange = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0;
      const averageChange = averageAmount > 0 ? ((currentAmount - averageAmount) / averageAmount) * 100 : 0;
      
      // Conta transazioni per categoria nel mese corrente
      const transactions = currentMonth.filter(outflow => {
        const categoryName = outflow.categoryTag?.translations?.en || 
                           outflow.categoryTag?.label || 
                           'Other';
        return categoryName === category;
      });
      
      categoryAnalysis[category] = {
        currentAmount,
        previousAmount,
        averageAmount,
        monthlyChange,
        averageChange,
        transactionCount: transactions.length,
        avgTransactionAmount: transactions.length > 0 ? currentAmount / transactions.length : 0,
        transactions
      };
    });

    // Analisi metodi di pagamento e tipologie
    const paymentMethods = {};
    const paymentTypologies = {};
    const recurringExpenses = [];
    const subscriptionPayments = {
      total: 0,
      count: 0,
      categories: {}
    };
    
    currentMonth.forEach(outflow => {
      // Estrai correttamente i dati dalla struttura reale
      const paymentType = outflow.paymentType?.translations?.[language] || 
                         outflow.paymentType?.label || 
                         'Unknown';
      const paymentTypeKey = outflow.paymentType?.label || 'unknown';
      
      const category = outflow.categoryTag?.translations?.[language] || 
                      outflow.categoryTag?.label || 
                      'Other';
      const categoryKey = outflow.categoryTag?.label || 'other';
      
      // Analisi metodi di pagamento
      if (!paymentMethods[paymentTypeKey]) {
        paymentMethods[paymentTypeKey] = {
          name: paymentType,
          total: 0,
          count: 0,
          categories: {},
          isSubscription: paymentTypeKey === 'subscription'
        };
      }
      
      paymentMethods[paymentTypeKey].total += outflow.amount;
      paymentMethods[paymentTypeKey].count += 1;
      
      if (!paymentMethods[paymentTypeKey].categories[categoryKey]) {
        paymentMethods[paymentTypeKey].categories[categoryKey] = {
          name: category,
          amount: 0
        };
      }
      paymentMethods[paymentTypeKey].categories[categoryKey].amount += outflow.amount;
      
      // Analisi tipologie di pagamento
      if (!paymentTypologies[paymentTypeKey]) {
        paymentTypologies[paymentTypeKey] = {
          name: paymentType,
          total: 0,
          count: 0,
          categories: {},
          isSubscription: paymentTypeKey === 'subscription'
        };
      }
      
      paymentTypologies[paymentTypeKey].total += outflow.amount;
      paymentTypologies[paymentTypeKey].count += 1;
      
      if (!paymentTypologies[paymentTypeKey].categories[categoryKey]) {
        paymentTypologies[paymentTypeKey].categories[categoryKey] = {
          name: category,
          amount: 0
        };
      }
      paymentTypologies[paymentTypeKey].categories[categoryKey].amount += outflow.amount;
      
      // Analisi abbonamenti
      if (paymentTypeKey === 'subscription') {
        subscriptionPayments.total += outflow.amount;
        subscriptionPayments.count += 1;
        
        if (!subscriptionPayments.categories[categoryKey]) {
          subscriptionPayments.categories[categoryKey] = {
            name: category,
            amount: 0,
            count: 0
          };
        }
        subscriptionPayments.categories[categoryKey].amount += outflow.amount;
        subscriptionPayments.categories[categoryKey].count += 1;
      }
      
      // Identifica potenziali uscite ricorrenti con logica migliorata
      if (outflow.amount > 5) { // Solo uscite significative (soglia ridotta)
        // Cerca spese simili negli ultimi mesi con criteri più flessibili
        const similarOutflows = last12Months.flat().filter(e => {
          const amountMatch = Math.abs(e.amount - outflow.amount) < 2; // Tolleranza di 2€
          const categoryMatch = e.categoryTag?.label === outflow.categoryTag?.label;
          
          // Analisi delle note per trovare pattern simili
          let notesMatch = false;
          if (outflow.notes && e.notes) {
            const currentNotes = outflow.notes.toLowerCase().trim();
            const compareNotes = e.notes.toLowerCase().trim();
            
            // Calcola similarità delle note (almeno 60% di sovrapposizione)
            const words1 = currentNotes.split(/\s+/);
            const words2 = compareNotes.split(/\s+/);
            const commonWords = words1.filter(word => words2.includes(word));
            const similarity = commonWords.length / Math.max(words1.length, words2.length);
            
            notesMatch = similarity > 0.6 || currentNotes === compareNotes;
          }
          
          return amountMatch && categoryMatch && (notesMatch || !outflow.notes);
        });
        
        if (similarOutflows.length >= 1) { // Almeno 2 occorrenze totali
          const existing = recurringExpenses.find(r => 
            Math.abs(r.amount - outflow.amount) < 2 && 
            r.categoryKey === categoryKey &&
            (r.notes === outflow.notes || (!r.notes && !outflow.notes))
          );
          
          if (!existing) {
            recurringExpenses.push({
              category,
              categoryKey,
              amount: outflow.amount,
              frequency: similarOutflows.length + 1,
              paymentType,
              paymentTypeKey,
              notes: outflow.notes || '',
              isSubscription: paymentTypeKey === 'subscription'
            });
          }
        }
      }
    });

    return {
      overview: {
        currentMonthTotal,
        previousMonthTotal,
        monthlyAverage,
        totalTransactions: currentMonth.length,
        monthlyChange: previousMonthTotal > 0 ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0,
        avgChange: monthlyAverage > 0 ? ((currentMonthTotal - monthlyAverage) / monthlyAverage) * 100 : 0
      },
      categories: categoryAnalysis,
      paymentMethods,
      paymentTypologies,
      subscriptionPayments,
      recurringExpenses: recurringExpenses.filter((outflow, index, self) => 
        index === self.findIndex(e => e.category === outflow.category && Math.abs(e.amount - outflow.amount) < 1)
      )
    };
  }, [userData]);

  if (!expenseAnalysis) {
    return (
      <AnalysisContainer theme={theme}>
        <SectionHeader>
          <h2>{t.title}</h2>
          <p>{language === 'it' ? 'Nessun dato disponibile per l\'analisi' : 'No data available for analysis'}</p>
        </SectionHeader>
      </AnalysisContainer>
    );
  }

  const { overview, categories, paymentMethods, paymentTypologies, subscriptionPayments, recurringExpenses } = expenseAnalysis;

  // Crea analisi delle sottoscrizioni
  const subscriptionAnalysis = {
    activeCount: recurringExpenses?.length || 0,
    monthlyTotal: recurringExpenses?.reduce((sum, outflow) => sum + outflow.amount, 0) || 0,
    budgetImpact: overview?.currentMonth?.total ? 
      ((recurringExpenses?.reduce((sum, outflow) => sum + outflow.amount, 0) || 0) / overview.currentMonth.total) * 100 
      : 0
  };

  // Le funzioni getCategoryIcon e getCategoryColor ora vengono importate dal file categoryIcons.js

  const getPaymentIcon = (paymentTypeKey) => {
    switch (paymentTypeKey.toLowerCase()) {
      case 'subscription': return <Repeat size={20} />;
      case 'single payment': case 'single_payment': return <CreditCard size={20} />;
      case 'cash': return <Banknote size={20} />;
      case 'digital': case 'digital_payment': return <Smartphone size={20} />;
      case 'transfer': case 'bank_transfer': return <Repeat size={20} />;
      case 'installment': return <CalendarDays size={20} />;
      default: return <CreditCard size={20} />;
    }
  };

  const getTypologyIcon = (typology) => {
    switch (typology.toLowerCase()) {
      case 'subscription': case 'sottoscrizione': return <Repeat size={20} />;
      case 'one-time': case 'singolo': return <ShoppingBag size={20} />;
      case 'recurring': case 'ricorrente': return <Calendar size={20} />;
      case 'periodic': case 'periodico': return <Clock size={20} />;
      case 'monthly': case 'mensile': return <CalendarDays size={20} />;
      case 'annual': case 'annuale': return <CalendarCheck size={20} />;
      default: return <ShoppingBag size={20} />;
    }
  };

  const getTrendIcon = (change) => {
    if (change > 5) return <ArrowUpRight size={16} />;
    if (change < -5) return <ArrowDownRight size={16} />;
    return <Minus size={16} />;
  };

  const getTrendType = (change) => {
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'neutral';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

    return (
      <AnalysisContainer theme={theme}>
        <SectionHeader>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </SectionHeader>      {/* Overview Cards */}
      <OverviewGrid>
        <OverviewCard theme={theme}>
          <div className="icon">
            <BarChart3 size={24} />
          </div>
          <div className="value">{formatCurrency(overview.currentMonthTotal)}</div>
          <div className="label">{t.currentMonthExpenses}</div>
        </OverviewCard>

        <OverviewCard theme={theme}>
          <div className="icon">
            <Activity size={24} />
          </div>
          <div className="value">{overview.totalTransactions}</div>
          <div className="label">{t.totalTransactions}</div>
        </OverviewCard>

        <OverviewCard theme={theme}>
          <div className="icon">
            <TrendingUp size={24} />
          </div>
          <div className="value">{formatCurrency(overview.monthlyAverage)}</div>
          <div className="label">{t.monthlyAverage12M}</div>
        </OverviewCard>

        <OverviewCard theme={theme}>
          <div className="icon">
            <Target size={24} />
          </div>
          <div className="value">{recurringExpenses.length}</div>
          <div className="label">{t.recurringExpenses}</div>
        </OverviewCard>
      </OverviewGrid>

      {/* Category Analysis */}
      <CategoryGrid>
        {categories && Object.entries(categories)
          .filter(([category, data]) => category && data && typeof data === 'object')
          .sort((a, b) => b[1].currentAmount - a[1].currentAmount)
          .map(([category, data], index) => (
            <CategoryCard key={category} theme={theme}>
              <CategoryHeader color={getCategoryColor(category, index)}>
                <div className="category-info">
                  <div className="category-icon">
                    {React.createElement(getCategoryIcon(category), { size: 20 })}
                  </div>
                  <div>
                    <div className="category-name">
                      {typeof category === 'string' && category ? category : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="category-amount">
                  <div className="amount">{formatCurrency(data.currentAmount)}</div>
                  <div className="percentage">
                    {((data.currentAmount / overview.currentMonthTotal) * 100).toFixed(1)}%
                  </div>
                </div>
              </CategoryHeader>

              <CategoryStats theme={theme}>
                <StatItem theme={theme}>
                  <div className="stat-value">
                    <TrendIndicator 
                      theme={theme} 
                      trend={getTrendType(data.monthlyChange)}
                    >
                      {getTrendIcon(data.monthlyChange)}
                      {formatPercentage(data.monthlyChange)}
                    </TrendIndicator>
                  </div>
                  <div className="stat-label">{t.vsPrevMonth}</div>
                </StatItem>

                <StatItem theme={theme}>
                  <div className="stat-value">
                    <TrendIndicator 
                      theme={theme} 
                      trend={getTrendType(data.averageChange)}
                    >
                      {getTrendIcon(data.averageChange)}
                      {formatPercentage(data.averageChange)}
                    </TrendIndicator>
                  </div>
                  <div className="stat-label">{t.vs12MAvg}</div>
                </StatItem>

                <StatItem theme={theme}>
                  <div className="stat-value">{data.transactionCount}</div>
                  <div className="stat-label">{t.transactions}</div>
                </StatItem>

                <StatItem theme={theme}>
                  <div className="stat-value">{formatCurrency(data.avgTransactionAmount)}</div>
                  <div className="stat-label">{t.avgAmount}</div>
                </StatItem>
              </CategoryStats>
            </CategoryCard>
          ))
        }
      </CategoryGrid>

      {/* Payment Methods Analysis */}
      <PaymentMethodsSection>
        <SectionHeader>
          <h2 style={{ color: 'white' }}>{t.paymentMethodsTitle}</h2>
          <p style={{ color: 'white' }}>{t.paymentMethodsSubtitle}</p>
        </SectionHeader>

        {/* Subscription Overview */}
        <SubscriptionOverview>
          <OverviewCard theme={theme}>
            <div className="icon">
              <Repeat size={24} />
            </div>
            <div className="value">{subscriptionPayments.count}</div>
            <div className="label">{t.activeSubscriptions}</div>
          </OverviewCard>
          <OverviewCard theme={theme}>
            <div className="icon">
              <Calendar size={24} />
            </div>
            <div className="value">{formatCurrency(subscriptionPayments.total)}</div>
            <div className="label">{t.monthlyRecurringSpending}</div>
          </OverviewCard>
          <OverviewCard theme={theme}>
            <div className="icon">
              <Target size={24} />
            </div>
            <div className="value">
              {overview.currentMonthTotal > 0 ? 
                `${((subscriptionPayments.total / overview.currentMonthTotal) * 100).toFixed(1)}%` : 
                '0%'
              }
            </div>
            <div className="label">{t.budgetImpact}</div>
          </OverviewCard>
        </SubscriptionOverview>

        <PaymentGrid>
          {paymentMethods && Object.entries(paymentMethods)
            .filter(([methodKey, data]) => methodKey && data && typeof data === 'object')
            .sort((a, b) => b[1].total - a[1].total)
            .map(([methodKey, data]) => (
              <PaymentCard key={methodKey} theme={theme}>
                <div className="payment-header">
                  <div className="payment-icon">
                    {getPaymentIcon(methodKey)}
                  </div>
                  <div className="payment-info">
                    <div className="payment-name">{data.name || methodKey}</div>
                    <div className="payment-subtitle">
                      {formatCurrency(data.total || 0)} • {data.count || 0} {t.transactions.toLowerCase()}
                    </div>
                  </div>
                </div>

                <CategoryStats theme={theme}>
                  <StatItem theme={theme}>
                    <div className="stat-value">{formatCurrency(data.total)}</div>
                    <div className="stat-label">{t.total}</div>
                  </StatItem>

                  <StatItem theme={theme}>
                    <div className="stat-value">
                      {((data.total / overview.currentMonthTotal) * 100).toFixed(1)}%
                    </div>
                    <div className="stat-label">{t.ofTotal}</div>
                  </StatItem>

                  <StatItem theme={theme}>
                    <div className="stat-value">{formatCurrency(data.total / data.count)}</div>
                    <div className="stat-label">{t.avgAmount}</div>
                  </StatItem>
                </CategoryStats>

                {/* Top categories for this payment method */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: 'white', 
                    marginBottom: '0.5rem' 
                  }}>
                    {t.topCategories}
                  </div>
                  {data.categories && Object.entries(data.categories)
                    .filter(([categoryKey, categoryData]) => categoryKey && categoryData && typeof categoryData.amount === 'number')
                    .sort((a, b) => b[1].amount - a[1].amount)
                    .slice(0, 3)
                    .map(([categoryKey, categoryData]) => (
                      <div 
                        key={categoryKey}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          fontSize: '0.8rem',
                          color: 'white',
                          marginBottom: '0.25rem'
                        }}
                      >
                        <span>{categoryData.name || categoryKey}</span>
                        <span>{formatCurrency(categoryData.amount || 0)}</span>
                      </div>
                    ))
                  }
                </div>
              </PaymentCard>
            ))
          }
        </PaymentGrid>



        {/* Recurring Outflows */}
        {recurringExpenses.length > 0 && (
          <RecurringSection theme={theme}>
            <div className="recurring-header">
              <Repeat className="recurring-icon" size={24} />
              <div className="recurring-title">{t.recurringIdentified}</div>
            </div>
            <div className="recurring-list">
              {recurringExpenses
                .sort((a, b) => b.amount - a.amount)
                .map((outflow, index) => (
                  <div key={index} className="recurring-item">
                    <div className="recurring-category">
                      {outflow.category} • {outflow.paymentType} • {outflow.frequency} {t.times}
                      {outflow.notes && (
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                          "{outflow.notes}"
                        </div>
                      )}
                    </div>
                    <div className="recurring-amount">
                      {formatCurrency(outflow.amount)}
                      {outflow.isSubscription && (
                        <div style={{ fontSize: '0.7rem', color: theme.buttonBackgroundColor }}>
                          🔄 {t.subscription}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{ 
              marginTop: '1rem', 
              fontSize: '0.875rem', 
              color: 'white',
              textAlign: 'center'
            }}>
              {t.totalMonthlyRecurring} {formatCurrency(recurringExpenses.reduce((sum, e) => sum + e.amount, 0))}
            </div>
          </RecurringSection>
        )}
      </PaymentMethodsSection>
    </AnalysisContainer>
  );
}