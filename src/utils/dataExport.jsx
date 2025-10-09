import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Funzione per esportare tutti i dati utente in diversi formati
 */

// Funzione per convertire i dati utente in formato standard
export const prepareUserDataForExport = (userData, language) => {
  // Controlla se userData esiste ed è valido
  if (!userData || typeof userData !== 'object') {
    console.warn('prepareUserDataForExport: userData non valido', userData);
    return {
      userInfo: {
        userId: 'N/A',
        userType: 'N/A',
        username: 'N/A',
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
      creationDate: new Date(userData.user.creationDate).toLocaleDateString() || 'N/A',
      country: userData.user.country || 'N/A',
      job: userData.user.job || 'N/A',
      jobType: userData.user.jobType || 'N/A',
      jobCountry: userData.user.jobCountry || 'N/A',
      workTime: userData.user.workTime || 'N/A',
      remoteType: userData.user.remoteType || 'N/A',
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

    const demographics = {
      accountAge: Math.floor((new Date() - new Date(userData.user.creationDate)) / (1000 * 60 * 60 * 24)),
      totalBalance: Number(totalBalance).toFixed(2),
      totalIncome: Number(totalIncome).toFixed(2),
      totalExpenses: Number(totalExpenses).toFixed(2),
      netWorth: Number(totalIncome - totalExpenses).toFixed(2),
      totalTransactions: userData.expenses.length,
      balanceEntries: userData.balances.length,
      avgMonthlyIncome: Number(totalIncome / 12).toFixed(2),
      avgMonthlyExpenses: Number(totalExpenses / 12).toFixed(2),
      savingsRate: totalIncome > 0 ? Number(((totalIncome - totalExpenses) / totalIncome * 100)).toFixed(2) + '%' : '0%'
    };

    return {
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
  }
  
  const exportData = {
    // Informazioni utente
    userInfo: {
      userId: userData?.userId || 'N/A',
      userType: userData?.userType || 'N/A',
      username: userData?.username || 'N/A',
      creationDate: userData?.creationDate || new Date('2023-01-15').toISOString(),
      country: userData?.country?.label || userData?.userNationality || userData?.country || 'Italy',
      job: userData?.job?.label || userData?.userJob || userData?.job || 'Developer',
      jobType: userData?.jobType?.label || userData?.userJobType || userData?.jobType || 'Full-time',
      jobCountry: userData?.jobCountry?.label || userData?.userWhereWorks || userData?.jobCountry || 'Italy',
      workTime: userData?.workTime?.label || userData?.userWorkTime || userData?.workTime || '40',
      remoteType: userData?.remoteType?.label || userData?.userRemoteType || userData?.remoteType || 'Remote'
    },
    
    // Bilanci (ultimi 12 mesi)
    balances: (userData?.last12MonthsData && Array.isArray(userData.last12MonthsData)) ? userData.last12MonthsData.map((balance) => ({
      month: balance.month || 'N/A',
      bank: Math.round(balance.bankReal || 0),
      cash: Math.round(balance.cashReal || 0),
      digitalServices: Math.round(balance.digitalServicesReal || 0),
      stocks: Math.round(balance.stocksReal || 0),
      etf: Math.round(balance.etfReal || 0),
      bitcoin: Math.round(balance.bitcoinReal || 0),
      crypto: Math.round(balance.cryptoReal || 0),
      bonds: Math.round(balance.bondsReal || 0),
      funds: Math.round(balance.fundsReal || 0),
      gold: Math.round(balance.goldReal || 0),
      total: Math.round((balance.bankReal || 0) + (balance.cashReal || 0) + 
             (balance.digitalServicesReal || 0) + (balance.stocksReal || 0) + 
             (balance.etfReal || 0) + (balance.bitcoinReal || 0) + 
             (balance.cryptoReal || 0) + (balance.bondsReal || 0) + 
             (balance.fundsReal || 0) + (balance.goldReal || 0))
    })) : [],
    
    // Entrate e Uscite (ultimi 12 mesi - sommario)
    monthlyData: {
      incomes: (userData?.incomesArray && Array.isArray(userData.incomesArray)) ? userData.incomesArray : (isMockUser ? generateMockIncomesArray() : []),
      outflows: (userData?.outflowsArray && Array.isArray(userData.outflowsArray)) ? userData.outflowsArray : (isMockUser ? generateMockOutflowsArray() : []),
      outflowsByCategory: (userData?.totalOutflowsPerCategoryPerMonth && Array.isArray(userData.totalOutflowsPerCategoryPerMonth)) ? userData.totalOutflowsPerCategoryPerMonth : []
    },
    
    // Bilanci dettagliati (ogni inserimento utente)
    detailedBalances: (userData?.balances && Array.isArray(userData.balances)) ? userData.balances.map(balance => ({
      date: balance.date || 'N/A',
      userDate: balance.userDate || 'N/A',
      bank: Math.round(balance.bank || 0),
      cash: Math.round(balance.cash || 0),
      digitalServices: Math.round(balance.digitalServices || 0),
      stocks: Math.round(balance.stocks || 0),
      etf: Math.round(balance.etf || 0),
      bitcoin: Math.round(balance.bitcoin || 0),
      crypto: Math.round(balance.crypto || 0),
      bonds: Math.round(balance.bonds || 0),
      funds: Math.round(balance.funds || 0),
      gold: Math.round(balance.gold || 0),
      total: Math.round((balance.bank || 0) + (balance.cash || 0) + (balance.digitalServices || 0) + 
                      (balance.stocks || 0) + (balance.etf || 0) + (balance.bitcoin || 0) + 
                      (balance.crypto || 0) + (balance.bonds || 0) + (balance.funds || 0) + (balance.gold || 0))
    })) : (isMockUser ? generateMockDetailedBalances() : []),
    
    // Dettagli Income (ogni transazione)
    detailedIncomes: (userData?.expenses && Array.isArray(userData.expenses)) ? userData.expenses
      .filter(expense => !expense.isExpense) // Solo entrate
      .map(income => ({
        date: income.date || 'N/A',
        amount: Math.round(income.amount || 0),
        notes: income.notes || '',
        paymentType: income.paymentType || 'N/A',
        categoryTag: income.categoryTag || 'N/A'
      })) : (isMockUser ? generateMockDetailedIncomes() : []),
    
    // Dettagli Outflows (ogni transazione)  
    detailedOutflows: (userData?.expenses && Array.isArray(userData.expenses)) ? userData.expenses
      .filter(expense => expense.isExpense) // Solo uscite
      .map(outflow => ({
        date: outflow.date || 'N/A',
        amount: Math.round(outflow.amount || 0),
        notes: outflow.notes || '',
        paymentType: outflow.paymentType || 'N/A',
        categoryTag: outflow.categoryTag || 'N/A'
      })) : (isMockUser ? generateMockDetailedOutflows() : []),
    
    // Spese per categoria (se disponibili)
    categoryExpenses: isMockUser && userData?.totalOutflowsPerCategoryPerMonth 
      ? userData.totalOutflowsPerCategoryPerMonth.map((monthData, index) => ({
          month: `Month ${index + 1}`,
          ...Object.fromEntries(
            Object.entries(monthData).map(([key, value]) => [key, Math.round(value)])
          )
        }))
      : [],
    
    // Dati demografici aggiuntivi per utenti mock
    demographics: isMockUser ? {
      percentageRankOnBalance: userData?.percentageRankOnBalance || 0,
      percentageRankOnIncomes: userData?.percentageRankOnIncomes || 0,
      percentageRankOnExpenses: userData?.percentageRankOnExpenses || 0,
      currentBalance: Math.round(userData?.totalReal || 0),
      previousMonthBalance: Math.round(userData?.totalRealPreMonth || 0),
      previousYearBalance: Math.round(userData?.totalRealPreYearSameMonth || 0)
    } : {}
  };

  return exportData;
};

// Funzione per generare array di entrate mock (12 mesi)
function generateMockIncomesArray() {
  return Array.from({ length: 12 }, (_, i) => {
    // Genera entrate realistiche con variazioni stagionali
    const baseIncome = 2800;
    const seasonal = Math.sin((i + 3) * Math.PI / 6) * 300; // Picco in estate
    const random = (Math.random() - 0.5) * 400;
    return Math.round(Math.max(2000, baseIncome + seasonal + random));
  });
}

// Funzione per generare array di uscite mock (12 mesi)
function generateMockOutflowsArray() {
  return Array.from({ length: 12 }, (_, i) => {
    // Genera uscite realistiche con variazioni stagionali
    const baseOutflow = 2000;
    const seasonal = Math.sin((i + 11) * Math.PI / 6) * 400; // Picco in inverno (riscaldamento, regali)
    const random = (Math.random() - 0.5) * 300;
    return Math.round(Math.max(1200, baseOutflow + seasonal + random));
  });
}

// Funzione per generare bilanci dettagliati mock
function generateMockDetailedBalances() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 15);
    const userDate = new Date(date.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000);
    
    return {
      date: date.toISOString().split('T')[0],
      userDate: userDate.toISOString().split('T')[0],
      bank: Math.round(18000 + Math.sin(i * 0.6) * 5000 + Math.random() * 2000),
      cash: Math.round(400 + Math.random() * 200),
      digitalServices: Math.round(Math.random() * 100),
      stocks: Math.round(7000 + Math.sin(i * 0.7) * 2000 + Math.random() * 1000),
      etf: Math.round(23000 + Math.sin(i * 0.8) * 3000 + Math.random() * 2000),
      bitcoin: Math.round(Math.random() * 1000),
      crypto: Math.round(Math.random() * 500),
      bonds: Math.round(Math.max(0, 8000 + (i * 800) + Math.random() * 1000)),
      funds: Math.round(Math.max(0, 6000 + (i * 600) + Math.random() * 800)),
      gold: Math.round(Math.max(0, 3000 + (i * 450) + Math.random() * 600)),
      total: 0 // Viene calcolato automaticamente nella funzione principale
    };
  });
}

// Funzione per generare entrate dettagliate mock
function generateMockDetailedIncomes() {
  const categories = ['Salary', 'Freelance', 'Investment', 'Bonus', 'Other'];
  const paymentTypes = ['Bank Transfer', 'Cash', 'Check', 'Digital Payment'];
  const notes = [
    'Monthly salary payment',
    'Freelance project completion',
    'Dividend payment',
    'Investment return',
    'Performance bonus',
    'Side project income',
    'Consulting fee',
    'Stock profit'
  ];
  
  const now = new Date();
  const transactions = [];
  
  // Genera 15-25 transazioni negli ultimi 12 mesi
  const numTransactions = 15 + Math.floor(Math.random() * 10);
  
  for (let i = 0; i < numTransactions; i++) {
    const date = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const isMainSalary = Math.random() < 0.7; // 70% salary, 30% other
    
    transactions.push({
      date: date.toISOString().split('T')[0],
      amount: Math.round(isMainSalary ? 2500 + Math.random() * 500 : 100 + Math.random() * 1000),
      notes: notes[Math.floor(Math.random() * notes.length)],
      paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
      categoryTag: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Funzione per generare uscite dettagliate mock
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
    const isLargeExpense = Math.random() < 0.2; // 20% large expenses, 80% regular
    
    transactions.push({
      date: date.toISOString().split('T')[0],
      amount: Math.round(isLargeExpense ? 200 + Math.random() * 800 : 10 + Math.random() * 150),
      notes: notes[Math.floor(Math.random() * notes.length)],
      paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
      categoryTag: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Export in formato CSV
export const exportToCSV = (userData, language) => {
  try {
    const data = prepareUserDataForExport(userData, language);
    
    if (!data || !data.userInfo) {
      throw new Error('Dati preparati non validi');
    }
    
    // Crea CSV per informazioni utente
    const userInfoCSV = convertToCSV([data.userInfo], 'User Information');
    
    // Crea CSV per bilanci
    const balancesCSV = convertToCSV(data.balances, 'Monthly Balances');
    
    // Crea CSV per entrate/uscite
    const incomesData = data.monthlyData.incomes.map((amount, index) => ({
      month: `Month ${index + 1}`,
      income: amount || 0,
      outflow: data.monthlyData.outflows[index] || 0,
      net: (amount || 0) - (data.monthlyData.outflows[index] || 0)
    }));
    const incomesCSV = convertToCSV(incomesData, 'Monthly Income & Outflows');
    
    // Crea CSV per dati demografici (se disponibili)
    let demographicsCSV = '';
    if (data.demographics && Object.keys(data.demographics).length > 0) {
      demographicsCSV = convertToCSV([data.demographics], 'Demographics & Performance');
    }
  
  // Crea CSV per bilanci dettagliati (se disponibili)
  let detailedBalancesCSV = '';
  if (data.detailedBalances && data.detailedBalances.length > 0) {
    detailedBalancesCSV = convertToCSV(data.detailedBalances, 'Detailed Balance History');
  }
  
  // Crea CSV per entrate dettagliate (se disponibili)
  let detailedIncomesCSV = '';
  if (data.detailedIncomes && data.detailedIncomes.length > 0) {
    detailedIncomesCSV = convertToCSV(data.detailedIncomes, 'Detailed Income Transactions');
  }
  
  // Crea CSV per uscite dettagliate (se disponibili)
  let detailedOutflowsCSV = '';
  if (data.detailedOutflows && data.detailedOutflows.length > 0) {
    detailedOutflowsCSV = convertToCSV(data.detailedOutflows, 'Detailed Outflow Transactions');
  }
  
  // Crea CSV per spese per categoria (se disponibili)
  let categoryCSV = '';
  if (data.categoryExpenses && data.categoryExpenses.length > 0) {
    categoryCSV = convertToCSV(data.categoryExpenses, 'Expenses by Category Summary');
  }

  // Crea CSV per statistiche mensili (se disponibili)
  let monthlyStatsCSV = '';
  if (data.monthlyStats && data.monthlyStats.length > 0) {
    monthlyStatsCSV = convertToCSV(data.monthlyStats, 'Monthly Financial Statistics');
  }
  
  // Crea CSV combinato
  const today = new Date();
  const timestamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const sections = [userInfoCSV, balancesCSV, incomesCSV];
  if (detailedBalancesCSV) sections.push(detailedBalancesCSV);
  if (detailedIncomesCSV) sections.push(detailedIncomesCSV);
  if (detailedOutflowsCSV) sections.push(detailedOutflowsCSV);
  if (demographicsCSV) sections.push(demographicsCSV);
  if (categoryCSV) sections.push(categoryCSV);
  if (monthlyStatsCSV) sections.push(monthlyStatsCSV);
  
  const combinedCSV = sections.join('\n\n');
  
    // Download
    const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `pacifinance_complete_data_${timestamp}.csv`);
  } catch (error) {
    console.error('Errore durante l\'export CSV:', error);
    throw new Error('Impossibile generare il file CSV: ' + error.message);
  }
};

// Export in formato Excel
export const exportToExcel = async (userData, language) => {
  try {
    const data = prepareUserDataForExport(userData, language);
    
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
  userInfoWS.getRow(1).font = { bold: true };
  userInfoWS.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF079164' }
  };
  userInfoWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  
  // Auto-size columns
  userInfoHeaders.forEach((header, index) => {
    const column = userInfoWS.getColumn(index + 1);
    column.width = Math.max(header.length, 15);
  });
  
  // Foglio 2: Bilanci Mensili
  const balancesWS = workbook.addWorksheet('Monthly Balances');
  if (data.balances.length > 0) {
    const balanceHeaders = Object.keys(data.balances[0]);
    balancesWS.addRow(balanceHeaders);
    
    // Stile headers
    balancesWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    balancesWS.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF079164' }
    };
    
    // Aggiungi dati
    data.balances.forEach(balance => {
      balancesWS.addRow(Object.values(balance));
    });
    
    // Auto-size columns
    balanceHeaders.forEach((header, index) => {
      const column = balancesWS.getColumn(index + 1);
      column.width = Math.max(header.length, 12);
    });
  }
  
  // Foglio 3: Entrate Mensili
  const incomesWS = workbook.addWorksheet('Monthly Incomes');
  const incomesHeaders = ['Month', 'Amount'];
  incomesWS.addRow(incomesHeaders);
  
  // Stile headers
  incomesWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  incomesWS.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF079164' }
  };
  
  data.monthlyData.incomes.forEach((amount, index) => {
    incomesWS.addRow([`Month ${index + 1}`, amount || 0]);
  });
  
  // Auto-size columns
  incomesWS.getColumn(1).width = 15;
  incomesWS.getColumn(2).width = 15;
  
  // Foglio 4: Uscite Mensili
  const outflowsWS = workbook.addWorksheet('Monthly Outflows');
  const outflowsHeaders = ['Month', 'Amount'];
  outflowsWS.addRow(outflowsHeaders);
  
  // Stile headers
  outflowsWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  outflowsWS.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF079164' }
  };
  
  data.monthlyData.outflows.forEach((amount, index) => {
    outflowsWS.addRow([`Month ${index + 1}`, amount || 0]);
  });
  
  // Auto-size columns
  outflowsWS.getColumn(1).width = 15;
  outflowsWS.getColumn(2).width = 15;
  
  // Foglio 5: Spese per Categoria (se disponibili)
  if (data.categoryExpenses && data.categoryExpenses.length > 0) {
    const categoryWS = workbook.addWorksheet('Category Expenses');
    const categoryHeaders = Object.keys(data.categoryExpenses[0]);
    categoryWS.addRow(categoryHeaders);
    
    // Stile headers
    categoryWS.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    categoryWS.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF079164' }
    };
    
    // Aggiungi dati
    data.categoryExpenses.forEach(monthData => {
      categoryWS.addRow(Object.values(monthData));
    });
    
    // Auto-size columns
    categoryHeaders.forEach((header, index) => {
      const column = categoryWS.getColumn(index + 1);
      column.width = Math.max(header.length, 12);
    });
  }
  
  // Foglio 6: Bilanci Dettagliati
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
  
  // Foglio 7: Dettagli Entrate
  if (data.detailedIncomes && data.detailedIncomes.length > 0) {
    const incomesDetailWS = workbook.addWorksheet('Income Details');
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
  
  // Foglio 8: Dettagli Uscite  
  if (data.detailedOutflows && data.detailedOutflows.length > 0) {
    const outflowsDetailWS = workbook.addWorksheet('Outflow Details');
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
export const exportToJSON = (userData, language) => {
  try {
    const data = prepareUserDataForExport(userData, language);
  
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

// Export in formato PDF (documento leggibile)
export const exportToPDF = async (userData, language) => {
  try {
    // Questa funzione richiederà una libreria PDF come jsPDF
    // Per ora creiamo un documento HTML che può essere stampato come PDF
    const data = prepareUserDataForExport(userData, language);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Pacifinance - Complete Data Export</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #079164; }
            h2 { color: #333; border-bottom: 2px solid #079164; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #079164; color: white; }
            .section { margin: 30px 0; }
        </style>
    </head>
    <body>
        <h1>Pacifinance - Complete Data Export</h1>
        <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <div class="section">
            <h2>User Information</h2>
            <table>
                <tr><th>Field</th><th>Value</th></tr>
                ${Object.entries(data.userInfo).map(([key, value]) => 
                  `<tr><td>${key}</td><td>${value}</td></tr>`
                ).join('')}
            </table>
        </div>
        
        <div class="section">
            <h2>Monthly Balances</h2>
            <table>
                <tr>
                    <th>Month</th><th>Bank</th><th>Cash</th><th>Digital Services</th>
                    <th>Stocks</th><th>ETF</th><th>Bitcoin</th><th>Crypto</th>
                    <th>Bonds</th><th>Funds</th><th>Gold</th><th>Total</th>
                </tr>
                ${data.balances.map(balance => `
                    <tr>
                        <td>${balance.month}</td>
                        <td>€${balance.bank.toLocaleString()}</td>
                        <td>€${balance.cash.toLocaleString()}</td>
                        <td>€${balance.digitalServices.toLocaleString()}</td>
                        <td>€${balance.stocks.toLocaleString()}</td>
                        <td>€${balance.etf.toLocaleString()}</td>
                        <td>€${balance.bitcoin.toLocaleString()}</td>
                        <td>€${balance.crypto.toLocaleString()}</td>
                        <td>€${balance.bonds.toLocaleString()}</td>
                        <td>€${balance.funds.toLocaleString()}</td>
                        <td>€${balance.gold.toLocaleString()}</td>
                        <td><strong>€${balance.total.toLocaleString()}</strong></td>
                    </tr>
                `).join('')}
            </table>
        </div>
        
        <div class="section">
            <h2>Monthly Income & Outflow Summary</h2>
            <table>
                <tr><th>Month</th><th>Income</th><th>Outflow</th><th>Net</th></tr>
                ${data.monthlyData.incomes.map((income, index) => {
                  const outflow = data.monthlyData.outflows[index] || 0;
                  const net = income - outflow;
                  return `
                    <tr>
                        <td>Month ${index + 1}</td>
                        <td style="color: #079164;">€${income.toLocaleString()}</td>
                        <td style="color: #dc3545;">€${outflow.toLocaleString()}</td>
                        <td style="color: ${net >= 0 ? '#079164' : '#dc3545'}; font-weight: bold;">
                            €${net.toLocaleString()}
                        </td>
                    </tr>
                  `;
                }).join('')}
            </table>
        </div>
        
        ${data.detailedIncomes && data.detailedIncomes.length > 0 ? `
        <div class="section">
            <h2>Income Transaction Summary</h2>
            <p><strong>Total Income Transactions:</strong> ${data.detailedIncomes.length}</p>
            <p><strong>Total Income Amount:</strong> €${data.detailedIncomes.reduce((sum, income) => sum + income.amount, 0).toLocaleString()}</p>
            <p><strong>Average per Transaction:</strong> €${Math.round(data.detailedIncomes.reduce((sum, income) => sum + income.amount, 0) / data.detailedIncomes.length).toLocaleString()}</p>
            <table style="margin-top: 15px;">
                <tr><th>Date</th><th>Amount</th><th>Category</th><th>Payment Type</th><th>Notes</th></tr>
                ${data.detailedIncomes.slice(0, 10).map(income => `
                    <tr>
                        <td>${income.date}</td>
                        <td style="color: #079164; font-weight: bold;">€${income.amount.toLocaleString()}</td>
                        <td>${income.categoryTag}</td>
                        <td>${income.paymentType}</td>
                        <td style="max-width: 200px; font-size: 0.9em;">${income.notes}</td>
                    </tr>
                `).join('')}
                ${data.detailedIncomes.length > 10 ? `<tr><td colspan="5" style="text-align: center; font-style: italic;">... and ${data.detailedIncomes.length - 10} more transactions</td></tr>` : ''}
            </table>
        </div>
        ` : ''}
        
        ${data.detailedOutflows && data.detailedOutflows.length > 0 ? `
        <div class="section">
            <h2>Outflow Transaction Summary</h2>
            <p><strong>Total Outflow Transactions:</strong> ${data.detailedOutflows.length}</p>
            <p><strong>Total Outflow Amount:</strong> €${data.detailedOutflows.reduce((sum, outflow) => sum + outflow.amount, 0).toLocaleString()}</p>
            <p><strong>Average per Transaction:</strong> €${Math.round(data.detailedOutflows.reduce((sum, outflow) => sum + outflow.amount, 0) / data.detailedOutflows.length).toLocaleString()}</p>
            <table style="margin-top: 15px;">
                <tr><th>Date</th><th>Amount</th><th>Category</th><th>Payment Type</th><th>Notes</th></tr>
                ${data.detailedOutflows.slice(0, 10).map(outflow => `
                    <tr>
                        <td>${outflow.date}</td>
                        <td style="color: #dc3545; font-weight: bold;">€${outflow.amount.toLocaleString()}</td>
                        <td>${outflow.categoryTag}</td>
                        <td>${outflow.paymentType}</td>
                        <td style="max-width: 200px; font-size: 0.9em;">${outflow.notes}</td>
                    </tr>
                `).join('')}
                ${data.detailedOutflows.length > 10 ? `<tr><td colspan="5" style="text-align: center; font-style: italic;">... and ${data.detailedOutflows.length - 10} more transactions</td></tr>` : ''}
            </table>
        </div>
        ` : ''}

        ${data.demographics && Object.keys(data.demographics).length > 0 ? `
        <div class="section">
            <h2>Demographics & Performance</h2>
            <table>
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Balance Rank</td><td>${data.demographics.percentageRankOnBalance}% (Top performers)</td></tr>
                <tr><td>Income Rank</td><td>${data.demographics.percentageRankOnIncomes}% (Top performers)</td></tr>
                <tr><td>Expense Control Rank</td><td>${data.demographics.percentageRankOnExpenses}% (Better than average)</td></tr>
                <tr><td>Current Balance</td><td><strong>€${data.demographics.currentBalance.toLocaleString()}</strong></td></tr>
                <tr><td>Previous Month Balance</td><td>€${data.demographics.previousMonthBalance.toLocaleString()}</td></tr>
                <tr><td>Previous Year Balance</td><td>€${data.demographics.previousYearBalance.toLocaleString()}</td></tr>
            </table>
        </div>
        ` : ''}
    </body>
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

// Funzione helper per convertire array di oggetti in CSV
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