import React, { createContext, useContext, useState } from 'react';
import { LanguageContext } from './LanguageContext';
import it from '../i18n/locales/it.json';
import en from '../i18n/locales/en.json';


const MockAuthContext = createContext();

export const useMockAuth = () => {
    const context = useContext(MockAuthContext);
    if (!context) {
        throw new Error('useMockAuth must be used within a MockAuthProvider');
    }
    return context;
};

// ── Helper: build a tag object from i18n keys ──
// Generates { index, label, type? } like the real API: tags no longer carry a
// translations field, display now goes through translateTag/i18n via the label.
const buildTag = (label, type, index) => ({
    index,
    label,
    ...(type !== undefined ? { type } : {})
});

// ── Expense tags from i18n ──
const expenseKeys = Object.keys(en.tags.expense);
const outflowsTags = expenseKeys.map((key, i) =>
    buildTag(key, 0, key === 'other' ? 9999 : i + 1)
);

// ── Income tags from i18n ──
const incomeKeys = Object.keys(en.tags.income);
const incomesTags = incomeKeys.map((key, i) =>
    buildTag(key, 1, key === 'other' ? 9999 : i)
);

// ── Payment tags from i18n ──
const paymentKeys = Object.keys(en.tags.payment);
const paymentTags = paymentKeys.map((key, i) => ({
    index: i,
    label: key
}));

// ── Profile tag helpers ──
const buildProfileTag = (label, section, index) => ({
    index,
    label
});

const buildProfileTags = (section) =>
    Object.keys(en.tags[section] || {}).map((key, i) => buildProfileTag(key, section, i));

// ── Helper: get outflow tag object by label ──
const getOutflowTag = (label) => outflowsTags.find(t => t.label === label) || outflowsTags[0];
const getPaymentTag = (label) => paymentTags.find(t => t.label === label) || paymentTags[0];

// Mock data compatible with the UserContext structure
export const mockUserData = {
    // Core user info (same as UserContext)
    userId: 'dev-user-123',
    userType: 'premium',
    username: 'Developer User',
    
    // Currency preference resolved from DB (preferredCurrency index → code via currency tags)
    currency: 'EUR',

    // Badge IDs already notified — see useAchievementNotifications
    seenBadges: [],

    // Elevated permission to moderate community-submitted historical prices — see getIsAdmin
    isAdmin: false,

    activity: {
        investmentTransactions: [],
        communityPriceSubmissions: [],
    },

    // User profile data (same as UserContext) — values from i18n
    profile: {
        nationality: { key: 107, value: it.tags.country?.['italy'] || 'Italia' },
        whereWorks: { key: 107, value: it.tags.country?.['italy'] || 'Italia' },
        job: { key: 1, value: it.tags.job['information technology'] },
        jobType: { key: 0, value: it.tags.jobType['employee'] },
        workTime: { key: 1, value: it.tags.workTime['full time'] },
        remoteType: { key: 1, value: it.tags.remoteType['hybrid'] },
        age: { key: 1, value: '26-35' },
        livingSituation: { key: 1, value: it.tags.livingSituation['in-a-relationship'] },
        housingType: { key: 0, value: it.tags.housingType['rental-appartment'] },
        children: { key: 1, value: it.tags.children['no'] },
        yearsOfExperience: { key: 2, value: it.tags.yearsOfExperience['4-5-years'] },
        preferredCurrency: { key: 0, value: 'EUR' }
    },
    
    // Balance data structured like UserContext
    balances: [
        // Current month [0]
        {
            date: new Date().toISOString(),
            balance: {
                cash: 500,
                bank: 20000,
                digitalServices: 0,
                emergencyFund: 5000,
                stocks: 8000,
                etf: 25000,
                bitcoin: 0,
                crypto: 0,
                bonds: 15000,
                funds: 12500,
                commodities: 8000,
                totalValue: 94000
            }
        },
        // Mese precedente [1]
        {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            balance: {
                cash: 450,
                bank: 18500,
                digitalServices: 0,
                emergencyFund: 4500,
                stocks: 7500,
                etf: 24000,
                bitcoin: 0,
                crypto: 0,
                bonds: 14000,
                funds: 11800,
                commodities: 7500,
                totalValue: 88250
            }
        },
        // Remaining months up to [12] for the previous year
        ...Array.from({ length: 11 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (i + 2));
            return {
                date: date.toISOString(),
                balance: {
                    cash: 300 + Math.random() * 200,
                    bank: 15000 + Math.random() * 3000,
                    digitalServices: Math.random() * 100,
                    emergencyFund: 3000 + Math.random() * 1000,
                    stocks: 5000 + Math.random() * 2000,
                    etf: 20000 + Math.random() * 3000,
                    bitcoin: Math.random() * 1000,
                    crypto: Math.random() * 500,
                    bonds: 10000 + Math.random() * 3000,
                    funds: 9000 + Math.random() * 2000,
                    commodities: 6000 + Math.random() * 1500,
                    totalValue: 68300 + Math.random() * 10000
                }
            };
        })
    ],
    
    // Expense and income data (same as UserContext)
    outflows: {
        allOutflows: (() => {
            // Generate 12 months of outflow transactions with recurring patterns
            // Tags are derived from i18n files (see top of file)
            const categories = [
                getOutflowTag('house'),
                getOutflowTag('food'),
                getOutflowTag('transports'),
                getOutflowTag('free time'),
                getOutflowTag('shopping'),
                getOutflowTag('investment'),
                getOutflowTag('health')
            ];
            const pmtTypes = [
                getPaymentTag('single payment'),
                getPaymentTag('subscription'),
                getPaymentTag('installment'),
                getPaymentTag('periodic payment')
            ];
            // Recurring outflows that appear every month (detectable by the algorithm)
            const recurringTemplates = [
                { category: categories[0], payment: pmtTypes[1], amount: 650, notes: 'Affitto' },       // house + subscription
                { category: categories[0], payment: pmtTypes[1], amount: 15, notes: 'Netflix' },         // house + subscription
                { category: categories[0], payment: pmtTypes[1], amount: 10, notes: 'Spotify' },         // house + subscription
                { category: categories[2], payment: pmtTypes[3], amount: 35, notes: 'Abbonamento treno' }, // transports + periodic
                { category: categories[5], payment: pmtTypes[3], amount: 200, notes: 'PAC ETF' },        // investment + periodic
                { category: categories[6], payment: pmtTypes[1], amount: 45, notes: 'Palestra' },        // health + subscription
            ];
            const months = [];
            const now = new Date();
            let nextOutflowId = 1;
            for (let m = 0; m < 12; m++) {
                const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
                const year = d.getFullYear();
                const month = d.getMonth();
                const txs = [];
                // Add recurring outflows (small amount jitter ±5)
                recurringTemplates.forEach(tpl => {
                    const jitter = Math.floor(Math.random() * 11) - 5;
                    txs.push({
                        id: nextOutflowId++,
                        date: new Date(year, month, Math.floor(Math.random() * 27) + 1).toISOString().split('T')[0],
                        amount: Math.max(tpl.amount + jitter, 8),
                        categoryTag: tpl.category,
                        paymentType: tpl.payment,
                        notes: tpl.notes,
                        isExpense: true,
                        // Balance source recorded at insert time (mirrors server toExpense shape)
                        balanceAssetKey: 'bank',
                        balanceDetailType: null,
                        balanceDetailId: null
                    });
                });
                // Add 10-18 random one-off transactions
                const n = Math.floor(Math.random() * 9) + 10;
                for (let i = 0; i < n; i++) {
                    txs.push({
                        id: nextOutflowId++,
                        date: new Date(year, month, Math.floor(Math.random() * 27) + 1).toISOString().split('T')[0],
                        amount: Math.floor(Math.random() * 200) + 15,
                        categoryTag: categories[Math.floor(Math.random() * categories.length)],
                        paymentType: pmtTypes[Math.floor(Math.random() * pmtTypes.length)],
                        isExpense: true,
                        // No source recorded — exercises the "no prefill" delete path
                        balanceAssetKey: null,
                        balanceDetailType: null,
                        balanceDetailId: null
                    });
                }
                months.push(txs);
            }
            return months;
        })(),
        outflowsArray: [2100, 1950, 2200, 1800, 2300, 1750, 2150, 1900, 2050, 1850, 2250, 1700, 2000],
        // Keys MUST match the EN translations from i18n (same as aggregateOutflowsByCategory output)
        totalOutflowsPerCategoryPerMonth: (() => {
            const H = en.tags.expense['house'];           // "Home"
            const F = en.tags.expense['food'];            // "Groceries"
            const T = en.tags.expense['transports'];      // "Transport"
            const L = en.tags.expense['free time'];       // "Leisure"
            const S = en.tags.expense['shopping'];        // "Shopping"
            const I = en.tags.expense['investment'];      // "Investment"
            const W = en.tags.expense['health'];          // "Health & Wellness"
            return {
                0:  { [H]: 800, [F]: 600, [T]: 400, [L]: 300, [S]: 350, [I]: 200, [W]: 150 },
                1:  { [H]: 780, [F]: 550, [T]: 380, [L]: 280, [S]: 320, [I]: 180, [W]: 130 },
                2:  { [H]: 810, [F]: 620, [T]: 420, [L]: 310, [S]: 370, [I]: 220, [W]: 160 },
                3:  { [H]: 750, [F]: 580, [T]: 360, [L]: 260, [S]: 300, [I]: 160, [W]: 120 },
                4:  { [H]: 820, [F]: 640, [T]: 440, [L]: 320, [S]: 380, [I]: 240, [W]: 170 },
                5:  { [H]: 770, [F]: 560, [T]: 370, [L]: 270, [S]: 310, [I]: 170, [W]: 125 },
                6:  { [H]: 790, [F]: 610, [T]: 410, [L]: 290, [S]: 340, [I]: 210, [W]: 145 },
                7:  { [H]: 760, [F]: 570, [T]: 390, [L]: 275, [S]: 325, [I]: 190, [W]: 135 },
                8:  { [H]: 800, [F]: 590, [T]: 400, [L]: 295, [S]: 345, [I]: 205, [W]: 140 },
                9:  { [H]: 740, [F]: 540, [T]: 350, [L]: 250, [S]: 290, [I]: 155, [W]: 115 },
                10: { [H]: 830, [F]: 650, [T]: 450, [L]: 330, [S]: 390, [I]: 250, [W]: 175 },
                11: { [H]: 730, [F]: 530, [T]: 340, [L]: 240, [S]: 280, [I]: 145, [W]: 110 }
            };
        })()
    },
    
    // Custom sub-categories (see /categories/* API) — empty in mock mode
    customCategories: [],

    incomes: {
        allIncomes: [
            // Current month [0] - array of income transactions
            [
                {
                    id: 1,
                    date: new Date().toISOString().split('T')[0],
                    amount: 2800,
                    categoryTag: incomesTags.find(t => t.label === 'salary') || incomesTags[0],
                    isExpense: false,
                    balanceAssetKey: 'bank',
                    balanceDetailType: null,
                    balanceDetailId: null
                }
            ]
        ],
        incomesArray: [2800, 2750, 2900, 2650, 2850, 2700, 2800, 2750, 2900, 2650, 2850, 2700, 2600]
    },
    preYearSameMonthDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preMonthDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Date helper (added for compatibility)
    currentDate: new Date().toISOString().split('T')[0],

    // Legacy arrays for direct compatibility with userData
    outflowsArray: [2100, 1950, 2200, 1800, 2300, 1750, 2150, 1900, 2050, 1850, 2250, 1700, 2000],
    incomesArray: [2800, 2750, 2900, 2650, 2850, 2700, 2800, 2750, 2900, 2650, 2850, 2700, 2600],

    // Tags for categories (same as UserContext) — derived from i18n files
    tags: {
        outflowsTags,
        incomesTags,
        paymentTags,
        nationalityTags: buildProfileTags('country'),
        jobTags: buildProfileTags('job'),
        jobTypeTags: buildProfileTags('jobType'),
        workTimeTags: buildProfileTags('workTime'),
        remoteTypeTags: buildProfileTags('remoteType'),
        ageTags: buildProfileTags('age'),
        livingSituationTags: buildProfileTags('livingSituation'),
        housingTypeTags: buildProfileTags('housingType'),
        childrenTags: buildProfileTags('children'),
        yearsOfExperienceTags: buildProfileTags('yearsOfExperience'),
        currencyTags: [
            { label: "eur", index: 0, type: 13 },
            { label: "usd", index: 1, type: 13 },
            { label: "gbp", index: 2, type: 13 },
            { label: "chf", index: 3, type: 13 },
            { label: "jpy", index: 4, type: 13 }
        ]
    },
    
    // Data for the last-12-months charts
    last12MonthsData: Array.from({ length: 12 }, (_, i) => {
        const baseDate = new Date();
        baseDate.setMonth(baseDate.getMonth() - (11 - i));
        const isCurrentMonth = i === 11; // Last element = current month
        
        return {
            month: baseDate.toISOString().split('T')[0].slice(0, 7),
            totalValue: 40000 + Math.sin(i * 0.5) * 10000 + Math.random() * 5000,
            cashValue: isCurrentMonth ? 500 : 400 + Math.random() * 200,
            bankValue: isCurrentMonth ? 20000 : 18000 + Math.sin(i * 0.6) * 5000,
            stocksValue: isCurrentMonth ? 8000 : 7000 + Math.sin(i * 0.7) * 2000,
            etfValue: isCurrentMonth ? 25000 : 23000 + Math.sin(i * 0.8) * 3000,
            bitcoinValue: Math.random() * 1000,
            cryptoValue: Math.random() * 500,
            digitalServicesValue: isCurrentMonth ? 0 : Math.random() * 100,
            bondsValue: isCurrentMonth ? 15000 : Math.max(0, 8000 + (i * 800) + Math.random() * 1000),
            fundsValue: isCurrentMonth ? 12500 : Math.max(0, 6000 + (i * 600) + Math.random() * 800),
            commoditiesValue: isCurrentMonth ? 8000 : Math.max(0, 3000 + (i * 450) + Math.random() * 600),
            emergencyFund: isCurrentMonth ? 5000 : Math.max(2000, 4000 - (i * 100) + Math.random() * 500)
        };
    }),
    
    // Ranking data for the comparison page
    rankings: {
        balance: Math.floor(Math.random() * 40) + 60, // 60-100%
        incomes: Math.floor(Math.random() * 35) + 55, // 55-90%
        outflows: Math.floor(Math.random() * 50) + 25, // 25-75%
        balanceSimilar: Math.floor(Math.random() * 30) + 65, // 65-95%
        incomesSimilar: Math.floor(Math.random() * 25) + 60, // 60-85%
        outflowsSimilar: Math.floor(Math.random() * 40) + 30 // 30-70%
    },
    
    // Goals and limits for Financial Insights
    goals: [
        { 
            id: 1, 
            name: 'Fondo Emergenza', 
            target: 15000, 
            current: 5000,
            deadline: '2025-12-31', 
            type: 'emergencyFund'
        },
        { 
            id: 2, 
            name: 'Vacanze Estate 2025', 
            target: 4000, 
            current: 2200, 
            deadline: '2025-06-30', 
            type: 'savings' 
        },
        { 
            id: 3, 
            name: 'Nuovo MacBook Pro', 
            target: 3500, 
            current: 1800, 
            deadline: '2025-04-15', 
            type: 'purchase' 
        }
    ],
    
    limits: {
        monthlySpendingLimit: 2800,
        monthlySpendingLimitEnabled: true,
        savingsGoalPercentage: 25,
        savingsGoalPercentageEnabled: true,
        emergencyFundTarget: 15000,
        emergencyFundTargetEnabled: true,
        expensesLimitPercent: 65,
        expensesLimitPercentEnabled: true,
        savingsAmountGoal: 500,
        savingsAmountGoalEnabled: true,
        emergencyFundMonths: 6,
        emergencyFundMonthsEnabled: true,
        fixedExpensesPercent: 50,
        categorySpendingLimits: {},
        debtReductionGoal: null,
        positionConcentrationLimit: 25,
        assetCategoryConcentrationLimit: 60,
        annualPassiveIncomeGoal: 1200,
        notificationsEnabled: true
    },
    
    // Assets for Financial Insights
    assets: [
        { typology: 'cash', value: 500, date: new Date().toISOString().split('T')[0] },
        { typology: 'bank', value: 20000, date: new Date().toISOString().split('T')[0] },
        { typology: 'stocks', value: 8000, date: new Date().toISOString().split('T')[0] },
        { typology: 'etf', value: 25000, date: new Date().toISOString().split('T')[0] },
        { typology: 'bonds', value: 15000, date: new Date().toISOString().split('T')[0] },
        { typology: 'funds', value: 12500, date: new Date().toISOString().split('T')[0] },
        { typology: 'commodities', value: 8000, date: new Date().toISOString().split('T')[0] }
    ],
    
    // On by default so the Comparison page renders fully in local dev too.
    benchmarkConsent: true,

    // Averages data from /stats/averages API
    // `benchmark` mirrors server/src/cache/items/averages.ts's BenchmarkMetadata
    // shape - Comparison.tsx needs populationSize/cohortSizes/minimumCohortSize
    // from it to treat a comparison as "available".
    averages: {
        all: {
            balances: 5591.08,
            expenses: 913.77,
            incomes: 2506.34,
            savingsRates: 0,
            assetAllocation: { liquid: 46, investments: 42, crypto: 12 },
            expensesByCategory: {
                1: 120, 2: 80, 3: 350, 4: 450, 5: 600,
                6: 200, 7: 150, 8: 500, 9: 100, 10: 50,
                11: 300, 12: 80, 13: 0, 14: 60, 15: 120, 9999: 40
            },
            benchmark: {
                generatedAt: new Date().toISOString(),
                populationSize: 1284,
                minimumCohortSize: 20,
                cohortSizes: { balances: 1284, incomes: 1284, expenses: 1284, savingsRates: 1284 },
                averageSimilarity: { balances: null, incomes: null, expenses: null, savingsRates: null }
            }
        },
        similar: {
            balances: 36859.20,
            expenses: 1357.91,
            incomes: 2506.34,
            savingsRates: 37.0,
            assetAllocation: { liquid: 38, investments: 50, crypto: 12 },
            expensesByCategory: {
                1: 235, 2: 437, 3: 3024, 4: 1978, 5: 2348,
                6: 1571, 7: 1037, 8: 3902, 9: 674, 10: 52,
                11: 2431, 12: 165, 13: 0, 14: 178, 15: 868, 9999: 105
            },
            benchmark: {
                generatedAt: new Date().toISOString(),
                populationSize: 214,
                minimumCohortSize: 20,
                cohortSizes: { balances: 41, incomes: 46, expenses: 38, savingsRates: 44 },
                averageSimilarity: { balances: 0.74, incomes: 0.71, expenses: 0.69, savingsRates: 0.7 }
            }
        }
    },
    
    // Date references structured like UserContext
    dates: {
        current: new Date().toISOString(),
        preMonth: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        preYearSameMonth: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    
    // User info mock
    user: {
        _id: 'mock_user_id',
        email: 'test@example.com',
        username: 'testuser',
        settings: {
            currency: '€',
            language: 'it',
            theme: 'light'
        }
    }
};

export const MockAuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isUpdated, setIsUpdated] = useState(true);
    const [isLoading] = useState(false);
    useContext(LanguageContext);
    
    const [, setUserData] = useState(mockUserData);

    const handleSetIsAuthenticated = (value) => {
        setIsAuthenticated(value);
    };

    const handleSetIsUpdated = (value) => {
        setIsUpdated(value);
    };

    // Mock functions for compatibility with AppRouter
    const loadUserData = () => {
        handleSetIsUpdated(false);
    };

    const value = {
        userData: mockUserData,
        setUserData,
        isAuthenticated,
        isUpdated,
        handleSetIsAuthenticated,
        handleSetIsUpdated,
        isLoading,
        loadUserData,
        isDevelopment: true // Flag to distinguish mock from production
    };

    return (
        <MockAuthContext.Provider value={value}>
            {children}
        </MockAuthContext.Provider>
    );
};

export default MockAuthContext; 
