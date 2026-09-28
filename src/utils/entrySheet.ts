/**
 * Every "add something" action in the app is URL-addressable through a single
 * `?add=<type>` search param, handled globally by QuickAddTransaction (mounted
 * on every authenticated page via Sidebar). This is what lets the "+" menu,
 * dashboard shortcuts, onboarding, push notifications and old
 * `/insert-values?section=...` links all open the exact same form, on top of
 * whatever page the user is on — and lets the phone's back button close it.
 */
export const ENTRY_PARAM = 'add';
/** Optional "M-YYYY" month for the balance form (e.g. from the Transactions page's month picker). */
export const ENTRY_MONTH_PARAM = 'month';

/** Forms rendered in the entry sheet (InsertValues in "entry" mode). */
export const SHEET_ENTRY_TYPES = ['outflow', 'income', 'balance'] as const;
/** Other panels/wizards the "+" menu can open. */
export const PANEL_ENTRY_TYPES = ['import', 'investmentImport', 'recurring', 'shared'] as const;

export type SheetEntryType = typeof SHEET_ENTRY_TYPES[number];
export type EntryType = SheetEntryType | typeof PANEL_ENTRY_TYPES[number];

const ALL_ENTRY_TYPES: readonly string[] = [...SHEET_ENTRY_TYPES, ...PANEL_ENTRY_TYPES];

export const isEntryType = (value: unknown): value is EntryType =>
  typeof value === 'string' && ALL_ENTRY_TYPES.includes(value);

export const isSheetEntryType = (value: unknown): value is SheetEntryType =>
  typeof value === 'string' && (SHEET_ENTRY_TYPES as readonly string[]).includes(value);

/**
 * Maps the legacy `/insert-values?section=...` values (still linked from old
 * bookmarks, emails and push notifications) onto an entry type.
 */
export const legacySectionToEntryType = (section: string | null): EntryType | null => {
  switch (section) {
    case 'balance': return 'balance';
    case 'income': return 'income';
    case 'outflow': return 'outflow';
    case 'import': return 'import';
    default: return null;
  }
};

/** Parses an "M-YYYY" month param into { month, year }, or null when absent/invalid. */
export const parseEntryMonth = (value: string | null): { month: number; year: number } | null => {
  if (!value) return null;
  const match = /^(\d{1,2})-(\d{4})$/.exec(value);
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { month, year };
};
