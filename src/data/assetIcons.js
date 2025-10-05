// Icone centralizzate per tutti gli asset del portafoglio
// Utilizzate in dashboard, grafici e statistiche per consistenza visiva

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
  GiReceiveMoney 
} from "react-icons/gi";
import { 
  RiSecurePaymentLine 
} from "react-icons/ri";

/**
 * Mappa centralizzata delle icone per tutti gli asset
 * Utilizzare sempre queste icone per garantire consistenza in tutta l'app
 */
export const assetIcons = {
  // Asset tradizionali/Liquidità
  bank: BsBank,
  cash: BsCashCoin,
  digitalServices: SiMoneygram,
  
  // Investimenti
  stocks: MdOutlineAutoGraph,
  etf: AiOutlineStock,
  bitcoin: FaBitcoin,
  crypto: BsCoin,
  bond: RiSecurePaymentLine, // Coming soon - backend update required
  funds: GiReceiveMoney, // Coming soon - backend update required
  gold: GiGoldBar, // Coming soon - backend update required
};

/**
 * Hook per ottenere l'icona di un asset
 * @param {string} assetType - Tipo di asset (bank, cash, stocks, etc.)
 * @returns {React.Component} Componente icona React
 */
export const getAssetIcon = (assetType) => {
  return assetIcons[assetType] || BsCoin; // Fallback a icona generica
};

/**
 * Lista ordinata degli asset per iterazione
 */
export const assetOrder = [
  'cash',
  'bank', 
  'digitalServices',
  'stocks',
  'etf',
  'bitcoin',
  'crypto'
];

/**
 * Mappatura asset per compatibilità con nomi alternativi
 */
export const assetMapping = {
  // Nomi alternativi
  'bankReal': 'bank',
  'cashReal': 'cash',
  'digitalServicesReal': 'digitalServices',
  'stocksReal': 'stocks',
  'etfReal': 'etf',
  'bitcoinReal': 'bitcoin',
  'cryptoReal': 'crypto',
  
  // Nomi standard
  bank: 'bank',
  cash: 'cash',
  digitalServices: 'digitalServices',
  stocks: 'stocks',
  etf: 'etf',
  bitcoin: 'bitcoin',
  crypto: 'crypto'
};

export default assetIcons;