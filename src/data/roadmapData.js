/**
 * Roadmap Data — User-facing features for the public roadmap page.
 * 
 * Status: 'completed' | 'in-progress' | 'planned'
 * Category: 'feature' | 'ux' | 'community' | 'security'
 * 
 * Keep descriptions user-friendly — no technical jargon.
 */

const roadmapData = [
  /* ──────────── COMPLETED ──────────── */
  {
    id: 'dashboard-custom',
    title: { it: 'Dashboard Personalizzabile', en: 'Customizable Dashboard' },
    description: {
      it: 'Riordina le sezioni della dashboard trascinandole e scegli tra vista card o tabellare.',
      en: 'Reorder dashboard sections with drag-and-drop and choose between card or table view.'
    },
    status: 'completed',
    category: 'ux',
    icon: '🎨',
    completedDate: '2025-01',
  },
  {
    id: 'gamification',
    title: { it: 'Achievement e Badge', en: 'Achievements & Badges' },
    description: {
      it: '44 badge in 10 categorie per premiare la tua costanza nel tracciamento finanziario.',
      en: '44 badges in 10 categories to reward your consistency in financial tracking.'
    },
    status: 'completed',
    category: 'feature',
    icon: '🏆',
    completedDate: '2025-01',
  },
  {
    id: 'csv-import',
    title: { it: 'Importazione CSV / Excel', en: 'CSV / Excel Import' },
    description: {
      it: 'Importa le tue transazioni da file CSV o Excel con mappatura automatica delle colonne e riconoscimento categorie.',
      en: 'Import your transactions from CSV or Excel files with automatic column mapping and category recognition.'
    },
    status: 'completed',
    category: 'feature',
    icon: '📥',
    completedDate: '2025-02',
  },
  {
    id: 'i18n',
    title: { it: 'Supporto Multilingua', en: 'Multi-Language Support' },
    description: {
      it: 'Interfaccia disponibile in italiano e inglese con rilevamento automatico della lingua.',
      en: 'Interface available in Italian and English with automatic language detection.'
    },
    status: 'completed',
    category: 'ux',
    icon: '🌐',
    completedDate: '2024-12',
  },
  {
    id: 'mobile-nav',
    title: { it: 'Navigazione Mobile Nativa', en: 'Native Mobile Navigation' },
    description: {
      it: 'Navigazione a tab in basso stile app nativa per un\'esperienza mobile fluida.',
      en: 'Bottom tab navigation styled like a native app for a smooth mobile experience.'
    },
    status: 'completed',
    category: 'ux',
    icon: '📱',
    completedDate: '2025-01',
  },
  {
    id: 'data-export',
    title: { it: 'Esportazione Dati', en: 'Data Export' },
    description: {
      it: 'Esporta i tuoi dati finanziari in formato CSV, Excel, JSON o PDF.',
      en: 'Export your financial data in CSV, Excel, JSON or PDF format.'
    },
    status: 'completed',
    category: 'feature',
    icon: '📤',
    completedDate: '2024-11',
  },
  {
    id: 'anonymous-comparison',
    title: { it: 'Confronto Anonimo', en: 'Anonymous Comparison' },
    description: {
      it: 'Confronta il tuo patrimonio, entrate e uscite con utenti simili in modo completamente anonimo.',
      en: 'Compare your assets, income and outflows with similar users in a completely anonymous way.'
    },
    status: 'completed',
    category: 'feature',
    icon: '📊',
    completedDate: '2024-10',
  },
  {
    id: 'goals-limits',
    title: { it: 'Obiettivi e Limiti di Spesa', en: 'Goals & Spending Limits' },
    description: {
      it: 'Imposta obiettivi di risparmio personalizzati e limiti di spesa mensili con notifiche.',
      en: 'Set custom savings goals and monthly spending limits with notifications.'
    },
    status: 'completed',
    category: 'feature',
    icon: '🎯',
    completedDate: '2025-01',
  },

  /* ──────────── IN PROGRESS ──────────── */
  {
    id: 'multi-currency',
    title: { it: 'Supporto Multi-Valuta', en: 'Multi-Currency Support' },
    description: {
      it: 'Visualizza i tuoi dati nella valuta che preferisci (USD, GBP, CHF e altre) con conversione automatica.',
      en: 'View your data in your preferred currency (USD, GBP, CHF and more) with automatic conversion.'
    },
    status: 'in-progress',
    category: 'feature',
    icon: '💱',
  },
  {
    id: 'roadmap-feedback',
    title: { it: 'Roadmap e Feedback', en: 'Roadmap & Feedback' },
    description: {
      it: 'Pagina roadmap pubblica e sistema per raccogliere segnalazioni e suggerimenti dalla community.',
      en: 'Public roadmap page and system to collect bug reports and suggestions from the community.'
    },
    status: 'in-progress',
    category: 'community',
    icon: '🗺️',
  },

  /* ──────────── PLANNED ──────────── */
  {
    id: 'trend-charts',
    title: { it: 'Grafici Trend Patrimonio', en: 'Net Worth Trend Charts' },
    description: {
      it: 'Visualizza l\'andamento del tuo patrimonio nel tempo con grafici a linea interattivi.',
      en: 'View your net worth trend over time with interactive line charts.'
    },
    status: 'planned',
    category: 'feature',
    icon: '📈',
  },
  {
    id: 'push-notifications',
    title: { it: 'Promemoria Mensili', en: 'Monthly Reminders' },
    description: {
      it: 'Ricevi un promemoria quando è il momento di aggiornare i tuoi dati finanziari.',
      en: 'Get a reminder when it\'s time to update your financial data.'
    },
    status: 'planned',
    category: 'feature',
    icon: '🔔',
  },
  {
    id: 'custom-theme',
    title: { it: 'Tema Personalizzabile', en: 'Custom Theme' },
    description: {
      it: 'Scegli il colore primario della tua interfaccia per un\'esperienza unica.',
      en: 'Choose your primary interface color for a unique experience.'
    },
    status: 'planned',
    category: 'ux',
    icon: '🎨',
  },
  {
    id: 'bank-templates',
    title: { it: 'Template Bancari per Import', en: 'Bank Import Templates' },
    description: {
      it: 'Importa i dati dalla tua banca con template preconfigurati (Fineco, Revolut, N26 e altri).',
      en: 'Import data from your bank with pre-configured templates (Fineco, Revolut, N26 and more).'
    },
    status: 'planned',
    category: 'feature',
    icon: '🏦',
  },
  {
    id: 'pdf-reports',
    title: { it: 'Report PDF Avanzati', en: 'Advanced PDF Reports' },
    description: {
      it: 'Report PDF completi con grafici, tabelle e analisi dettagliate del tuo patrimonio.',
      en: 'Complete PDF reports with charts, tables and detailed analysis of your assets.'
    },
    status: 'planned',
    category: 'feature',
    icon: '📄',
  },
  {
    id: 'onboarding',
    title: { it: 'Tour Guidato per Nuovi Utenti', en: 'Guided Tour for New Users' },
    description: {
      it: 'Un tour interattivo che ti guida nella configurazione iniziale e nelle funzionalità principali.',
      en: 'An interactive tour that guides you through initial setup and main features.'
    },
    status: 'planned',
    category: 'ux',
    icon: '🚀',
  },
  {
    id: 'more-languages',
    title: { it: 'Più Lingue Supportate', en: 'More Supported Languages' },
    description: {
      it: 'Supporto per spagnolo, francese, tedesco, portoghese e altre lingue.',
      en: 'Support for Spanish, French, German, Portuguese and more languages.'
    },
    status: 'planned',
    category: 'ux',
    icon: '🗣️',
  },
  {
    id: 'budget-planner',
    title: { it: 'Pianificatore di Budget', en: 'Budget Planner' },
    description: {
      it: 'Pianifica il tuo budget mensile con scenari "what if" e simulazioni.',
      en: 'Plan your monthly budget with "what if" scenarios and simulations.'
    },
    status: 'planned',
    category: 'feature',
    icon: '💰',
  },
  {
    id: '2fa',
    title: { it: 'Autenticazione a Due Fattori', en: 'Two-Factor Authentication' },
    description: {
      it: 'Proteggi il tuo account con un secondo livello di sicurezza.',
      en: 'Protect your account with a second layer of security.'
    },
    status: 'planned',
    category: 'security',
    icon: '🔐',
  },
];

export default roadmapData;

/**
 * Get items filtered by status
 */
export const getItemsByStatus = (status) =>
  roadmapData.filter((item) => item.status === status);

/**
 * Get count of items per status
 */
export const getStatusCounts = () => ({
  completed: roadmapData.filter((i) => i.status === 'completed').length,
  'in-progress': roadmapData.filter((i) => i.status === 'in-progress').length,
  planned: roadmapData.filter((i) => i.status === 'planned').length,
});
