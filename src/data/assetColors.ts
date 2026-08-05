// Centralized colors for all portfolio assets
// Used across the dashboard, charts, and stats for visual consistency

export const assetColors = {
  // Traditional assets/Liquidity
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
  emergencyFund: {
    primary: '#8e44ad',
    gradient: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
    light: '#9b59b6',
    dark: '#8e44ad'
  },
  
  // Investments
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
  bonds: {
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
  commodities: {
    primary: '#ffeaa7',
    gradient: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    light: '#ffeaa7',
    dark: '#fdcb6e'
  },
  
  // Special colors for groups
  totalLiquidity: '#079164',
  totalInvestments: '#FF6600',
  totalBalance: '#000000',

  // Colors for income, outflows, and the dashboard
  income: '#27ae60',
  expense: '#e74c3c',
  savings: '#079164',

  // Colors for text and UI
  textPrimary: '#333',
  textSecondary: '#666'
};

// Function to get a color based on the theme
export const getAssetColor = (assetType, theme = 'light', variant = 'primary') => {
  const asset = assetColors[assetType];
  if (!asset) return assetColors.totalBalance;
  
  if (variant === 'gradient') return asset.gradient;
  if (variant === 'light') return asset.light;
  if (variant === 'dark') return asset.dark;
  
  // For dark/light theme modes
  if (theme === 'dark') {
    return asset.light;
  }
  return asset.dark;
};

// Ordered array for charts (same order as the dashboard)
export const assetOrder = [
  'cash',
  'digitalServices', 
  'emergencyFund',
  'stocks',
  'bank',
  'crypto',
  'etf',
  'bitcoin',
  'bonds',
  'funds',
  'commodities'
];

// Map to translate keys into displayed names
export const assetNameMap = {
  cash: 'cash',
  digitalServices: 'digitalServices',
  emergencyFund: 'emergencyFund',
  stocks: 'stocks', 
  bank: 'bank',
  crypto: 'crypto',
  etf: 'etf',
  bitcoin: 'bitcoin',
  bonds: 'bonds',
  funds: 'funds',
  commodities: 'commodities'
};