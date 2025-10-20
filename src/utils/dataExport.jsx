import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { getIncomesArray, getOutflowsArray } from './userDataSelectors';

// Funzione per filtrare i dati in base alle opzioni selezionate
function filterDataByDateRange(data, filterOptions) {
  if (!filterOptions || filterOptions.type === 'all') {
    return { ...data, isFiltered: false, filterInfo: null };
  }

  const now = new Date();
  let filteredData = { ...data };
  let filterInfo = {};

  if (filterOptions.type === 'last12') {
    // Filtra gli ultimi 12 mesi
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    filterInfo = {
      type: 'last12',
      startDate: twelveMonthsAgo.toLocaleDateString(),
      endDate: now.toLocaleDateString()
    };

    // Filtra bilanci
    if (data.balances) {
      filteredData.balances = data.balances.filter(balance => {
        const balanceDate = new Date(balance.date || balance.userDate);
        return balanceDate >= twelveMonthsAgo;
      });
    }

    // Filtra transazioni income
    if (data.detailedIncomes) {
      filteredData.detailedIncomes = data.detailedIncomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= twelveMonthsAgo;
      });
    }

    // Filtra transazioni expense
    if (data.detailedOutflows) {
      filteredData.detailedOutflows = data.detailedOutflows.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= twelveMonthsAgo;
      });
    }

  } else if (filterOptions.type === 'specific' && filterOptions.month && filterOptions.year) {
    // Filtra per mese e anno specifico
    const targetMonth = filterOptions.month - 1; // JS months are 0-based
    const targetYear = filterOptions.year;

    filterInfo = {
      type: 'specific',
      month: filterOptions.month,
      year: filterOptions.year,
      monthName: new Date(targetYear, targetMonth).toLocaleDateString('en', { month: 'long', year: 'numeric' })
    };

    // Filtra bilanci per il mese specifico
    if (data.balances) {
      filteredData.balances = data.balances.filter(balance => {
        const balanceDate = new Date(balance.date || balance.userDate);
        return balanceDate.getMonth() === targetMonth && balanceDate.getFullYear() === targetYear;
      });
    }

    // Filtra transazioni income
    if (data.detailedIncomes) {
      filteredData.detailedIncomes = data.detailedIncomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === targetMonth && incomeDate.getFullYear() === targetYear;
      });
    }

    // Filtra transazioni expense
    if (data.detailedOutflows) {
      filteredData.detailedOutflows = data.detailedOutflows.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === targetMonth && expenseDate.getFullYear() === targetYear;
      });
    }

    // Ricalcola le statistiche delle categorie per il mese specifico
    const categoryStats = {};
    filteredData.detailedOutflows.forEach(expense => {
      const category = expense.category || 'Other';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, count: 0 };
      }
      categoryStats[category].total += parseFloat(expense.amount || 0);
      categoryStats[category].count += 1;
    });

    filteredData.categoryExpenses = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      totalAmount: Number(stats.total).toFixed(2),
      transactionCount: stats.count,
      averageAmount: Number(stats.total / stats.count || 0).toFixed(2)
    }));
  }

  // Aggiorna le informazioni di filtro
  filteredData.isFiltered = true;
  filteredData.filterInfo = filterInfo;

  return filteredData;
}

// Funzione principale per preparare i dati per l'export
export function prepareUserDataForExport(userData, language = 'en', filterOptions = null) {
  // Controllo di sicurezza iniziale
  console.log('prepareUserDataForExport called with:', {
    userData: userData ? 'present' : 'null',
    userDataType: typeof userData,
    language
  });

  if (!userData || typeof userData !== 'object') {
    console.log('Invalid userData, returning default structure');
    return {
      userInfo: {
        userId: 'N/A',
        creationDate: 'N/A',
        country: 'N/A',
        job: 'N/A',
        jobType: 'N/A',
        jobCountry: 'N/A',
        workTime: 'N/A',
        remoteType: 'N/A'
      },
      balances: [],
      monthlyData: { incomes: [], outflows: [], outflowsByCategory: [] },
      detailedBalances: [],
      detailedIncomes: [],
      detailedOutflows: [],
      categoryExpenses: [],
      demographics: {}
    };
  }
  
  // Rileva se è un utente mock - controlla diversi indicatori
  const isMockUser = userData?.userId === 'dev-user-123' || 
                     userData?.userType === 'premium' || 
                     userData?.username === 'Developer User' ||
                     (userData?.userId && userData.userId.startsWith('dev-'));
  
  console.log('Export Debug:', {
    isMockUser,
    userId: userData?.userId,
    userType: userData?.userType,
    username: userData?.username,
    hasBalances: userData?.balances ? Array.isArray(userData.balances) : false,
    hasExpenses: userData?.expenses ? Array.isArray(userData.expenses) : false,
    hasLast12Months: userData?.last12MonthsData ? Array.isArray(userData.last12MonthsData) : false,
    isApiData: userData?.user && userData?.balances && userData?.expenses && !userData?.userType
  });

  // Gestisce i dati dall'API /user/alldata
  if (userData?.user && userData?.balances && userData?.expenses) {
    // Dati dall'API - processa direttamente senza ricorsione
    
    const userInfo = {
      userId: userData.user.userId || 'N/A',
      creationDate: userData.user.creationDate ? new Date(userData.user.creationDate).toLocaleDateString() : 'N/A',
      country: typeof userData.user.country === 'object' ? (userData.user.country?.name || userData.user.country?.code || 'N/A') : (userData.user.country || 'N/A'),
      job: typeof userData.user.job === 'object' ? (userData.user.job?.name || userData.user.job?.title || 'N/A') : (userData.user.job || 'N/A'),
      jobType: typeof userData.user.jobType === 'object' ? (userData.user.jobType?.name || userData.user.jobType?.type || 'N/A') : (userData.user.jobType || 'N/A'),
      jobCountry: typeof userData.user.jobCountry === 'object' ? (userData.user.jobCountry?.name || userData.user.jobCountry?.code || 'N/A') : (userData.user.jobCountry || 'N/A'),
      workTime: typeof userData.user.workTime === 'object' ? (userData.user.workTime?.name || userData.user.workTime?.type || 'N/A') : (userData.user.workTime || 'N/A'),
      remoteType: typeof userData.user.remoteType === 'object' ? (userData.user.remoteType?.name || userData.user.remoteType?.type || 'N/A') : (userData.user.remoteType || 'N/A'),
      userType: 'real'
    };

    // Processa i bilanci con calcolo del totale
    const balances = Array.isArray(userData.balances) ? userData.balances.map((balance, index) => {
      const total = (balance.bank || 0) + (balance.cash || 0) + (balance.digitalServices || 0) + 
                   (balance.stocks || 0) + (balance.etf || 0) + (balance.bitcoin || 0) + (balance.crypto || 0);
      
      return {
        month: `Month ${index + 1}`,
        date: new Date(balance.date).toLocaleDateString(),
        userDate: new Date(balance.userDate).toLocaleDateString(),
        bank: Number(balance.bank || 0).toFixed(2),
        cash: Number(balance.cash || 0).toFixed(2),
        digitalServices: Number(balance.digitalServices || 0).toFixed(2),
        stocks: Number(balance.stocks || 0).toFixed(2),
        etf: Number(balance.etf || 0).toFixed(2),
        bitcoin: Number(balance.bitcoin || 0).toFixed(2),
        crypto: Number(balance.crypto || 0).toFixed(2),
        total: Number(total).toFixed(2)
      };
    }) : [];

    // Processa le spese/entrate
    const expenses = Array.isArray(userData.expenses) ? userData.expenses.map((expense, index) => ({
      id: index + 1,
      date: new Date(expense.date).toLocaleDateString(),
      amount: Number(expense.amount || 0).toFixed(2),
      type: expense.isExpense ? 'Expense' : 'Income',
      isExpense: expense.isExpense ? 'Yes' : 'No',
      notes: expense.notes || '',
      paymentType: expense.paymentType || 'N/A',
      category: expense.categoryTag || 'N/A'
    })) : [];

    // Calcola statistiche mensili
    const currentYear = new Date().getFullYear();
    const monthlyStats = Array(12).fill(0).map((_, monthIndex) => {
      const monthExpenses = userData.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear && 
               expenseDate.getMonth() === monthIndex;
      });

      const income = monthExpenses
        .filter(e => !e.isExpense)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      
      const outflow = monthExpenses
        .filter(e => e.isExpense)
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      return {
        month: new Date(currentYear, monthIndex).toLocaleDateString('en', { month: 'long' }),
        monthNumber: monthIndex + 1,
        income: Number(income).toFixed(2),
        expenses: Number(outflow).toFixed(2),
        net: Number(income - outflow).toFixed(2),
        transactionCount: monthExpenses.length
      };
    });

    // Raggruppa spese per categoria
    const categoryStats = {};
    userData.expenses.filter(e => e.isExpense).forEach(expense => {
      const category = expense.categoryTag || 'Other';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, count: 0 };
      }
      categoryStats[category].total += expense.amount || 0;
      categoryStats[category].count += 1;
    });

    const categoryExpenses = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      totalAmount: Number(stats.total).toFixed(2),
      transactionCount: stats.count,
      averageAmount: Number(stats.total / stats.count || 0).toFixed(2)
    }));

    // Statistiche demografiche e performance
    const totalBalance = balances.length > 0 ? 
      parseFloat(balances[balances.length - 1]?.total || 0) : 0;
    
    const totalIncome = userData.expenses
      .filter(e => !e.isExpense)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const totalExpenses = userData.expenses
      .filter(e => e.isExpense)  
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const monthCount = Math.max(1, userData.balances.length || 1);
    const demographics = {
      accountAge: `${Math.floor((new Date() - new Date(userData.user.creationDate)) / (1000 * 60 * 60 * 24))} days`,
      totalBalance: Number(totalBalance || 0).toFixed(2),
      totalIncome: Number(totalIncome || 0).toFixed(2),
      totalExpenses: Number(totalExpenses || 0).toFixed(2),
      netWorth: Number((totalIncome || 0) - (totalExpenses || 0)).toFixed(2),
      totalTransactions: userData.expenses?.length || 0,
      balanceEntries: userData.balances?.length || 0,
      avgMonthlyIncome: Number((totalIncome || 0) / monthCount).toFixed(2),
      avgMonthlyExpenses: Number((totalExpenses || 0) / monthCount).toFixed(2),
      savingsRate: (totalIncome && totalIncome > 0) ? Number(((totalIncome - totalExpenses) / totalIncome * 100)).toFixed(1) + '%' : '0%'
    };

    const baseData = {
      userInfo,
      balances,
      monthlyData: {
        incomes: monthlyStats.map(m => parseFloat(m.income)),
        outflows: monthlyStats.map(m => parseFloat(m.expenses)),
        outflowsByCategory: categoryStats
      },
      detailedBalances: balances,
      detailedIncomes: expenses.filter(e => e.type === 'Income'),
      detailedOutflows: expenses.filter(e => e.type === 'Expense'),
      categoryExpenses,
      monthlyStats,
      demographics
    };

    // Applica i filtri se specificati
    return filterDataByDateRange(baseData, filterOptions);
  }

  // Per utenti mock o dati nel formato context esistente
  if (isMockUser) {
    console.log('Processing mock user data');
    
    const userInfo = {
      userId: userData.userId || 'dev-user-123',
      creationDate: userData.creationDate || 'Mock User',
      country: userData.country || 'Italy',
      job: userData.job || 'Developer',
      jobType: userData.jobType || 'Full-time',
      jobCountry: userData.jobCountry || 'Italy',
      workTime: userData.workTime || 'Full-time',
      remoteType: userData.remoteType || 'Hybrid',
      userType: 'mock'
    };

    // Mock data generation
    const balances = generateMockDetailedBalances();
    const detailedIncomes = generateMockDetailedIncomes();
    const detailedOutflows = generateMockDetailedOutflows();
    
    // Monthly data calculation from detailed data
    const monthlyIncomes = Array(12).fill(0);
    const monthlyOutflows = Array(12).fill(0);
    
    detailedIncomes.forEach(income => {
      const month = new Date(income.date).getMonth();
      monthlyIncomes[month] += income.amount;
    });
    
    detailedOutflows.forEach(outflow => {
      const month = new Date(outflow.date).getMonth();
      monthlyOutflows[month] += outflow.amount;
    });

    const categoryExpenses = detailedOutflows.reduce((acc, expense) => {
      const existing = acc.find(item => item.category === expense.category);
      if (existing) {
        existing.totalAmount += expense.amount;
        existing.transactionCount += 1;
      } else {
        acc.push({
          category: expense.category,
          totalAmount: expense.amount,
          transactionCount: 1,
          averageAmount: expense.amount
        });
      }
      return acc;
    }, []);

    // Calcola le medie per categoria
    categoryExpenses.forEach(category => {
      category.averageAmount = category.totalAmount / category.transactionCount;
      category.totalAmount = Number(category.totalAmount).toFixed(2);
      category.averageAmount = Number(category.averageAmount).toFixed(2);
    });

    const baseData = {
      userInfo,
      balances,
      monthlyData: {
        incomes: monthlyIncomes,
        outflows: monthlyOutflows,
        outflowsByCategory: {}
      },
      detailedBalances: balances,
      detailedIncomes,
      detailedOutflows,
      categoryExpenses,
      demographics: {
        totalBalance: balances[balances.length - 1]?.total || 50000,
        totalTransactions: detailedIncomes.length + detailedOutflows.length,
        avgMonthlyIncome: monthlyIncomes.reduce((a, b) => a + b, 0) / 12,
        avgMonthlyExpenses: monthlyOutflows.reduce((a, b) => a + b, 0) / 12,
        accountAge: 365,
        savingsRate: '15.2%'
      }
    };

    // Applica i filtri se specificati
    return filterDataByDateRange(baseData, filterOptions);
  }

  // Per utenti reali con dati context esistenti
  console.log('Processing real user data from context');
  
  const userInfo = {
    userId: userData.userId || 'N/A',
    creationDate: userData.creationDate || 'N/A',
    country: userData.country || 'N/A',
    job: userData.job || 'N/A',
    jobType: userData.jobType || 'N/A',
    jobCountry: userData.jobCountry || 'N/A',
    workTime: userData.workTime || 'N/A',
    remoteType: userData.remoteType || 'N/A',
    userType: 'real'
  };

  // Validazione e mapping sicuro per utenti reali
  const balances = Array.isArray(userData.balances) ? userData.balances.map((balance, index) => ({
    month: `Month ${index + 1}`,
    date: balance.date || 'N/A',
    bank: balance.bank || 0,
    cash: balance.cash || 0,
    digitalServices: balance.digitalServices || 0,
    stocks: balance.stocks || 0,
    etf: balance.etf || 0,
    bitcoin: balance.bitcoin || 0,
    crypto: balance.crypto || 0,
    bonds: balance.bonds || 0,
    funds: balance.funds || 0,
    gold: balance.gold || 0,
    total: (balance.bank || 0) + (balance.cash || 0) + (balance.digitalServices || 0) + 
           (balance.stocks || 0) + (balance.etf || 0) + (balance.bitcoin || 0) + (balance.crypto || 0) +
           (balance.bonds || 0) + (balance.funds || 0) + (balance.gold || 0)
  })) : [];

  const expenses = Array.isArray(userData.expenses) ? userData.expenses : [];
  const last12MonthsData = Array.isArray(userData.last12MonthsData) ? userData.last12MonthsData : [];
  const incomesArray = Array.isArray(getIncomesArray(userData)) ? getIncomesArray(userData) : [];
  const outflowsArray = Array.isArray(getOutflowsArray(userData)) ? getOutflowsArray(userData) : [];
  const totalOutflowsPerCategoryPerMonth = Array.isArray(userData.totalOutflowsPerCategoryPerMonth) ? 
    userData.totalOutflowsPerCategoryPerMonth : [];

  const monthlyData = {
    incomes: last12MonthsData.map(month => month?.totalIncomes || 0),
    outflows: last12MonthsData.map(month => month?.totalOutflows || 0),
    outflowsByCategory: totalOutflowsPerCategoryPerMonth.reduce((acc, monthData) => {
      if (monthData && monthData.categories) {
        Object.entries(monthData.categories).forEach(([category, amount]) => {
          if (!acc[category]) acc[category] = [];
          acc[category].push(amount);
        });
      }
      return acc;
    }, {})
  };

  return {
    userInfo,
    balances,
    monthlyData,
    detailedBalances: balances,
    detailedIncomes: incomesArray,
    detailedOutflows: outflowsArray,
    categoryExpenses: totalOutflowsPerCategoryPerMonth,
    demographics: {
      totalBalance: balances.length > 0 ? balances[balances.length - 1].total : 0,
      totalTransactions: expenses.length,
      avgMonthlyIncome: monthlyData.incomes.length > 0 ? 
        (monthlyData.incomes.reduce((a, b) => a + (parseFloat(b) || 0), 0) / monthlyData.incomes.length).toFixed(2) : 
        0,
      avgMonthlyExpenses: monthlyData.outflows.length > 0 ? 
        (monthlyData.outflows.reduce((a, b) => a + (parseFloat(b) || 0), 0) / monthlyData.outflows.length).toFixed(2) : 
        0,
      accountAge: balances.length > 0 ? `${balances.length} months` : '0 months',
      savingsRate: (function() {
        const totalIncome = monthlyData.incomes.reduce((a, b) => a + (parseFloat(b) || 0), 0);
        const totalExpenses = monthlyData.outflows.reduce((a, b) => a + (parseFloat(b) || 0), 0);
        if (totalIncome > 0) {
          return ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) + '%';
        }
        return '0%';
      })()
    }
  };
}

// Mock data generators
function generateMockDetailedBalances() {
  const balances = [];
  const baseAmount = 15000;
  
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    
    const variation = (Math.random() - 0.5) * 5000;
    const bank = Math.max(5000, baseAmount + variation + (i * 1000));
    const cash = 200 + Math.random() * 300;
    const digitalServices = 50 + Math.random() * 100;
    const stocks = 8000 + (Math.random() - 0.5) * 2000;
    const etf = 5000 + (Math.random() - 0.5) * 1000;
    const bitcoin = 1000 + (Math.random() - 0.5) * 500;
    const crypto = 500 + (Math.random() - 0.5) * 200;
    const bonds = 3000 + (Math.random() - 0.5) * 500;
    const funds = 2000 + (Math.random() - 0.5) * 300;
    const gold = 1000 + (Math.random() - 0.5) * 200;
    
    balances.push({
      month: date.toLocaleDateString('en', { month: 'long', year: 'numeric' }),
      date: date.toLocaleDateString(),
      bank: Number(bank).toFixed(2),
      cash: Number(cash).toFixed(2),
      digitalServices: Number(digitalServices).toFixed(2),
      stocks: Number(stocks).toFixed(2),
      etf: Number(etf).toFixed(2),
      bitcoin: Number(bitcoin).toFixed(2),
      crypto: Number(crypto).toFixed(2),
      bonds: Number(bonds).toFixed(2),
      funds: Number(funds).toFixed(2),
      gold: Number(gold).toFixed(2),
      total: Number(bank + cash + digitalServices + stocks + etf + bitcoin + crypto + bonds + funds + gold).toFixed(2)
    });
  }
  
  return balances;
}

function generateMockDetailedIncomes() {
  const incomes = [];
  const sources = ['Salary', 'Freelance', 'Investment Return', 'Bonus', 'Side Business'];
  const paymentTypes = ['Bank Transfer', 'Direct Deposit', 'Check', 'Digital Payment'];
  
  // Generate monthly salary
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    date.setDate(25); // Pay day
    
    incomes.push({
      id: incomes.length + 1,
      date: date.toLocaleDateString(),
      amount: Number(3500 + Math.random() * 500).toFixed(2),
      type: 'Income',
      source: 'Salary',
      paymentType: 'Direct Deposit',
      category: 'Employment',
      notes: 'Monthly salary'
    });
  }
  
  // Generate random additional incomes
  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    
    incomes.push({
      id: incomes.length + 1,
      date: date.toLocaleDateString(),
      amount: Number(200 + Math.random() * 1000).toFixed(2),
      type: 'Income',
      source: sources[Math.floor(Math.random() * sources.length)],
      paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
      category: 'Additional Income',
      notes: 'Additional income source'
    });
  }
  
  return incomes.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generateMockDetailedOutflows() {
  const categories = ['Home', 'Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Travel', 'Other'];
  const paymentTypes = ['Card', 'Cash', 'Bank Transfer', 'Digital Payment', 'Check'];
  const notes = [
    'Grocery shopping',
    'Restaurant dinner',
    'Gas station',
    'Monthly subscription',
    'Online shopping',
    'Medical appointment',
    'Movie tickets',
    'Coffee shop',
    'Uber ride',
    'Utilities bill',
    'Insurance payment',
    'Gym membership',
    'Book purchase',
    'Clothing store',
    'Home maintenance'
  ];
  
  const now = new Date();
  const transactions = [];
  
  // Genera 40-80 transazioni negli ultimi 12 mesi
  const numTransactions = 40 + Math.floor(Math.random() * 40);
  
  for (let i = 0; i < numTransactions; i++) {
    const date = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    
    transactions.push({
      id: i + 1,
      date: date.toLocaleDateString(),
      amount: Number((Math.random() * 200 + 10)).toFixed(2),
      type: 'Expense',
      category: categories[Math.floor(Math.random() * categories.length)],
      paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
      notes: notes[Math.floor(Math.random() * notes.length)]
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Export functions

export const exportToCSV = async (userData, language, filterOptions = null) => {
  try {
    const data = prepareUserDataForExport(userData, language, filterOptions);
    
    if (!data || !data.userInfo) {
      throw new Error('Dati preparati non validi');
    }

    // Controlla se i dati filtrati sono vuoti
    const hasData = (data.balances && data.balances.length > 0) || 
                   (data.detailedIncomes && data.detailedIncomes.length > 0) || 
                   (data.detailedOutflows && data.detailedOutflows.length > 0);

    if (data.isFiltered && !hasData) {
      // Dati vuoti per il periodo selezionato
      const filterMsg = data.filterInfo?.type === 'specific' 
        ? `per ${data.filterInfo.monthName}` 
        : `per il periodo selezionato`;
        
      alert(language === 'it' 
        ? `Nessun dato disponibile ${filterMsg}. Il file scaricato conterrà solo la struttura.`
        : `No data available for the selected period. The downloaded file will contain only the structure.`
      );
    }

    // Crea un nuovo ZIP per contenere tutti i file CSV
    const zip = new JSZip();
    
    // Timestamp per i nomi file
    const today = new Date();
    const timestamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 1. Foglio: User Information
    const userInfoCSV = convertSingleArrayToCSV([data.userInfo], 'User Information');
    zip.file('01_User_Information.csv', userInfoCSV);

    // 2. Foglio: Balance History 
    if (data.balances && data.balances.length > 0) {
      const balancesCSV = convertSingleArrayToCSV(data.balances, 'Balance History');
      zip.file('02_Balance_History.csv', balancesCSV);
    }

    // 3. Foglio: Monthly Statistics
    if (data.monthlyStats && data.monthlyStats.length > 0) {
      const monthlyStatsCSV = convertSingleArrayToCSV(data.monthlyStats, 'Monthly Statistics');
      zip.file('03_Monthly_Statistics.csv', monthlyStatsCSV);
    } else {
      // Crea statistiche mensili di base dai dati disponibili
      const basicMonthlyData = data.monthlyData.incomes.map((income, index) => ({
        month: `Month ${index + 1}`,
        income: income || 0,
        expenses: data.monthlyData.outflows[index] || 0,
        net: (income || 0) - (data.monthlyData.outflows[index] || 0)
      }));
      const basicMonthlyCSV = convertSingleArrayToCSV(basicMonthlyData, 'Monthly Income & Expenses');
      zip.file('03_Monthly_Income_Expenses.csv', basicMonthlyCSV);
    }

    // 4. Foglio: Income Transactions
    if (data.detailedIncomes && data.detailedIncomes.length > 0) {
      const incomesCSV = convertSingleArrayToCSV(data.detailedIncomes, 'Income Transactions');
      zip.file('04_Income_Transactions.csv', incomesCSV);
    }

    // 5. Foglio: Expense Transactions
    if (data.detailedOutflows && data.detailedOutflows.length > 0) {
      const expensesCSV = convertSingleArrayToCSV(data.detailedOutflows, 'Expense Transactions');
      zip.file('05_Expense_Transactions.csv', expensesCSV);
    }

    // 6. Foglio: Category Summary
    if (data.categoryExpenses && data.categoryExpenses.length > 0) {
      const categoryCSV = convertSingleArrayToCSV(data.categoryExpenses, 'Expenses by Category');
      zip.file('06_Category_Summary.csv', categoryCSV);
    }

    // 7. Foglio: Account Performance & Demographics
    if (data.demographics && Object.keys(data.demographics).length > 0) {
      const demographicsCSV = convertSingleArrayToCSV([data.demographics], 'Account Performance');
      zip.file('07_Account_Performance.csv', demographicsCSV);
    }

    // 8. Foglio: Export Information
    const exportInfo = {
      exportDate: new Date().toISOString(),
      exportTime: new Date().toLocaleString(),
      userType: data.userInfo.userType || 'unknown',
      totalFiles: Object.keys(zip.files).length,
      dataVersion: '1.0',
      generatedBy: 'Pacifinance Platform'
    };
    const exportInfoCSV = convertSingleArrayToCSV([exportInfo], 'Export Information');
    zip.file('00_Export_Info.csv', exportInfoCSV);

    // Genera il file ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download del file ZIP
    saveAs(zipBlob, `pacifinance_data_sheets_${timestamp}.zip`);

  } catch (error) {
    console.error('Errore durante l\'export CSV strutturato:', error);
    throw new Error('Impossibile generare i file CSV strutturati: ' + error.message);
  }
};

// Export in formato Excel
export const exportToExcel = async (userData, language, filterOptions = null) => {
  try {
    const data = prepareUserDataForExport(userData, language, filterOptions);
    
    if (!data || !data.userInfo) {
      throw new Error('Dati preparati non validi');
    }
  
  // Crea workbook
  const workbook = new ExcelJS.Workbook();
  
  // Foglio 1: Informazioni Utente
  const userInfoWS = workbook.addWorksheet('User Info');
  const userInfoHeaders = Object.keys(data.userInfo);
  userInfoWS.addRow(userInfoHeaders);
  userInfoWS.addRow(Object.values(data.userInfo));
  
  // Stile headers
  userInfoWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  userInfoWS.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF079164' }
  };
  
  // Foglio 2: Bilanci Mensili
  const balancesWS = workbook.addWorksheet('Monthly Balances');
  if (data.balances && data.balances.length > 0) {
    const balanceHeaders = Object.keys(data.balances[0]);
    balancesWS.addRow(balanceHeaders);
    
    data.balances.forEach(balance => {
      balancesWS.addRow(Object.values(balance));
    });
    
    // Stile headers
    balancesWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    balancesWS.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF079164' }
    };
  }
  
  // Foglio 3: Dati Mensili
  const monthlyWS = workbook.addWorksheet('Monthly Data');
  const monthlyHeaders = ['Month', 'Income', 'Outflow', 'Net'];
  monthlyWS.addRow(monthlyHeaders);
  
  data.monthlyData.incomes.forEach((income, index) => {
    const outflow = data.monthlyData.outflows[index] || 0;
    monthlyWS.addRow([
      `Month ${index + 1}`,
      income,
      outflow,
      income - outflow
    ]);
  });
  
  // Stile headers
  monthlyWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  monthlyWS.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF079164' }
  };
  
  // Aggiungi altri fogli se i dati sono disponibili
  if (data.detailedBalances && data.detailedBalances.length > 0) {
    const detailedBalancesWS = workbook.addWorksheet('Detailed Balances');
    const balanceDetailHeaders = Object.keys(data.detailedBalances[0]);
    detailedBalancesWS.addRow(balanceDetailHeaders);
    
    // Stile headers
    detailedBalancesWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    detailedBalancesWS.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF079164' }
    };
    
    // Aggiungi dati
    data.detailedBalances.forEach(balance => {
      detailedBalancesWS.addRow(Object.values(balance));
    });
    
    // Auto-size columns
    balanceDetailHeaders.forEach((header, index) => {
      const column = detailedBalancesWS.getColumn(index + 1);
      column.width = Math.max(header.length, 12);
    });
  }
  
  if (data.detailedIncomes && data.detailedIncomes.length > 0) {
    const incomesDetailWS = workbook.addWorksheet('Detailed Incomes');
    const incomeDetailHeaders = Object.keys(data.detailedIncomes[0]);
    incomesDetailWS.addRow(incomeDetailHeaders);
    
    // Stile headers
    incomesDetailWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    incomesDetailWS.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF079164' }
    };
    
    // Aggiungi dati
    data.detailedIncomes.forEach(income => {
      incomesDetailWS.addRow(Object.values(income));
    });
    
    // Auto-size columns
    incomeDetailHeaders.forEach((header, index) => {
      const column = incomesDetailWS.getColumn(index + 1);
      column.width = Math.max(header.length, 15);
    });
  }
  
  if (data.detailedOutflows && data.detailedOutflows.length > 0) {
    const outflowsDetailWS = workbook.addWorksheet('Detailed Outflows');
    const outflowDetailHeaders = Object.keys(data.detailedOutflows[0]);
    outflowsDetailWS.addRow(outflowDetailHeaders);
    
    // Stile headers
    outflowsDetailWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    outflowsDetailWS.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF079164' }
    };
    
    // Aggiungi dati
    data.detailedOutflows.forEach(outflow => {
      outflowsDetailWS.addRow(Object.values(outflow));
    });
    
    // Auto-size columns
    outflowDetailHeaders.forEach((header, index) => {
      const column = outflowsDetailWS.getColumn(index + 1);
      column.width = Math.max(header.length, 15);
    });
  }
  
  // Foglio 9: Dati Demografici (per utenti mock)
  if (data.demographics && Object.keys(data.demographics).length > 0) {
    const demoWS = workbook.addWorksheet('Demographics');
    const demoHeaders = Object.keys(data.demographics);
    demoWS.addRow(demoHeaders);
    demoWS.addRow(Object.values(data.demographics));
    
    // Stile headers
    demoWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    demoWS.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF079164' }
    };
    
    // Auto-size columns
    demoHeaders.forEach((header, index) => {
      const column = demoWS.getColumn(index + 1);
      column.width = Math.max(header.length, 15);
    });
  }
  
  // Auto-size columns per tutti i fogli
  userInfoHeaders.forEach((header, index) => {
    const column = userInfoWS.getColumn(index + 1);
    column.width = Math.max(header.length, 15);
  });
  
  monthlyHeaders.forEach((header, index) => {
    const column = monthlyWS.getColumn(index + 1);
    column.width = Math.max(header.length, 12);
  });
  
  // Salva file
  const today = new Date();
  const timestamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pacifinance_complete_data_${timestamp}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
  } catch (error) {
    console.error('Errore durante l\'export Excel:', error);
    throw new Error('Impossibile generare il file Excel: ' + error.message);
  }
};

// Export in formato JSON
export const exportToJSON = (userData, language, filterOptions = null) => {
  try {
    const data = prepareUserDataForExport(userData, language, filterOptions);
  
  // Aggiungi metadati per il file JSON
  const enrichedData = {
    exportInfo: {
      exportDate: new Date().toISOString(),
      exportFormat: 'JSON',
      dataVersion: '1.0',
      source: 'Pacifinance Platform',
      userType: data.userInfo.userType || 'unknown'
    },
    ...data
  };
  
  const today = new Date();
  const timestamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
    const jsonString = JSON.stringify(enrichedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    saveAs(blob, `pacifinance_complete_data_${timestamp}.json`);
  } catch (error) {
    console.error('Errore durante l\'export JSON:', error);
    throw new Error('Impossibile generare il file JSON: ' + error.message);
  }
};

// Create pie chart script for PDF
const createPieChartScript = (categoryExpenses) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE'
  ];
  
  return `
  <script>
    window.addEventListener('load', function() {
      if (typeof Chart !== 'undefined') {
        const ctx = document.getElementById('categoryChart');
        if (ctx) {
          const chart = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: ${JSON.stringify(categoryExpenses.map(cat => cat.category))},
              datasets: [{
                data: ${JSON.stringify(categoryExpenses.map(cat => parseFloat(cat.totalAmount)))},
                backgroundColor: ${JSON.stringify(colors.slice(0, categoryExpenses.length))},
                borderWidth: 2,
                borderColor: '#fff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                      size: 12
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                      const percentage = ((context.raw / total) * 100).toFixed(1);
                      return context.label + ': €' + context.raw + ' (' + percentage + '%)';
                    }
                  }
                }
              }
            }
          });
        }
      }
    });
  </script>
  `;
};

// Export in formato PDF (documento leggibile)
export const exportToPDF = async (userData, language, filterOptions = null) => {
  try {
    const data = prepareUserDataForExport(userData, language, filterOptions);
    
    if (!data || !data.userInfo) {
      throw new Error('Dati preparati non validi per PDF');
    }

    // Controlla se i dati filtrati sono vuoti
    const hasData = (data.balances && data.balances.length > 0) || 
                   (data.detailedIncomes && data.detailedIncomes.length > 0) || 
                   (data.detailedOutflows && data.detailedOutflows.length > 0);

    if (data.isFiltered && !hasData) {
      const filterMsg = data.filterInfo?.type === 'specific' 
        ? `per ${data.filterInfo.monthName}` 
        : `per il periodo selezionato`;
        
      alert(language === 'it' 
        ? `Nessun dato disponibile ${filterMsg}. Il PDF conterrà solo le informazioni utente.`
        : `No data available for the selected period. The PDF will contain only user information.`
      );
    }



    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Pacifinance - Data Export</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              h1 { color: #079164; text-align: center; margin-bottom: 30px; }
              h2 { color: #333; border-bottom: 2px solid #079164; padding-bottom: 10px; }
              h3 { color: #555; margin-top: 25px; }
              table { border-collapse: collapse; width: 100%; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
              th { background-color: #079164; color: white; font-weight: bold; }
              .section { margin: 30px 0; page-break-inside: avoid; }
              .filter-info { 
                background-color: #f8f9fa; 
                padding: 15px; 
                border-radius: 8px; 
                border-left: 4px solid #079164; 
                margin-bottom: 25px; 
              }
              .chart-container { 
                text-align: center; 
                margin: 30px 0; 
                page-break-inside: avoid; 
              }
              .summary-stats { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 20px; 
                margin: 20px 0; 
              }
              .stat-card { 
                background-color: #f8f9fa; 
                padding: 15px; 
                border-radius: 8px; 
                text-align: center; 
              }
              .stat-value { 
                font-size: 1.8em; 
                font-weight: bold; 
                color: #079164; 
              }
              .stat-label { 
                color: #666; 
                font-size: 0.9em; 
              }
              @media print {
                body { margin: 20px; }
                .chart-container { page-break-inside: avoid; }
              }
          </style>
      </head>
      <body>
          <h1>Pacifinance - Financial Data Export</h1>
          
          <div class="filter-info">
              <strong>Export Information:</strong><br>
              Date: ${new Date().toLocaleDateString()}<br>
              Time: ${new Date().toLocaleTimeString()}<br>
              ${data.isFiltered ? `
                Filter Applied: ${data.filterInfo?.type === 'specific' 
                  ? `Specific Month (${data.filterInfo.monthName})`
                  : data.filterInfo?.type === 'last12'
                  ? 'Last 12 Months'
                  : 'All Data'}<br>
                ${data.filterInfo?.startDate ? `Period: ${data.filterInfo.startDate} - ${data.filterInfo.endDate}` : ''}
              ` : 'Filter: All Data'}
          </div>
          
          <div class="section">
              <h2>User Information</h2>
              <table>
                  <tr><th>Field</th><th>Value</th></tr>
                  ${Object.entries(data.userInfo).map(([key, value]) => 
                    `<tr><td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td><td>${value}</td></tr>`
                  ).join('')}
              </table>
          </div>

          ${data.isFiltered && data.filterInfo?.type === 'specific' && data.categoryExpenses && data.categoryExpenses.length > 0 ? `
          <div class="section">
              <h2>Monthly Expense Analysis - ${data.filterInfo.monthName}</h2>
              
              <div class="summary-stats">
                  <div class="stat-card">
                      <div class="stat-value">€${data.detailedOutflows ? data.detailedOutflows.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toFixed(2) : '0'}</div>
                      <div class="stat-label">Total Expenses</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-value">€${data.detailedIncomes ? data.detailedIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0).toFixed(2) : '0'}</div>
                      <div class="stat-label">Total Income</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-value">${data.detailedOutflows ? data.detailedOutflows.length : 0}</div>
                      <div class="stat-label">Transactions</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-value">${data.categoryExpenses ? data.categoryExpenses.length : 0}</div>
                      <div class="stat-label">Categories</div>
                  </div>
              </div>

              <div class="chart-container">
                  <h3>Expenses by Category</h3>
                  <canvas id="categoryChart" width="400" height="300"></canvas>
              </div>

              <h3>Category Breakdown</h3>
              <table>
                  <tr><th>Category</th><th>Total Amount</th><th>Transactions</th><th>Average</th><th>Percentage</th></tr>
                  ${data.categoryExpenses.map(cat => {
                    const totalExpenses = data.categoryExpenses.reduce((sum, c) => sum + parseFloat(c.totalAmount), 0);
                    const percentage = totalExpenses > 0 ? ((parseFloat(cat.totalAmount) / totalExpenses) * 100).toFixed(1) : '0';
                    return `
                      <tr>
                          <td>${cat.category}</td>
                          <td>€${cat.totalAmount}</td>
                          <td>${cat.transactionCount}</td>
                          <td>€${cat.averageAmount}</td>
                          <td>${percentage}%</td>
                      </tr>
                    `;
                  }).join('')}
              </table>
          </div>
          ` : ''}

          ${data.balances && data.balances.length > 0 ? `
          <div class="section">
              <h2>Balance History</h2>
              <table>
                  <tr>
                      <th>Date</th><th>Bank</th><th>Cash</th><th>Digital Services</th>
                      <th>Stocks</th><th>ETF</th><th>Bitcoin</th><th>Crypto</th><th>Total</th>
                  </tr>
                  ${data.balances.map(balance => `
                      <tr>
                          <td>${balance.date || balance.userDate || 'N/A'}</td>
                          <td>€${balance.bank || '0'}</td>
                          <td>€${balance.cash || '0'}</td>
                          <td>€${balance.digitalServices || '0'}</td>
                          <td>€${balance.stocks || '0'}</td>
                          <td>€${balance.etf || '0'}</td>
                          <td>€${balance.bitcoin || '0'}</td>
                          <td>€${balance.crypto || '0'}</td>
                          <td><strong>€${balance.total || '0'}</strong></td>
                      </tr>
                  `).join('')}
              </table>
          </div>
          ` : ''}

          ${data.detailedIncomes && data.detailedIncomes.length > 0 ? `
          <div class="section">
              <h2>Income Transactions</h2>
              <table>
                  <tr><th>Date</th><th>Amount</th><th>Category</th><th>Notes</th></tr>
                  ${data.detailedIncomes.map(income => `
                      <tr>
                          <td>${income.date}</td>
                          <td style="color: #079164; font-weight: bold;">€${income.amount}</td>
                          <td>${income.category || 'N/A'}</td>
                          <td>${income.notes || ''}</td>
                      </tr>
                  `).join('')}
              </table>
          </div>
          ` : ''}

          ${data.detailedOutflows && data.detailedOutflows.length > 0 && (!data.isFiltered || data.filterInfo?.type !== 'specific') ? `
          <div class="section">
              <h2>Expense Transactions</h2>
              <table>
                  <tr><th>Date</th><th>Amount</th><th>Category</th><th>Payment Type</th><th>Notes</th></tr>
                  ${data.detailedOutflows.slice(0, 50).map(expense => `
                      <tr>
                          <td>${expense.date}</td>
                          <td style="color: #dc3545; font-weight: bold;">€${expense.amount}</td>
                          <td>${expense.category || 'N/A'}</td>
                          <td>${expense.paymentType || 'N/A'}</td>
                          <td>${expense.notes || ''}</td>
                      </tr>
                  `).join('')}
                  ${data.detailedOutflows.length > 50 ? `
                      <tr><td colspan="5" style="text-align: center; font-style: italic;">
                          ... and ${data.detailedOutflows.length - 50} more transactions
                      </td></tr>
                  ` : ''}
              </table>
          </div>
          ` : ''}
          
          ${data.demographics && Object.keys(data.demographics).length > 0 ? `
          <div class="section">
              <h2>Account Performance Summary</h2>
              <div class="summary-stats">
                  ${Object.entries(data.demographics).map(([key, value]) => `
                      <div class="stat-card">
                          <div class="stat-value">${value}</div>
                          <div class="stat-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                      </div>
                  `).join('')}
              </div>
          </div>
          ` : ''}

          ${data.isFiltered && !hasData ? `
          <div class="section">
              <h2>No Data Available</h2>
              <p style="text-align: center; color: #666; font-style: italic;">
                  No financial data found for the selected period.
              </p>
          </div>
          ` : ''}

      </body>
      ${data.isFiltered && data.filterInfo?.type === 'specific' && data.categoryExpenses && data.categoryExpenses.length > 0 
        ? createPieChartScript(data.categoryExpenses) 
        : ''}
      </html>
    `;
    
    // Apre una nuova finestra con il contenuto HTML per la stampa
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Aspetta che il contenuto sia caricato e poi apre il dialog di stampa
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  } catch (error) {
    console.error('Errore durante l\'export PDF:', error);
    throw new Error('Impossibile generare il documento PDF: ' + error.message);
  }
};

// Funzione helper per convertire array di oggetti in CSV (versione legacy)
const convertToCSV = (data, title) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return `${title}\nNo data available\n`;
  }
  
  if (!data[0] || typeof data[0] !== 'object') {
    return `${title}\nInvalid data format\n`;
  }
  
  const headers = Object.keys(data[0]);
  if (headers.length === 0) {
    return `${title}\nNo data fields available\n`;
  }
  
  const csvContent = [
    title,
    headers.join(','),
    ...data.map(row => {
      if (!row || typeof row !== 'object') return '';
      return headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',');
    })
  ].join('\n');
  
  return csvContent;
};

// Funzione helper per convertire array di oggetti in CSV pulito (per fogli separati)
const convertSingleArrayToCSV = (data, title) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return `${title}\nNo data available\n`;
  }
  
  if (!data[0] || typeof data[0] !== 'object') {
    return `${title}\nInvalid data format\n`;
  }
  
  const headers = Object.keys(data[0]);
  if (headers.length === 0) {
    return `${title}\nNo data fields available\n`;
  }

  // Formatta i nomi delle colonne per renderli più leggibili
  const formattedHeaders = headers.map(header => {
    return header
      .replace(/([A-Z])/g, ' $1') // Aggiungi spazio prima delle maiuscole
      .replace(/^./, str => str.toUpperCase()) // Maiuscola iniziale
      .trim();
  });
  
  const csvRows = [
    `# ${title}`, // Titolo come commento
    `# Generated on: ${new Date().toLocaleString()}`,
    '', // Riga vuota per separazione
    formattedHeaders.join(','), // Headers formattati
    ...data.map(row => {
      if (!row || typeof row !== 'object') return '';
      return headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        
        // Gestione speciale per valori stringa che contengono virgole
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
        }
        
        return String(value);
      }).join(',');
    }).filter(row => row !== '') // Rimuovi righe vuote
  ];
  
  return csvRows.join('\n');
};