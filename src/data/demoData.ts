/**
 * Demo Data Generator — produces rich, realistic financial data
 * for the demo account, entirely client-side.
 *
 * All dates are dynamically computed relative to the current date,
 * so the data always appears fresh and covers the last 13 months.
 *
 * @module data/demoData
 */

// ─── Helpers ─────────────────────────────────────────────────────────

/** Seed-based pseudo-random number generator for deterministic data */
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/** Get a full date string (YYYY-MM-DD) for a specific day in a month offset */
const getDateStr = (offset = 0, day = 1) => {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const safeDay = Math.min(day, maxDay);
  d.setDate(safeDay);
  return d.toISOString().split('T')[0];
};

/** Get ISO date for a month offset */
const getMonthISO = (offset = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  d.setDate(15);
  return d.toISOString();
};

// ─── Category Definitions ────────────────────────────────────────────

const OUTFLOW_CATEGORIES = [
  { index: 5, label: 'house', translations: { it: 'Casa', en: 'House' } },
  { index: 4, label: 'food', translations: { it: 'Alimentari', en: 'Food' } },
  { index: 12, label: 'transports', translations: { it: 'Trasporto', en: 'Transports' } },
  { index: 6, label: 'free time', translations: { it: 'Divertimento', en: 'Free time' } },
  { index: 3, label: 'shopping', translations: { it: 'Shopping', en: 'Shopping' } },
  { index: 8, label: 'investment', translations: { it: 'Investimento', en: 'Investment' } },
  { index: 9, label: 'health', translations: { it: 'Salute e benessere', en: 'Health' } },
  { index: 1, label: 'digital service', translations: { it: 'Servizio digitale', en: 'Digital service' } },
  { index: 7, label: 'travelling', translations: { it: 'Viaggio', en: 'Travelling' } },
  { index: 11, label: 'vehicle', translations: { it: 'Veicolo', en: 'Vehicle' } },
];

const INCOME_CATEGORIES = [
  { index: 0, label: 'salary', translations: { it: 'Stipendio', en: 'Salary' } },
  { index: 1, label: 'freelance income', translations: { it: 'Reddito freelance', en: 'Freelance income' } },
  { index: 2, label: 'extra income', translations: { it: 'Entrata extra', en: 'Extra income' } },
];

const PAYMENT_TYPES = [
  { index: 1, label: 'single payment', translations: { it: 'Pagamento singolo', en: 'Single Payment' } },
  { index: 2, label: 'subscription', translations: { it: 'Abbonamento', en: 'Subscription' } },
  { index: 3, label: 'installment', translations: { it: 'Rata', en: 'Installment' } },
  { index: 4, label: 'periodic payment', translations: { it: 'Pagamento periodico', en: 'Periodic payment' } },
];

// ─── Balance Generator ───────────────────────────────────────────────

/**
 * Generate realistic balance data for 13 months.
 * Shows a clear growth trend to demonstrate platform value.
 */
const generateBalances = () => {
  const balances = [];

  // Base values for month 12 (oldest) — starting point
  const baseValues = {
    cash: 350, bank: 12000, digitalServices: 50, emergencyFund: 2500,
    stocks: 3500, etf: 15000, bitcoin: 800, crypto: 200,
    bonds: 8000, funds: 7000, commodities: 4000,
  };

  // Monthly growth factors (show positive trend)
  const growth = {
    cash: 15, bank: 650, digitalServices: 2, emergencyFund: 200,
    stocks: 380, etf: 850, bitcoin: 50, crypto: 15,
    bonds: 550, funds: 460, commodities: 340,
  };

  // Slight variation per month (deterministic based on month index)
  for (let i = 12; i >= 0; i--) {
    const monthIndex = 12 - i; // 0 = oldest, 12 = current
    const rng = seededRandom(monthIndex * 137 + 42);

    const balance = {};
    for (const [key, base] of Object.entries(baseValues)) {
      const g = growth[key];
      const variation = (rng() - 0.3) * g * 0.6; // Slight noise, biased up
      balance[key] = Math.round(base + g * monthIndex + variation);
    }

    // Compute total
    balance.totalValue = Object.values(balance).reduce((s, v) => s + v, 0);

    balances.push({
      date: getMonthISO(i),
      balance,
    });
  }

  return balances;
};

// ─── Transactions Generator ──────────────────────────────────────────

/**
 * Generate realistic outflow transactions for a given month offset.
 * Returns 18-30 transactions with realistic category distribution.
 */
const generateOutflowsForMonth = (monthOffset) => {
  const rng = seededRandom(monthOffset * 251 + 73);
  const numTransactions = Math.floor(rng() * 13) + 18; // 18-30
  const transactions = [];

  // Category weights (house and food are most common)
  const categoryWeights = [
    { cat: OUTFLOW_CATEGORIES[0], weight: 0.18, minAmt: 600, maxAmt: 900 },   // house
    { cat: OUTFLOW_CATEGORIES[1], weight: 0.22, minAmt: 30, maxAmt: 120 },    // food
    { cat: OUTFLOW_CATEGORIES[2], weight: 0.12, minAmt: 20, maxAmt: 80 },     // transports
    { cat: OUTFLOW_CATEGORIES[3], weight: 0.10, minAmt: 15, maxAmt: 150 },    // free time
    { cat: OUTFLOW_CATEGORIES[4], weight: 0.10, minAmt: 20, maxAmt: 200 },    // shopping
    { cat: OUTFLOW_CATEGORIES[5], weight: 0.08, minAmt: 100, maxAmt: 500 },   // investment
    { cat: OUTFLOW_CATEGORIES[6], weight: 0.06, minAmt: 10, maxAmt: 100 },    // health
    { cat: OUTFLOW_CATEGORIES[7], weight: 0.05, minAmt: 5, maxAmt: 30 },      // digital service
    { cat: OUTFLOW_CATEGORIES[8], weight: 0.05, minAmt: 50, maxAmt: 400 },    // travelling
    { cat: OUTFLOW_CATEGORIES[9], weight: 0.04, minAmt: 30, maxAmt: 150 },    // vehicle
  ];

  for (let i = 0; i < numTransactions; i++) {
    // Pick category weighted
    const r = rng();
    let selectedCat = categoryWeights[0];
    let cumWeight = 0;
    for (const cw of categoryWeights) {
      cumWeight += cw.weight;
      if (r <= cumWeight) { selectedCat = cw; break; }
    }

    const day = Math.floor(rng() * 28) + 1;
    const amount = Math.round(selectedCat.minAmt + rng() * (selectedCat.maxAmt - selectedCat.minAmt));
    const paymentType = PAYMENT_TYPES[Math.floor(rng() * PAYMENT_TYPES.length)];

    transactions.push({
      date: getDateStr(monthOffset, day),
      amount,
      categoryTag: selectedCat.cat,
      paymentType,
      isExpense: true,
    });
  }

  return transactions;
};

/**
 * Generate income transactions for a given month offset.
 * Always includes salary + occasional extras.
 */
const generateIncomesForMonth = (monthOffset) => {
  const rng = seededRandom(monthOffset * 397 + 19);
  const transactions = [];

  // Main salary (always present)
  transactions.push({
    date: getDateStr(monthOffset, 27),
    amount: Math.round(2700 + rng() * 400), // 2700-3100
    categoryTag: INCOME_CATEGORIES[0], // salary
    isExpense: false,
  });

  // Occasional freelance income (40% chance)
  if (rng() > 0.6) {
    transactions.push({
      date: getDateStr(monthOffset, Math.floor(rng() * 20) + 5),
      amount: Math.round(200 + rng() * 600), // 200-800
      categoryTag: INCOME_CATEGORIES[1], // freelance
      isExpense: false,
    });
  }

  // Occasional extra income (20% chance)
  if (rng() > 0.8) {
    transactions.push({
      date: getDateStr(monthOffset, Math.floor(rng() * 25) + 1),
      amount: Math.round(50 + rng() * 300), // 50-350
      categoryTag: INCOME_CATEGORIES[2], // extra
      isExpense: false,
    });
  }

  return transactions;
};

// ─── Full Data Generator ─────────────────────────────────────────────

/**
 * Generate the complete set of demo data matching the UserContext shape.
 * All data is deterministic (seeded random) and relative to the current date.
 *
 * @returns {Object} Complete userData-compatible structure
 */
export const generateDemoData = () => {
  // ── Balances ──
  const balances = generateBalances();

  // ── Transactions (13 months, index 0 = current month) ──
  const allOutflowsIncomesArray = [];
  for (let i = 0; i < 13; i++) {
    const outflows = generateOutflowsForMonth(i);
    const incomes = generateIncomesForMonth(i);
    allOutflowsIncomesArray.push([...outflows, ...incomes]);
  }

  // ── Derived data (same transformations as UserContext) ──
  const allOutflows = allOutflowsIncomesArray.map(m => m.filter(d => d.isExpense));
  const allIncomes = allOutflowsIncomesArray.map(m => m.filter(d => !d.isExpense));

  // Monthly totals
  const outflowsArray = allOutflowsIncomesArray.map(month =>
    month.filter(t => t.isExpense).reduce((s, t) => s + t.amount, 0)
  );
  const incomesArray = allOutflowsIncomesArray.map(month =>
    month.filter(t => !t.isExpense).reduce((s, t) => s + t.amount, 0)
  );

  // Outflows by category per month
  const totalOutflowsPerCategoryPerMonth = {};
  allOutflowsIncomesArray.forEach((month, index) => {
    const perCategory = {};
    month.forEach(entry => {
      if (entry.isExpense) {
        const key = entry.categoryTag?.translations?.en || entry.categoryTag?.label || 'Unknown';
        perCategory[key] = (perCategory[key] || 0) + entry.amount;
      }
    });
    totalOutflowsPerCategoryPerMonth[index] = perCategory;
  });

  // ── Chart data ──
  const currentDate = new Date();
  const last12MonthsData = balances.slice(0, 12).reverse().map((monthData, i) => {
    const monthOffset = 11 - i;
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
    const monthString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { ...monthData.balance, month: monthString, date: monthData.date };
  });

  // ── Assets from current balance ──
  const currentBalance = balances[0]?.balance || {};
  const assets = Object.entries(currentBalance)
    .filter(([key, val]) => key !== 'totalValue' && val > 0)
    .map(([key, val]) => ({ typology: key, value: val }));

  // ── Rankings (good scores to impress demo users) ──
  const rankings = {
    balance: 72,
    incomes: 65,
    outflows: 45,
    balanceSimilar: 78,
    incomesSimilar: 68,
    outflowsSimilar: 38,
  };

  // ── Averages ──
  const averages = {
    all: {
      balances: 5591,
      expenses: 914,
      incomes: 2506,
      savingsRates: 0,
      expensesByCategory: {
        1: 120, 2: 80, 3: 350, 4: 450, 5: 600,
        6: 200, 7: 150, 8: 500, 9: 100, 10: 50,
        11: 300, 12: 80, 13: 0, 14: 60, 15: 120, 9999: 40,
      },
    },
    similar: {
      balances: 36859,
      expenses: 1358,
      incomes: 2506,
      savingsRates: 37,
      expensesByCategory: {
        1: 235, 2: 437, 3: 3024, 4: 1978, 5: 2348,
        6: 1571, 7: 1037, 8: 3902, 9: 674, 10: 52,
        11: 2431, 12: 165, 13: 0, 14: 178, 15: 868, 9999: 105,
      },
    },
  };

  // ── Goals & Limits (feature in development — leave empty) ──
  const goals = [];
  const limits = {
    monthlySpendingLimit: null,
    savingsGoalPercentage: null,
    emergencyFundTarget: null,
    notificationsEnabled: false,
  };

  // ── Dates ──
  const now = new Date();
  const preMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const preYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  return {
    // Core user info
    userId: 'demo-user',
    userType: 'demo',
    username: 'PaciDemo',
    profileCompletionPercentage: 82,

    // Currency
    currency: 'EUR',

    // Profile
    profile: {
      nationality: { key: 107, value: 'Italia' },
      whereWorks: { key: 107, value: 'Italia' },
      job: { key: 1, value: 'Informatica' },
      jobType: { key: 0, value: 'Lavoro dipendente' },
      workTime: { key: 1, value: 'Full time' },
      remoteType: { key: 1, value: 'Ibrido' },
      age: { key: 1, value: '26-35' },
      livingSituation: { key: 1, value: 'In Coppia' },
      housingType: { key: 0, value: 'Appartamento in Affitto' },
      children: { key: 1, value: 'No' },
      yearsOfExperience: { key: 2, value: '4-5 anni' },
      completionPercentage: 82,
      preferredCurrency: { key: 0, value: 'EUR' },
    },

    // Financial data
    balances,
    last12MonthsData,
    expenses: { allOutflows, outflowsArray, totalOutflowsPerCategoryPerMonth },
    incomes: { allIncomes, incomesArray },
    rankings,
    goals,
    limits,
    assets,
    averages,

    // Dates
    dates: {
      current: now,
      preMonth,
      preYearSameMonth: preYear,
    },

    // Tags
    tags: {
      outflowsTags: [
        { index: 1, label: 'digital service', type: 0, translations: { it: 'Servizio digitale', en: 'Digital service' } },
        { index: 2, label: 'gift', type: 0, translations: { it: 'Regalo', en: 'Gift' } },
        { index: 3, label: 'shopping', type: 0, translations: { it: 'Shopping', en: 'Shopping' } },
        { index: 4, label: 'food', type: 0, translations: { it: 'Alimentari', en: 'Food' } },
        { index: 5, label: 'house', type: 0, translations: { it: 'Casa', en: 'House' } },
        { index: 6, label: 'free time', type: 0, translations: { it: 'Divertimento', en: 'Free time' } },
        { index: 7, label: 'travelling', type: 0, translations: { it: 'Viaggio', en: 'Travelling' } },
        { index: 8, label: 'investment', type: 0, translations: { it: 'Investimento', en: 'Investment' } },
        { index: 9, label: 'health', type: 0, translations: { it: 'Salute e benessere', en: 'Health' } },
        { index: 10, label: 'tax', type: 0, translations: { it: 'Tassa', en: 'Tax' } },
        { index: 11, label: 'vehicle', type: 0, translations: { it: 'Veicolo', en: 'Vehicle' } },
        { index: 12, label: 'transports', type: 0, translations: { it: 'Trasporto', en: 'Transports' } },
        { index: 13, label: 'pets', type: 0, translations: { it: 'Animali', en: 'Pets' } },
        { index: 14, label: 'personal project', type: 0, translations: { it: 'Progetto personale', en: 'Personal project' } },
        { index: 15, label: 'education', type: 0, translations: { it: 'Istruzione', en: 'Education' } },
        { index: 9999, label: 'other', type: 0, translations: { it: 'Altro', en: 'Other' } },
      ],
      incomesTags: [
        { index: 0, label: 'salary', type: 1, translations: { it: 'Stipendio', en: 'Salary' } },
        { index: 1, label: 'freelance income', type: 1, translations: { it: 'Reddito freelance', en: 'Freelance income' } },
        { index: 2, label: 'extra income', type: 1, translations: { it: 'Entrata extra', en: 'Extra income' } },
        { index: 3, label: 'gift', type: 1, translations: { it: 'Regalo', en: 'Gift' } },
        { index: 4, label: 'retirement', type: 1, translations: { it: 'Pensione', en: 'Retirement' } },
        { index: 9999, label: 'other', type: 1, translations: { it: 'Altro', en: 'Other' } },
      ],
      paymentTags: [
        { index: 0, label: 'none', translations: { it: 'Nessuno', en: 'None' } },
        { index: 1, label: 'single payment', translations: { it: 'Pagamento singolo', en: 'Single Payment' } },
        { index: 2, label: 'subscription', translations: { it: 'Abbonamento', en: 'Subscription' } },
        { index: 3, label: 'installment', translations: { it: 'Rata', en: 'Installment' } },
        { index: 4, label: 'periodic payment', translations: { it: 'Pagamento periodico', en: 'Periodic payment' } },
      ],
      nationalityTags: [],
      jobTags: [],
      jobTypeTags: [],
      workTimeTags: [],
      remoteTypeTags: [],
      ageTags: [],
      livingSituationTags: [],
      housingTypeTags: [],
      childrenTags: [],
      yearsOfExperienceTags: [],
      currencyTags: [
        { label: 'eur', index: 0, type: 13, translations: { it: 'EUR (€)', en: 'EUR (€)' } },
        { label: 'usd', index: 1, type: 13, translations: { it: 'USD ($)', en: 'USD ($)' } },
        { label: 'gbp', index: 2, type: 13, translations: { it: 'GBP (£)', en: 'GBP (£)' } },
        { label: 'chf', index: 3, type: 13, translations: { it: 'CHF', en: 'CHF' } },
        { label: 'jpy', index: 4, type: 13, translations: { it: 'JPY (¥)', en: 'JPY (¥)' } },
      ],
    },
  };
};
