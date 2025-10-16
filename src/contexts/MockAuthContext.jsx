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
    emergencyFund: 5000, // Fondo di emergenza separato
    stocksReal: 8000,
    etfReal: 25000,
    bitcoinReal: 0,
    cryptoReal: 0,
    bondsReal: 15000, // Test value to display visually
    fundsReal: 12500, // Test value to display visually
    goldReal: 8000, // Test value to display visually
    totalReal: 94000, // Updated to include emergency fund
    
    // Dati balance mese precedente
    cashRealPreMonth: 450,
    bankRealPreMonth: 18500,
    digitalServicesRealPreMonth: 0,
    emergencyFundPreMonth: 4500, // Fondo di emergenza mese precedente
    stocksRealPreMonth: 7500,
    etfRealPreMonth: 24000,
    bitcoinRealPreMonth: 0,
    cryptoRealPreMonth: 0,
    bondsRealPreMonth: 14000, // Test value to display visually
    fundsRealPreMonth: 11800, // Test value to display visually
    goldRealPreMonth: 7500, // Test value to display visually
    totalRealPreMonth: 88250, // Updated to include emergency fund
    
    // Dati balance anno precedente stesso mese
    cashRealPreYearSameMonth: 300,
    bankRealPreYearSameMonth: 15000,
    digitalServicesRealPreYearSameMonth: 0,
    emergencyFundPreYearSameMonth: 3000, // Fondo di emergenza anno precedente
    stocksRealPreYearSameMonth: 5000,
    etfRealPreYearSameMonth: 20000,
    bitcoinRealPreYearSameMonth: 0,
    cryptoRealPreYearSameMonth: 0,
    bondsRealPreYearSameMonth: 10000, // Test value to display visually
    fundsRealPreYearSameMonth: 9000, // Test value to display visually
    goldRealPreYearSameMonth: 6000, // Test value to display visually
    totalRealPreYearSameMonth: 68300, // Updated to include emergency fund
    
    // Date
    currentDate: new Date().toISOString().split('T')[0],
    preMonthDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preYearSameMonthDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Arrays per spese e entrate per ultimi 13 mesi (indice 12 = anno precedente stesso mese)
    outflowsArray: (() => {
        const today = new Date();
        // Usiamo un seed fisso per valori consistenti
        const seed = 123456789;
        let seedValue = seed;
        const seededRandom = () => {
            seedValue = (seedValue * 9301 + 49297) % 233280;
            return seedValue / 233280;
        };
        
        return Array.from({ length: 13 }, (_, i) => {
            const baseExpense = 2100; // Aumentato per insights più realistici
            const variation = Math.sin((today.getMonth() - i) * 0.5) * 400;
            const randomFactor = (seededRandom() - 0.5) * 300;
            return Math.max(800, Math.abs(baseExpense + variation + randomFactor)); // Min 800€
        });
    })(),
    
    incomesArray: (() => {
        const today = new Date();
        // Usiamo un seed fisso per valori consistenti
        const seed = 987654321;
        let seedValue = seed;
        const seededRandom = () => {
            seedValue = (seedValue * 9301 + 49297) % 233280;
            return seedValue / 233280;
        };
        
        return Array.from({ length: 13 }, (_, i) => {
            const baseSalary = 2800; // Manteniamo le entrate
            const variation = Math.sin((today.getMonth() - i) * 0.3) * 400;
            const randomBonus = seededRandom() * 300;
            return Math.max(1500, baseSalary + variation + randomBonus); // Min 1500€
        });
    })(),
    
    // Aggiungi un array assets per gli insights
    assets: [
        { typology: 'cash', value: 500, date: new Date().toISOString().split('T')[0] },
        { typology: 'bank', value: 20000, date: new Date().toISOString().split('T')[0] },
        { typology: 'stocks', value: 8000, date: new Date().toISOString().split('T')[0] },
        { typology: 'etf', value: 25000, date: new Date().toISOString().split('T')[0] },
        { typology: 'bonds', value: 15000, date: new Date().toISOString().split('T')[0] },
        { typology: 'funds', value: 12500, date: new Date().toISOString().split('T')[0] },
        { typology: 'gold', value: 8000, date: new Date().toISOString().split('T')[0] }
    ],
    
    // Array spese del mese corrente per insights
    expenses: (() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        return Array.from({ length: 15 }, (_, i) => ({
            date: new Date(currentYear, currentMonth, i + 1).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 200) + 50, // Spese da 50-250€
            category: ['Casa', 'Alimentari', 'Trasporti', 'Intrattenimento'][Math.floor(Math.random() * 4)]
        }));
    })(),
    
    // Array entrate del mese corrente per insights  
    incomes: (() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        return [
            {
                date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
                value: 2800,
                category: 'Stipendio'
            }
        ];
    })(),
    
    // Arrays dettagliati per tabelle insert-values (sempre del mese corrente)
    allOutflows: (() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        // Array di transazioni per il mese corrente
        const transactions = [];
        const monthKey = `${currentMonth}-${currentYear}`;
        
        // Genera 15-25 transazioni casuali per il mese corrente
        const numTransactions = Math.floor(Math.random() * 11) + 15; // 15-25 transazioni
        
        for (let i = 0; i < numTransactions; i++) {
            const day = Math.floor(Math.random() * 28) + 1; // 1-28 per sicurezza
            const transactionDate = new Date(currentYear, currentMonth - 1, day);
            
            // Categoria casuale
            const categories = [
                { index: 0, translations: { it: 'Casa', en: 'House' }},
                { index: 1, translations: { it: 'Alimentari', en: 'Food' }},
                { index: 2, translations: { it: 'Trasporti', en: 'Transport' }},
                { index: 3, translations: { it: 'Intrattenimento', en: 'Entertainment' }},
                { index: 4, translations: { it: 'Salute', en: 'Health' }},
                { index: 5, translations: { it: 'Abbigliamento', en: 'Clothing' }},
                { index: 6, translations: { it: 'Altri', en: 'Other' }}
            ];
            
            // Tipo pagamento casuale
            const paymentTypes = [
                { index: 0, translations: { it: 'Carta di Credito', en: 'Credit Card' }},
                { index: 1, translations: { it: 'Bonifico', en: 'Bank Transfer' }},
                { index: 2, translations: { it: 'Contanti', en: 'Cash' }},
                { index: 3, translations: { it: 'PayPal', en: 'PayPal' }}
            ];
            
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const randomPaymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
            
            // Importo basato sulla categoria
            let amount;
            switch (randomCategory.index) {
                case 0: amount = Math.floor(Math.random() * 400) + 600; break; // Casa: 600-1000
                case 1: amount = Math.floor(Math.random() * 80) + 20; break; // Alimentari: 20-100
                case 2: amount = Math.floor(Math.random() * 100) + 15; break; // Trasporti: 15-115
                case 3: amount = Math.floor(Math.random() * 150) + 25; break; // Intrattenimento: 25-175
                case 4: amount = Math.floor(Math.random() * 200) + 30; break; // Salute: 30-230
                case 5: amount = Math.floor(Math.random() * 120) + 25; break; // Abbigliamento: 25-145
                default: amount = Math.floor(Math.random() * 80) + 10; break; // Altri: 10-90
            }
            
            const notes = [
                'Spesa mensile', 'Acquisto necessario', 'Pagamento regolare', 
                'Spesa imprevista', 'Acquisto online', 'Pagamento bolletta',
                'Spesa alimentare', 'Carburante', 'Medicina', 'Regalo',
                'Abbonamento', 'Riparazione', ''
            ];
            
            transactions.push({
                date: transactionDate.toISOString().split('T')[0],
                amount,
                categoryTag: randomCategory,
                paymentType: randomPaymentType,
                notes: notes[Math.floor(Math.random() * notes.length)],
                is_expense: true
            });
        }
        
        // Raggruppa per mese
        return [transactions];
    })(),
    
    allIncomes: (() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        // Array di entrate per il mese corrente
        const transactions = [];
        
        // Genera 3-8 entrate per il mese corrente
        const numTransactions = Math.floor(Math.random() * 6) + 3; // 3-8 entrate
        
        for (let i = 0; i < numTransactions; i++) {
            const day = Math.floor(Math.random() * 28) + 1; // 1-28 per sicurezza  
            const transactionDate = new Date(currentYear, currentMonth - 1, day);
            
            // Categoria entrata casuale
            const incomeCategories = [
                { index: 0, translations: { it: 'Stipendio', en: 'Salary' }},
                { index: 1, translations: { it: 'Freelance', en: 'Freelance' }},
                { index: 2, translations: { it: 'Investimenti', en: 'Investments' }},
                { index: 3, translations: { it: 'Altro', en: 'Other' }}
            ];
            
            const randomCategory = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
            
            // Importo basato sulla categoria
            let amount;
            switch (randomCategory.index) {
                case 0: amount = Math.floor(Math.random() * 1000) + 2000; break; // Stipendio: 2000-3000
                case 1: amount = Math.floor(Math.random() * 800) + 200; break; // Freelance: 200-1000
                case 2: amount = Math.floor(Math.random() * 300) + 50; break; // Investimenti: 50-350
                default: amount = Math.floor(Math.random() * 200) + 25; break; // Altri: 25-225
            }
            
            const notes = [
                'Stipendio mensile', 'Progetto freelance', 'Dividendi',
                'Rendita investimenti', 'Bonus', 'Rimborso',
                'Vendita oggetti', 'Regalo monetario', ''
            ];
            
            transactions.push({
                date: transactionDate.toISOString().split('T')[0],
                amount,
                categoryTag: randomCategory,
                notes: notes[Math.floor(Math.random() * notes.length)],
                is_expense: false
            });
        }
        
        // Raggruppa per mese
        return [transactions];
    })(),
    
    // Ranking mock (ora gestito più sotto con valori dinamici)
    
    // User info
    userId: 'dev-user-123',
    userType: 'premium',
    username: 'Developer User',
    creationDate: '2023-01-15T10:30:00Z',
    country: { label: 'Italy' },
    job: { label: 'Developer' },
    jobType: { label: 'Full-time' },
    jobCountry: { label: 'Italy' },
    workTime: { label: '40' },
    remoteType: { label: 'Remote' },
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
        const isCurrentMonth = i === 11; // Ultimo elemento = mese corrente (ottobre 2025)
        
        return {
            month: baseDate.toISOString().split('T')[0].slice(0, 7),
            totalReal: 40000 + Math.sin(i * 0.5) * 10000 + Math.random() * 5000,
            totalExpenses: 1000 + Math.sin(i * 0.3) * 300 + Math.random() * 200,
            totalIncomes: 2800 + Math.sin(i * 0.4) * 500 + Math.random() * 300,
            cashReal: isCurrentMonth ? 500 : 400 + Math.random() * 200,
            bankReal: isCurrentMonth ? 20000 : 18000 + Math.sin(i * 0.6) * 5000,
            stocksReal: isCurrentMonth ? 8000 : 7000 + Math.sin(i * 0.7) * 2000,
            etfReal: isCurrentMonth ? 25000 : 23000 + Math.sin(i * 0.8) * 3000,
            bitcoinReal: Math.random() * 1000,
            cryptoReal: Math.random() * 500,
            digitalServicesReal: isCurrentMonth ? 0 : Math.random() * 100,
            // New investments with realistic progression - current month matches dashboard
            bondsReal: isCurrentMonth ? 15000 : Math.max(0, 8000 + (i * 800) + Math.random() * 1000),
            fundsReal: isCurrentMonth ? 12500 : Math.max(0, 6000 + (i * 600) + Math.random() * 800),
            goldReal: isCurrentMonth ? 8000 : Math.max(0, 3000 + (i * 450) + Math.random() * 600)
        };
    }),
    
    // Dati storici per grafici e confronti
    balances: Array.from({ length: 24 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const isCurrentMonth = i === 0; // Primo elemento = mese corrente
        
        return {
            date: date.toISOString().split('T')[0],
            month: date.toISOString().split('T')[0].slice(0, 7),
            totalReal: 35000 + Math.sin(i * 0.3) * 8000 + Math.random() * 3000,
            cashReal: isCurrentMonth ? 500 : 300 + Math.random() * 400,
            bankReal: isCurrentMonth ? 20000 : 15000 + Math.sin(i * 0.4) * 4000,
            emergencyFund: isCurrentMonth ? 5000 : Math.max(2000, 4000 - (i * 100) + Math.random() * 500), // Emergency fund growth over time
            stocksReal: isCurrentMonth ? 8000 : 6000 + Math.sin(i * 0.5) * 2000,
            etfReal: isCurrentMonth ? 25000 : 20000 + Math.sin(i * 0.6) * 3000,
            bitcoinReal: Math.random() * 1500,
            cryptoReal: Math.random() * 800,
            digitalServicesReal: isCurrentMonth ? 0 : Math.random() * 200,
            // New investments with realistic progression
            bondsReal: isCurrentMonth ? 15000 : Math.max(0, 12000 - (i * 500) + Math.random() * 1000),
            fundsReal: isCurrentMonth ? 12500 : Math.max(0, 10000 - (i * 400) + Math.random() * 800),
            goldReal: isCurrentMonth ? 8000 : Math.max(0, 6500 - (i * 300) + Math.random() * 600)
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

    // Tags e categorie per entrate/uscite (con traduzioni) - chiavi corrispondenti a outflowCategoryColors
    outflowsTags: [
        { 
            index: 0,
            key: 'House',
            name: 'House', 
            total: 1200, 
            percentage: 22,
            translations: { it: 'Casa', en: 'House' }
        },
        { 
            index: 1,
            key: 'Food',
            name: 'Food', 
            total: 800, 
            percentage: 15,
            translations: { it: 'Alimentari', en: 'Food' }
        },
        { 
            index: 2,
            key: 'Transports',
            name: 'Transports', 
            total: 400, 
            percentage: 8,
            translations: { it: 'Trasporti', en: 'Transports' }
        },
        { 
            index: 3,
            key: 'Free time',
            name: 'Free time', 
            total: 350, 
            percentage: 7,
            translations: { it: 'Tempo libero', en: 'Free time' }
        },
        { 
            index: 4,
            key: 'Health',
            name: 'Health', 
            total: 300, 
            percentage: 6,
            translations: { it: 'Salute', en: 'Health' }
        },
        { 
            index: 5,
            key: 'Shopping',
            name: 'Shopping', 
            total: 280, 
            percentage: 5,
            translations: { it: 'Shopping', en: 'Shopping' }
        },
        { 
            index: 6,
            key: 'Digital service',
            name: 'Digital service', 
            total: 200, 
            percentage: 4,
            translations: { it: 'Servizi digitali', en: 'Digital service' }
        },
        { 
            index: 7,
            key: 'Education',
            name: 'Education', 
            total: 180, 
            percentage: 3,
            translations: { it: 'Educazione', en: 'Education' }
        },
        { 
            index: 8,
            key: 'Travelling',
            name: 'Travelling', 
            total: 150, 
            percentage: 3,
            translations: { it: 'Viaggi', en: 'Travelling' }
        },
        { 
            index: 9,
            key: 'Vehicle',
            name: 'Vehicle', 
            total: 120, 
            percentage: 2,
            translations: { it: 'Veicoli', en: 'Vehicle' }
        },
        { 
            index: 10,
            key: 'Investment',
            name: 'Investment', 
            total: 100, 
            percentage: 2,
            translations: { it: 'Investimenti', en: 'Investment' }
        },
        { 
            index: 11,
            key: 'Tax',
            name: 'Tax', 
            total: 90, 
            percentage: 2,
            translations: { it: 'Tasse', en: 'Tax' }
        },
        { 
            index: 12,
            key: 'Gift',
            name: 'Gift', 
            total: 80, 
            percentage: 1,
            translations: { it: 'Regali', en: 'Gift' }
        },
        { 
            index: 13,
            key: 'Pets',
            name: 'Pets', 
            total: 70, 
            percentage: 1,
            translations: { it: 'Animali domestici', en: 'Pets' }
        },
        { 
            index: 14,
            key: 'Personal project',
            name: 'Personal project', 
            total: 60, 
            percentage: 1,
            translations: { it: 'Progetti personali', en: 'Personal project' }
        },
        { 
            index: 15,
            key: 'Other',
            name: 'Other', 
            total: 50, 
            percentage: 1,
            translations: { it: 'Altro', en: 'Other' }
        }
    ],
    
    incomesTags: [
        { 
            index: 0,
            key: 'Salary',
            name: 'Salary', 
            total: 2500, 
            percentage: 65,
            translations: { it: 'Stipendio', en: 'Salary' }
        },
        { 
            index: 1,
            key: 'Freelance income',
            name: 'Freelance income', 
            total: 600, 
            percentage: 15,
            translations: { it: 'Freelance', en: 'Freelance income' }
        },
        { 
            index: 2,
            key: 'Extra income',
            name: 'Extra income',
            total: 400, 
            percentage: 10,
            translations: { it: 'Entrate extra', en: 'Extra income' }
        },
        { 
            index: 3,
            key: 'Gift',
            name: 'Gift', 
            total: 200, 
            percentage: 5,
            translations: { it: 'Regali', en: 'Gift' }
        },
        { 
            index: 4,
            key: 'Retirement',
            name: 'Retirement', 
            total: 100, 
            percentage: 3,
            translations: { it: 'Pensione', en: 'Retirement' }
        },
        { 
            index: 5,
            key: 'Other',
            name: 'Other', 
            total: 80, 
            percentage: 2,
            translations: { it: 'Altro', en: 'Other' }
        }
    ],
    
    paymentTags: [
        { 
            index: 0,
            key: 'Single Payment',
            name: 'Single Payment', 
            total: 2000, 
            percentage: 40,
            translations: { it: 'Pagamento singolo', en: 'Single Payment' }
        },
        { 
            index: 1,
            key: 'Subscription',
            name: 'Subscription', 
            total: 1500, 
            percentage: 30,
            translations: { it: 'Abbonamento', en: 'Subscription' }
        },
        { 
            index: 2,
            key: 'Installment',
            name: 'Installment', 
            total: 800, 
            percentage: 16,
            translations: { it: 'Rata', en: 'Installment' }
        },
        { 
            index: 3,
            key: 'Periodic payment',
            name: 'Periodic payment', 
            total: 400, 
            percentage: 8,
            translations: { it: 'Pagamento periodico', en: 'Periodic payment' }
        },
        { 
            index: 4,
            key: 'Capital accumulation plan',
            name: 'Capital accumulation plan', 
            total: 300, 
            percentage: 6,
            translations: { it: 'Piano di accumulo', en: 'Capital accumulation plan' }
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
    totalOutflowsPerCategoryPerMonth: (() => {
        const today = new Date();
        return Array.from({ length: 12 }, (_, monthIndex) => {
            return {
                // Categorie con chiavi inglesi per consistenza nell'applicazione
                'House': 800 + Math.sin((today.getMonth() - monthIndex) * 0.4) * 200 + Math.random() * 150,
                'Food': 350 + Math.sin((today.getMonth() - monthIndex) * 0.6) * 100 + Math.random() * 100,
                'Transports': 200 + Math.sin((today.getMonth() - monthIndex) * 0.8) * 80 + Math.random() * 60,
                'Free time': 180 + Math.sin((today.getMonth() - monthIndex) * 0.5) * 70 + Math.random() * 50,
                'Health': 120 + Math.sin((today.getMonth() - monthIndex) * 0.3) * 60 + Math.random() * 40,
                'Shopping': 100 + Math.sin((today.getMonth() - monthIndex) * 0.7) * 80 + Math.random() * 60,
                'Other': 150 + Math.sin((today.getMonth() - monthIndex) * 1.0) * 100 + Math.random() * 80,
                'Travelling': 250 + Math.sin((today.getMonth() - monthIndex) * 0.9) * 200 + Math.random() * 100,
                'Digital service': 80 + Math.sin((today.getMonth() - monthIndex) * 0.2) * 50 + Math.random() * 30,
                'Vehicle': 120 + Math.sin((today.getMonth() - monthIndex) * 0.1) * 60 + Math.random() * 40
            };
        });
    })(),

    // Dati per confronti e benchmark
    percentageRankOnBalance: Math.floor(Math.random() * 40) + 60, // 60-100%
    percentageRankOnIncomes: Math.floor(Math.random() * 35) + 55, // 55-90%
    percentageRankOnExpenses: Math.floor(Math.random() * 50) + 25, // 25-75%
    percentageRankOnBalanceSimilar: Math.floor(Math.random() * 30) + 65,
    percentageRankOnIncomesSimilar: Math.floor(Math.random() * 25) + 60,
    percentageRankOnExpensesSimilar: Math.floor(Math.random() * 40) + 30,

    // Goals and limits data con esempi per mock user
    goals: [
        { 
            id: 1, 
            name: 'Fondo Emergenza', 
            target: 15000, 
            current: 5000, // Ora corrisponde al valore emergencyFund
            deadline: '2025-12-31', 
            type: 'emergencyFund' // Cambiato da 'savings' a 'emergencyFund'
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
        },
        { 
            id: 4, 
            name: 'Portfolio Investimenti', 
            target: 50000, 
            current: 33000, 
            deadline: '2026-01-31', 
            type: 'investment' 
        }
    ],
    limits: {
        monthlySpendingLimit: 2800,
        savingsGoalPercentage: 25,
        emergencyFundTarget: 15000,
        notificationsEnabled: true
    }
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
            outflowsTags: getSortedTags(userData.outflowsTags),
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