import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageContext } from './LanguageContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';

const MockAuthContext = createContext();

export const useMockAuth = () => {
    const context = useContext(MockAuthContext);
    if (!context) {
        throw new Error('useMockAuth must be used within a MockAuthProvider');
    }
    return context;
};

// Mock data compatibili con UserContext structure
export const mockUserData = {
    // Core user info (come UserContext)
    userId: 'dev-user-123',
    userType: 'premium',
    username: 'Developer User',
    
    // User profile data (come UserContext)
    profile: {
        nationality: { key: 107, value: 'Italia' },
        whereWorks: { key: 107, value: 'Italia' },
        job: { key: 1, value: 'Informatica' },
        jobType: { key: 0, value: 'Lavoro dipendente' },
        workTime: { key: 1, value: 'Full time' },
        remoteType: { key: 1, value: 'Ibrido' }
    },
    
    // Balance data strutturata come UserContext
    balances: [
        // Mese corrente [0]
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
                gold: 8000,
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
                gold: 7500,
                totalValue: 88250
            }
        },
        // Altri mesi fino a [12] per anno precedente
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
                    gold: 6000 + Math.random() * 1500,
                    totalValue: 68300 + Math.random() * 10000
                }
            };
        })
    ],
    
    // Expense and income data (come UserContext)
    expenses: {
        allOutflows: [
            // Mese corrente [0] - array di transazioni
            (() => {
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();
                
                const transactions = [];
                const numTransactions = Math.floor(Math.random() * 11) + 15; // 15-25 transazioni
                
                for (let i = 0; i < numTransactions; i++) {
                    const day = Math.floor(Math.random() * 28) + 1;
                    const transactionDate = new Date(currentYear, currentMonth - 1, day);
                    
                    const categories = [
                        { index: 0, label: 'house', translations: { it: 'Casa', en: 'House' }},
                        { index: 1, label: 'food', translations: { it: 'Alimentari', en: 'Food' }},
                        { index: 2, label: 'transport', translations: { it: 'Trasporti', en: 'Transport' }},
                        { index: 3, label: 'entertainment', translations: { it: 'Intrattenimento', en: 'Entertainment' }}
                    ];
                    
                    const paymentTypes = [
                        { index: 0, label: 'single payment', translations: { it: 'Pagamento singolo', en: 'Single Payment' }},
                        { index: 1, label: 'subscription', translations: { it: 'Abbonamento', en: 'Subscription' }},
                        { index: 2, label: 'installment', translations: { it: 'Rata', en: 'Installment' }},
                        { index: 3, label: 'periodic payment', translations: { it: 'Pagamento periodico', en: 'Periodic payment' }}
                    ];
                    
                    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                    const randomPaymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
                    let amount = Math.floor(Math.random() * 200) + 50;
                    
                    transactions.push({
                        date: transactionDate.toISOString().split('T')[0],
                        amount,
                        categoryTag: randomCategory,
                        paymentType: randomPaymentType,
                        isExpense: true
                    });
                }
                
                return transactions;
            })()
        ],
        outflowsArray: [2100, 1950, 2200, 1800, 2300, 1750, 2150, 1900, 2050, 1850, 2250, 1700, 2000],
        totalOutflowsPerCategoryPerMonth: {
            0: { "House": 800, "Food": 600, "Transport": 400, "Entertainment": 300 }
        }
    },
    
    incomes: {
        allIncomes: [
            // Mese corrente [0] - array di transazioni income
            [
                {
                    date: new Date().toISOString().split('T')[0],
                    amount: 2800,
                    categoryTag: { index: 0, label: 'salary', translations: { it: 'Stipendio', en: 'Salary' }},
                    isExpense: false
                }
            ]
        ],
        incomesArray: [2800, 2750, 2900, 2650, 2850, 2700, 2800, 2750, 2900, 2650, 2850, 2700, 2600]
    },
    preYearSameMonthDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preMonthDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Date helper (aggiunto per compatibilità)
    currentDate: new Date().toISOString().split('T')[0],
    
    // Arrays legacy per compatibilità diretta con userData
    outflowsArray: [2100, 1950, 2200, 1800, 2300, 1750, 2150, 1900, 2050, 1850, 2250, 1700, 2000],
    incomesArray: [2800, 2750, 2900, 2650, 2850, 2700, 2800, 2750, 2900, 2650, 2850, 2700, 2600],
    
    // Tags per categorie (come UserContext)
    tags: {
        expenseTags: [
            'Affitto', 'Bollette', 'Spesa', 'Ristorante', 'Benzina', 'Taxi', 
            'Cinema', 'Shopping', 'Farmacia', 'Abbigliamento', 'Palestra',
            'Telefono', 'Internet', 'Assicurazione', 'Riparazioni', 'Regalo'
        ],
        incomeTags: [
            'Lavoro principale', 'Freelance', 'Dividendi', 'Affitti', 
            'Vendite', 'Bonus', 'Rimborsi', 'Interessi', 'Altro'
        ]
    },
    
    // Dati per grafici ultimi 12 mesi
    last12MonthsData: Array.from({ length: 12 }, (_, i) => {
        const baseDate = new Date();
        baseDate.setMonth(baseDate.getMonth() - (11 - i));
        const isCurrentMonth = i === 11; // Ultimo elemento = mese corrente
        
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
            goldValue: isCurrentMonth ? 8000 : Math.max(0, 3000 + (i * 450) + Math.random() * 600),
            emergencyFund: isCurrentMonth ? 5000 : Math.max(2000, 4000 - (i * 100) + Math.random() * 500)
        };
    }),
    
    // Ranking data per la pagina comparison
    rankings: {
        balance: Math.floor(Math.random() * 40) + 60, // 60-100%
        incomes: Math.floor(Math.random() * 35) + 55, // 55-90%
        expenses: Math.floor(Math.random() * 50) + 25, // 25-75%
        balanceSimilar: Math.floor(Math.random() * 30) + 65, // 65-95%
        incomesSimilar: Math.floor(Math.random() * 25) + 60, // 60-85%
        expensesSimilar: Math.floor(Math.random() * 40) + 30 // 30-70%
    },
    
    // Goals and limits per Financial Insights
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
        savingsGoalPercentage: 25,
        emergencyFundTarget: 15000,
        notificationsEnabled: true
    },
    
    // Assets per Financial Insights
    assets: [
        { typology: 'cash', value: 500, date: new Date().toISOString().split('T')[0] },
        { typology: 'bank', value: 20000, date: new Date().toISOString().split('T')[0] },
        { typology: 'stocks', value: 8000, date: new Date().toISOString().split('T')[0] },
        { typology: 'etf', value: 25000, date: new Date().toISOString().split('T')[0] },
        { typology: 'bonds', value: 15000, date: new Date().toISOString().split('T')[0] },
        { typology: 'funds', value: 12500, date: new Date().toISOString().split('T')[0] },
        { typology: 'gold', value: 8000, date: new Date().toISOString().split('T')[0] }
    ],
    
    // Date references strutturate come UserContext
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
    const [isLoading, setIsLoading] = useState(false);
    const { language } = useContext(LanguageContext);
    
    const [userData, setUserData] = useState(mockUserData);

    const handleSetIsAuthenticated = (value) => {
        setIsAuthenticated(value);
        console.log('MockAuth - setIsAuthenticated:', value);
    };

    const handleSetIsUpdated = (value) => {
        setIsUpdated(value);
        console.log('MockAuth - setIsUpdated:', value);
    };

    // Mock functions per compatibilità con AppRouter
    const loadUserData = () => {
        console.log('MockAuth - loadUserData called');
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
        isDevelopment: true // Flag per distinguere mock da produzione
    };

    return (
        <MockAuthContext.Provider value={value}>
            {children}
        </MockAuthContext.Provider>
    );
};

export default MockAuthContext; 
