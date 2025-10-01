import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageContext } from './LanguageContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';

const MockAuthContext = createContext();

// Mock data compatibili con UserContext structure
export const mockDashboardData = {
    // Dati balance attuali
    cashReal: 500,
    bankReal: 20000,
    digitalServicesReal: 0,
    stocksReal: 8000,
    etfReal: 25000,
    bitcoinReal: 0,
    cryptoReal: 0,
    totalReal: 53500,
    
    // Dati balance mese precedente
    cashRealPreMonth: 450,
    bankRealPreMonth: 18500,
    digitalServicesRealPreMonth: 0,
    stocksRealPreMonth: 7500,
    etfRealPreMonth: 24000,
    bitcoinRealPreMonth: 0,
    cryptoRealPreMonth: 0,
    totalRealPreMonth: 50450,
    
    // Dati balance anno precedente stesso mese
    cashRealPreYearSameMonth: 300,
    bankRealPreYearSameMonth: 15000,
    digitalServicesRealPreYearSameMonth: 0,
    stocksRealPreYearSameMonth: 5000,
    etfRealPreYearSameMonth: 20000,
    bitcoinRealPreYearSameMonth: 0,
    cryptoRealPreYearSameMonth: 0,
    totalRealPreYearSameMonth: 40300,
    
    // Date
    currentDate: new Date().toISOString().split('T')[0],
    preMonthDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preYearSameMonthDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Arrays per spese e entrate per ultimi 12 mesi (dinamici)
    expensesArray: (() => {
        const today = new Date();
        return Array.from({ length: 12 }, (_, i) => {
            const baseExpense = 1200;
            const variation = Math.sin((today.getMonth() - i) * 0.5) * 300;
            const randomFactor = (Math.random() - 0.5) * 200;
            return Math.abs(baseExpense + variation + randomFactor);
        });
    })(),
    
    incomesArray: (() => {
        const today = new Date();
        return Array.from({ length: 12 }, (_, i) => {
            const baseSalary = 2800;
            const variation = Math.sin((today.getMonth() - i) * 0.3) * 400;
            const randomBonus = Math.random() * 300;
            return baseSalary + variation + randomBonus;
        });
    })(),
    
    outflowsArray: (() => {
        const today = new Date();
        return Array.from({ length: 12 }, (_, i) => {
            const baseExpense = 1200;
            const variation = Math.sin((today.getMonth() - i) * 0.5) * 300;
            const randomFactor = (Math.random() - 0.5) * 200;
            return Math.abs(baseExpense + variation + randomFactor);
        });
    })(),
    
    // Arrays dettagliati per altri componenti
    allExpenses: [
        { name: 'Affitto', value: 800 },
        { name: 'Spesa', value: 300 },
        { name: 'Trasporti', value: 150 }
    ],
    allIncomes: [
        { name: 'Stipendio', value: 2500 },
        { name: 'Freelance', value: 500 }
    ],
    
    // Ranking mock (ora gestito più sotto con valori dinamici)
    
    // User info
    userId: 'dev-user-123',
    userType: 'premium',
    username: 'Developer User',
    userNationality: 'Italy',
    userWhereWorks: 'Technology',
    userJob: 'Developer',
    userJobType: 'Full-time',
    userWorkTime: '40',
    userRemoteType: 'Remote',
    
    // Dati per grafici ultimi 12 mesi (mock) - più dettagliati
    last12MonthsData: Array.from({ length: 12 }, (_, i) => {
        const baseDate = new Date();
        baseDate.setMonth(baseDate.getMonth() - (11 - i));
        return {
            month: baseDate.toISOString().split('T')[0].slice(0, 7),
            totalReal: 40000 + Math.sin(i * 0.5) * 10000 + Math.random() * 5000,
            totalExpenses: 1000 + Math.sin(i * 0.3) * 300 + Math.random() * 200,
            totalIncomes: 2800 + Math.sin(i * 0.4) * 500 + Math.random() * 300,
            cashReal: 400 + Math.random() * 200,
            bankReal: 18000 + Math.sin(i * 0.6) * 5000,
            stocksReal: 7000 + Math.sin(i * 0.7) * 2000,
            etfReal: 23000 + Math.sin(i * 0.8) * 3000,
            bitcoinReal: Math.random() * 1000,
            cryptoReal: Math.random() * 500,
            digitalServicesReal: Math.random() * 100
        };
    }),
    
    // Dati storici per grafici e confronti
    balances: Array.from({ length: 24 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
            date: date.toISOString().split('T')[0],
            month: date.toISOString().split('T')[0].slice(0, 7),
            totalReal: 35000 + Math.sin(i * 0.3) * 8000 + Math.random() * 3000,
            cashReal: 300 + Math.random() * 400,
            bankReal: 15000 + Math.sin(i * 0.4) * 4000,
            stocksReal: 6000 + Math.sin(i * 0.5) * 2000,
            etfReal: 20000 + Math.sin(i * 0.6) * 3000,
            bitcoinReal: Math.random() * 1500,
            cryptoReal: Math.random() * 800,
            digitalServicesReal: Math.random() * 200
        };
    }),
    
    balancesPreMonth: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].slice(0, 7),
        totalReal: 48000 + Math.sin(i * 0.4) * 7000
    })),
    
    balancesPreYearSameMonth: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(Date.now() - (365 + i * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0].slice(0, 7),
        totalReal: 35000 + Math.sin(i * 0.3) * 6000
    })),

    // Tags e categorie per entrate/uscite (con traduzioni)
    expensesTags: [
        { 
            index: 0,
            name: 'Casa', 
            total: 1200, 
            percentage: 45,
            translations: { it: 'Casa', en: 'Home' }
        },
        { 
            index: 1,
            name: 'Alimentari', 
            total: 400, 
            percentage: 15,
            translations: { it: 'Alimentari', en: 'Food' }
        },
        { 
            index: 2,
            name: 'Trasporti', 
            total: 300, 
            percentage: 11,
            translations: { it: 'Trasporti', en: 'Transport' }
        },
        { 
            index: 3,
            name: 'Intrattenimento', 
            total: 200, 
            percentage: 7,
            translations: { it: 'Intrattenimento', en: 'Entertainment' }
        },
        { 
            index: 4,
            name: 'Salute', 
            total: 150, 
            percentage: 6,
            translations: { it: 'Salute', en: 'Health' }
        },
        { 
            index: 5,
            name: 'Abbigliamento', 
            total: 100, 
            percentage: 4,
            translations: { it: 'Abbigliamento', en: 'Clothing' }
        },
        { 
            index: 6,
            name: 'Altri', 
            total: 300, 
            percentage: 12,
            translations: { it: 'Altri', en: 'Other' }
        }
    ],
    
    incomesTags: [
        { 
            index: 0,
            name: 'Stipendio', 
            total: 2500, 
            percentage: 83,
            translations: { it: 'Stipendio', en: 'Salary' }
        },
        { 
            index: 1,
            name: 'Freelance', 
            total: 400, 
            percentage: 13,
            translations: { it: 'Freelance', en: 'Freelance' }
        },
        { 
            index: 2,
            name: 'Investimenti', 
            total: 100, 
            percentage: 3,
            translations: { it: 'Investimenti', en: 'Investments' }
        },
        { 
            index: 3,
            name: 'Altri', 
            total: 50, 
            percentage: 1,
            translations: { it: 'Altri', en: 'Other' }
        }
    ],
    
    paymentTags: [
        { 
            index: 0,
            name: 'Carta di Credito', 
            total: 1500, 
            percentage: 55,
            translations: { it: 'Carta di Credito', en: 'Credit Card' }
        },
        { 
            index: 1,
            name: 'Bonifico', 
            total: 800, 
            percentage: 30,
            translations: { it: 'Bonifico', en: 'Bank Transfer' }
        },
        { 
            index: 2,
            name: 'Contanti', 
            total: 300, 
            percentage: 11,
            translations: { it: 'Contanti', en: 'Cash' }
        },
        { 
            index: 3,
            name: 'PayPal', 
            total: 100, 
            percentage: 4,
            translations: { it: 'PayPal', en: 'PayPal' }
        }
    ],

    // Dati demografici mock
    nationalityTags: ['Italy', 'Germany', 'France', 'Spain', 'UK'],
    jobTags: ['Developer', 'Designer', 'Manager', 'Analyst', 'Engineer'],
    jobTypeTags: ['Full-time', 'Part-time', 'Contract', 'Freelance'],
    workTimeTags: ['40', '35', '30', '25', '20'],
    remoteTypeTags: ['Remote', 'Hybrid', 'Office'],
    yearsExperienceTags: ['0-1', '2-3', '4-5', '6-10', '11-15', '16-20', '20+'],
    ageTags: ['18-25', '26-30', '31-35', '36-40', '41-45', '46-50', '51-55', '56-60', '60+'],
    livingStatusTags: [
        { key: 'alone', value: { it: 'Vivo da solo', en: 'Living alone' } },
        { key: 'others', value: { it: 'Vivo con altre persone', en: 'Living with others' } },
        { key: 'partner', value: { it: 'Vivo con il partner', en: 'Living with partner' } },
        { key: 'family', value: { it: 'Vivo con la famiglia', en: 'Living with family' } }
    ],
    housingTypeTags: [
        { key: 'rent', value: { it: 'Affitto', en: 'Rent' } },
        { key: 'mortgage', value: { it: 'Mutuo', en: 'Mortgage' } },
        { key: 'owned', value: { it: 'Di proprietà', en: 'Owned' } },
        { key: 'family', value: { it: 'Casa di famiglia', en: 'Family home' } }
    ],
    hasChildrenTags: [
        { key: 'yes', value: { it: 'Sì', en: 'Yes' } },
        { key: 'no', value: { it: 'No', en: 'No' } }
    ],
    
    // Spese per categoria per mese (per PieChart - struttura compatibile con InOutChart)
    totalExpensesPerCategoryPerMonth: (() => {
        const today = new Date();
        return Array.from({ length: 12 }, (_, monthIndex) => {
            return {
                // Categorie con chiavi italiane (compatibili con languages.json) - i colori verranno gestiti dal mapping
                'Casa': 800 + Math.sin((today.getMonth() - monthIndex) * 0.4) * 200 + Math.random() * 150,
                'Alimentari': 350 + Math.sin((today.getMonth() - monthIndex) * 0.6) * 100 + Math.random() * 100,
                'Trasporti': 200 + Math.sin((today.getMonth() - monthIndex) * 0.8) * 80 + Math.random() * 60,
                'Intrattenimento': 180 + Math.sin((today.getMonth() - monthIndex) * 0.5) * 70 + Math.random() * 50,
                'Salute': 120 + Math.sin((today.getMonth() - monthIndex) * 0.3) * 60 + Math.random() * 40,
                'Abbigliamento': 100 + Math.sin((today.getMonth() - monthIndex) * 0.7) * 80 + Math.random() * 60,
                'Altri': 150 + Math.sin((today.getMonth() - monthIndex) * 1.0) * 100 + Math.random() * 80,
                'Viaggi': 250 + Math.sin((today.getMonth() - monthIndex) * 0.9) * 200 + Math.random() * 100,
                'Digital': 80 + Math.sin((today.getMonth() - monthIndex) * 0.2) * 50 + Math.random() * 30,
                'Auto': 120 + Math.sin((today.getMonth() - monthIndex) * 0.1) * 60 + Math.random() * 40
            };
        });
    })(),

    // Dati per confronti e benchmark
    percentageRankOnBalance: Math.floor(Math.random() * 40) + 60, // 60-100%
    percentageRankOnIncomes: Math.floor(Math.random() * 35) + 55, // 55-90%
    percentageRankOnExpenses: Math.floor(Math.random() * 50) + 25, // 25-75%
    percentageRankOnBalanceSimilar: Math.floor(Math.random() * 30) + 65,
    percentageRankOnIncomesSimilar: Math.floor(Math.random() * 25) + 60,
    percentageRankOnExpensesSimilar: Math.floor(Math.random() * 40) + 30
};

export const MockAuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isUpdated, setIsUpdated] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { language } = useContext(LanguageContext);
    
    // Funzione helper per ordinare i tags mock
    const getSortedTags = (tags) => {
        return sortTagsByLanguage(tags, language);
    };

    const [userData, setUserData] = useState(mockDashboardData);

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
        userData: {
            ...userData,
            // Tags ordinati alfabeticamente in base alla lingua
            expensesTags: getSortedTags(userData.expensesTags),
            incomesTags: getSortedTags(userData.incomesTags), 
            paymentTags: getSortedTags(userData.paymentTags),
            // I tags demografici rimangono così come sono (stringhe semplici)
            nationalityTags: userData.nationalityTags.sort(),
            jobTags: userData.jobTags.sort(),
            jobTypeTags: userData.jobTypeTags.sort(),
            workTimeTags: userData.workTimeTags.sort(),
            remoteTypeTags: userData.remoteTypeTags.sort(),
            yearsExperienceTags: userData.yearsExperienceTags.sort(),
            ageTags: userData.ageTags.sort(),
            livingStatusTags: userData.livingStatusTags,
            housingTypeTags: userData.housingTypeTags,
            hasChildrenTags: userData.hasChildrenTags
        },
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

export const useMockAuth = () => {
    const context = useContext(MockAuthContext);
    if (!context) {
        throw new Error('useMockAuth must be used within a MockAuthProvider');
    }
    return context;
};