/**
 * Fuzzy category matching — free text → Pacifinance category index.
 *
 * Deliberately isolated from utils/dataImport.ts (which re-exports
 * matchCategory for backward compatibility): dataImport.ts pulls in
 * papaparse + exceljs at module scope for CSV/Excel parsing, and those are
 * only meant to load lazily (DataImportWizard is lazy-imported). Anything
 * eagerly-rendered that needs matchCategory — like the quick-add smart-paste
 * parser — must import it from here instead, or it drags exceljs into the
 * main bundle (confirmed via a build-size regression: ~1MB added to the
 * eagerly-loaded entry chunk).
 */
import { EXPENSE_CATEGORY_CODES, getCategoryIndexByLabel } from '../data/expenseCategoryCodes';

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * All outflow category names (English) for fuzzy matching
 */
const OUTFLOW_CATEGORIES = EXPENSE_CATEGORY_CODES.map(c => ({
  index: c.index,
  label: c.translationKey,
}));

/**
 * Aliases for fuzzy matching user categories → Pacifinance categories
 */
const CATEGORY_ALIASES = {
  // Italian aliases
  'alimentari': 4, 'cibo': 4, 'spesa': 4, 'supermercato': 4, 'ristorante': 4, 'pranzo': 4, 'cena': 4, 'bar': 4,
  'casa': 5, 'affitto': 5, 'mutuo': 5, 'condominio': 5, 'bollette': 5, 'utenze': 5,
  'salute': 9, 'farmacia': 9, 'medico': 9, 'dentista': 9, 'palestra': 9,
  'istruzione': 15, 'scuola': 15, 'università': 15, 'corso': 15, 'libri': 15,
  'viaggio': 7, 'vacanza': 7, 'volo': 7,
  'shopping': 3, 'abbigliamento': 3, 'vestiti': 3, 'scarpe': 3, 'amazon': 3,
  'divertimento': 6, 'svago': 6, 'cinema': 6, 'netflix': 6, 'spotify': 6,
  'trasporto': 12, 'treno': 12, 'metro': 12, 'benzina': 11, 'auto': 11, 'macchina': 11, 'assicurazione auto': 11,
  'regalo': 2, 'regali': 2,
  'tasse': 10, 'tassa': 10, 'irpef': 10, 'iva': 10,
  'investimento': 8, 'investimenti': 8, 'azioni': 8, 'etf': 8, 'crypto': 8, 'bitcoin': 8,
  'animali': 13, 'veterinario': 13, 'cane': 13, 'gatto': 13,
  'progetto': 14, 'hobby': 14,
  'servizio digitale': 1, 'abbonamento': 1, 'app': 1, 'cloud': 1,
  // English aliases
  'food': 4, 'grocery': 4, 'groceries': 4, 'restaurant': 4, 'dining': 4, 'lunch': 4, 'dinner': 4,
  'house': 5, 'rent': 5, 'mortgage': 5, 'utilities': 5, 'bills': 5,
  'health': 9, 'pharmacy': 9, 'doctor': 9, 'gym': 9, 'fitness': 9,
  'education': 15, 'school': 15, 'university': 15, 'course': 15, 'books': 15,
  'travel': 7, 'travelling': 7, 'vacation': 7, 'flight': 7, 'hotel': 7,
  'clothes': 3, 'clothing': 3, 'shoes': 3,
  'entertainment': 6, 'fun': 6, 'leisure': 6, 'free time': 6,
  'transport': 12, 'transports': 12, 'train': 12, 'bus': 12, 'gas': 11, 'car': 11, 'vehicle': 11, 'fuel': 11,
  'gift': 2, 'gifts': 2,
  'tax': 10, 'taxes': 10,
  'investment': 8, 'investing': 8, 'stocks': 8,
  'pets': 13, 'pet': 13, 'vet': 13,
  'project': 14, 'personal project': 14,
  'digital service': 1, 'subscription': 1, 'software': 1,
  'other': 9999, 'altro': 9999, 'miscellaneous': 9999, 'misc': 9999, 'varie': 9999,
  // Income aliases
  'stipendio': 'income_0', 'salary': 'income_0', 'wage': 'income_0', 'pay': 'income_0',
  'freelance': 'income_1', 'reddito freelance': 'income_1', 'freelance income': 'income_1', 'consulenza': 'income_1',
  'entrata extra': 'income_2', 'extra income': 'income_2', 'bonus': 'income_2', 'rimborso': 'income_2',
  'pensione': 'income_4', 'retirement': 'income_4',
};

/**
 * Merchant Category Code (ISO 18245) → Pacifinance category index.
 *
 * MCCs are assigned by the card networks (Visa/Mastercard/Amex) to every
 * merchant, so most bank/broker CSV exports for card transactions carry one
 * — a bank-agnostic categorization signal that works even for a brand-new
 * user with no prior transaction history to learn from (unlike
 * categoryPatterns.ts, which needs existing data to suggest anything). Not
 * exhaustive — covers the codes actually seen day-to-day in consumer
 * spending; anything unlisted falls back to the default category, same as
 * an unmatched free-text category string.
 */
const MCC_CATEGORY = {
  // Food (4)
  '5411': 4, '5422': 4, '5441': 4, '5451': 4, '5462': 4, '5499': 4,
  '5811': 4, '5812': 4, '5813': 4, '5814': 4,
  // House / utilities (5)
  '4900': 5, '6513': 5,
  // Free time (6)
  '7829': 6, '7832': 6, '7841': 6, '7922': 6, '7929': 6, '7991': 6,
  '7996': 6, '7997': 6, '7998': 6, '7999': 6, '5941': 6, '5945': 6,
  // Travelling (7)
  '4511': 7, '4411': 7, '4722': 7, '7011': 7, '7512': 7,
  // Investment (8)
  '6211': 8,
  // Health (9)
  '5912': 9, '8011': 9, '8021': 9, '8031': 9, '8041': 9, '8042': 9,
  '8049': 9, '8050': 9, '8062': 9, '8071': 9, '8099': 9,
  // Tax (10)
  '9311': 10,
  // Vehicle (11)
  '5511': 11, '5531': 11, '5532': 11, '5533': 11, '5541': 11, '5542': 11,
  '7531': 11, '7534': 11, '7535': 11, '7538': 11, '7542': 11, '7549': 11,
  // Transports (12)
  '4111': 12, '4112': 12, '4121': 12, '4131': 12, '4784': 12,
  // Pets (13)
  '0742': 13, '5995': 13,
  // Education (15)
  '8211': 15, '8220': 15, '8241': 15, '8244': 15, '8249': 15, '8299': 15,
  '5192': 15, '5942': 15, '5943': 15,
  // Shopping (3)
  '5311': 3, '5399': 3, '5611': 3, '5621': 3, '5631': 3, '5641': 3,
  '5651': 3, '5661': 3, '5691': 3, '5732': 3, '5734': 3, '5944': 3,
  '5977': 3, '5999': 3, '7230': 3, '7298': 3,
  // Digital service (1)
  '4812': 1, '4814': 1, '4816': 1, '4899': 1, '5815': 1, '5816': 1,
  '5817': 1, '5818': 1, '7372': 1,
  // Gift (2)
  '4829': 2, '5947': 2, '5992': 2,
};

/**
 * Match a Merchant Category Code to a Pacifinance outflow category.
 * @param {string} mcc
 * @returns {{ index: number, label: string } | null}
 */
export const matchCategoryByMCC = (mcc) => {
  if (!mcc) return null;
  const code = String(mcc).trim().padStart(4, '0');
  const index = MCC_CATEGORY[code];
  if (index === undefined) return null;
  const cat = OUTFLOW_CATEGORIES.find(c => c.index === index);
  return cat ? { index: cat.index, label: cat.label } : null;
};

/**
 * Fuzzy match a user's category string to a Pacifinance category index
 * @param {string} userCategory
 * @returns {{ index: number, label: string, isIncome: boolean } | null}
 */
export const matchCategory = (userCategory) => {
  if (!userCategory) return null;
  const normalized = userCategory.toLowerCase().trim();

  // 1. Exact match in aliases
  if (CATEGORY_ALIASES[normalized] !== undefined) {
    const val = CATEGORY_ALIASES[normalized];
    if (typeof val === 'string' && val.startsWith('income_')) {
      return { index: parseInt(val.split('_')[1]), label: userCategory, isIncome: true };
    }
    const cat = OUTFLOW_CATEGORIES.find(c => c.index === val);
    return cat ? { index: cat.index, label: cat.label, isIncome: false } : null;
  }

  // 2. Try direct label match
  const directIndex = getCategoryIndexByLabel(normalized);
  if (directIndex !== null) {
    const cat = OUTFLOW_CATEGORIES.find(c => c.index === directIndex);
    return cat ? { index: cat.index, label: cat.label, isIncome: false } : null;
  }

  // 3. Partial match (category name contained in user input) — word-boundary
  // aware in the "alias found inside a longer input" direction, so a short
  // alias like "car" doesn't spuriously match inside an unrelated word (e.g.
  // a bank's raw transaction-type value "CARD_TRANSACTION" is not a car
  // expense; plain substring search would wrongly say it is).
  for (const [alias, idx] of Object.entries(CATEGORY_ALIASES)) {
    const aliasFoundAsWord = new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i').test(normalized);
    if (aliasFoundAsWord || alias.includes(normalized)) {
      if (typeof idx === 'string' && idx.startsWith('income_')) {
        return { index: parseInt(idx.split('_')[1]), label: userCategory, isIncome: true };
      }
      const cat = OUTFLOW_CATEGORIES.find(c => c.index === idx);
      if (cat) return { index: cat.index, label: cat.label, isIncome: false };
    }
  }

  return null; // Unmatched → user must manually map
};
