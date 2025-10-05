// Colori centralizzati per tutti gli asset del portafoglio
// Utilizzati in dashboard, grafici e statistiche per consistenza visiva

export const assetColors = {
  // Asset tradizionali/Liquidità
  bank: {
    primary: '#0D579B',
    gradient: 'linear-gradient(135deg, #0D579B 0%, #2980b9 100%)',
    light: '#2980b9',
    dark: '#0D579B'
  },
  cash: {
    primary: '#329239',
    gradient: 'linear-gradient(135deg, #329239 0%, #27ae60 100%)',
    light: '#27ae60',
    dark: '#329239'
  },
  digitalServices: {
    primary: '#74b9ff',
    gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    light: '#74b9ff',
    dark: '#0984e3'
  },
  
  // Investimenti
  stocks: {
    primary: '#FF6600',
    gradient: 'linear-gradient(135deg, #FF6600 0%, #ff7675 100%)',
    light: '#ff7675',
    dark: '#FF6600'
  },
  etf: {
    primary: '#a29bfe',
    gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
    light: '#a29bfe',
    dark: '#6c5ce7'
  },
  bitcoin: {
    primary: '#F7B510',
    gradient: 'linear-gradient(135deg, #F7B510 0%, #fdcb6e 100%)',
    light: '#fdcb6e',
    dark: '#F7B510'
  },
  crypto: {
    primary: '#d63031',
    gradient: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    light: '#e17055',
    dark: '#d63031'
  },
  bond: {
    primary: '#2d3436',
    gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    light: '#636e72',
    dark: '#2d3436'
  },
  funds: {
    primary: '#00b894',
    gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
    light: '#00cec9',
    dark: '#00b894'
  },
  gold: {
    primary: '#ffeaa7',
    gradient: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    light: '#ffeaa7',
    dark: '#fdcb6e'
  },
  
  // Colori speciali per gruppi
  totalLiquidity: '#079164',
  totalInvestments: '#FF6600',
  totalBalance: '#000000',
  
  // Colori per entrate, uscite e dashboard
  income: '#27ae60',
  expense: '#e74c3c', 
  savings: '#079164',
  
  // Colori per testi e UI
  textPrimary: '#333',
  textSecondary: '#666'
};

// Funzione per ottenere il colore basato sul tema
export const getAssetColor = (assetType, theme = 'light', variant = 'primary') => {
  const asset = assetColors[assetType];
  if (!asset) return assetColors.totalBalance;
  
  if (variant === 'gradient') return asset.gradient;
  if (variant === 'light') return asset.light;
  if (variant === 'dark') return asset.dark;
  
  // Per temi dark/light mode
  if (theme === 'dark') {
    return asset.light;
  }
  return asset.dark;
};

// Array ordinato per i grafici (stesso ordine della dashboard)
export const assetOrder = [
  'cash',
  'digitalServices', 
  'stocks',
  'bank',
  'crypto',
  'etf',
  'bitcoin',
  'bond',
  'funds',
  'gold'
];

// Mappa per tradurre le keys nei nomi visualizzati
export const assetNameMap = {
  cash: 'cash',
  digitalServices: 'digitalServices',
  stocks: 'stocks', 
  bank: 'bank',
  crypto: 'crypto',
  etf: 'etf',
  bitcoin: 'bitcoin',
  bond: 'bond',
  funds: 'funds',
  gold: 'gold'
};