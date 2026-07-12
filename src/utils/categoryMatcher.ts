/**
 * Fuzzy category matching — free text → PaciFinance category index.
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

/**
 * All outflow category names (English) for fuzzy matching
 */
const OUTFLOW_CATEGORIES = EXPENSE_CATEGORY_CODES.map(c => ({
  index: c.index,
  label: c.translationKey,
}));

/**
 * Aliases for fuzzy matching user categories → PaciFinance categories
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
 * Fuzzy match a user's category string to a PaciFinance category index
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

  // 3. Partial match (category name contained in user input)
  for (const [alias, idx] of Object.entries(CATEGORY_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      if (typeof idx === 'string' && idx.startsWith('income_')) {
        return { index: parseInt(idx.split('_')[1]), label: userCategory, isIncome: true };
      }
      const cat = OUTFLOW_CATEGORIES.find(c => c.index === idx);
      if (cat) return { index: cat.index, label: cat.label, isIncome: false };
    }
  }

  return null; // Unmatched → user must manually map
};
