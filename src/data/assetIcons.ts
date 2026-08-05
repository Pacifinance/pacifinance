// Centralized icons for all portfolio assets
// Used across the dashboard, charts, and stats for visual consistency

import { 
  BsBank, 
  BsCashCoin, 
  BsCoin 
} from "react-icons/bs";
import { 
  FaBitcoin 
} from "react-icons/fa";
import { 
  MdOutlineAutoGraph 
} from "react-icons/md";
import { 
  AiOutlineStock 
} from "react-icons/ai";
import { 
  SiMoneygram 
} from "react-icons/si";
import { 
  GiGoldBar,
  GiReceiveMoney,
  GiUmbrella
} from "react-icons/gi";
import { 
  RiSecurePaymentLine 
} from "react-icons/ri";

/**
 * Centralized map of icons for all assets
 * Always use these icons to keep consistency throughout the app
 */
export const assetIcons = {
  // Traditional assets/Liquidity
  bank: BsBank,
  cash: BsCashCoin,
  digitalServices: SiMoneygram,
  emergencyFund: GiUmbrella,

  // Investments
  stocks: MdOutlineAutoGraph,
  etf: AiOutlineStock,
  bitcoin: FaBitcoin,
  crypto: BsCoin,
  bonds: RiSecurePaymentLine, // Coming soon - backend update required
  funds: GiReceiveMoney, // Coming soon - backend update required
  commodities: GiGoldBar,
};

/**
 * Hook to get the icon for an asset
 * @param {string} assetType - Asset type (bank, cash, stocks, etc.)
 * @returns {React.Component} React icon component
 */
export const getAssetIcon = (assetType) => {
  return assetIcons[assetType] || BsCoin; // Fallback to a generic icon
};

/**
 * Ordered list of assets for iteration
 */
export const assetOrder = [
  'cash',
  'bank', 
  'digitalServices',
  'emergencyFund',
  'stocks',
  'etf',
  'bitcoin',
  'crypto'
];

/**
 * Asset mapping for compatibility with alternative names
 */
export const assetMapping = {
  // Alternative names
  'bankReal': 'bank',
  'cashReal': 'cash',
  'digitalServicesReal': 'digitalServices',
  'emergencyFundReal': 'emergencyFund',
  'stocksReal': 'stocks',
  'etfReal': 'etf',
  'bitcoinReal': 'bitcoin',
  'cryptoReal': 'crypto',
  
  // Standard names
  bank: 'bank',
  cash: 'cash',
  digitalServices: 'digitalServices',
  emergencyFund: 'emergencyFund',
  stocks: 'stocks',
  etf: 'etf',
  bitcoin: 'bitcoin',
  crypto: 'crypto'
};

export default assetIcons;