/**
 * Known bank/current-account CSV export signatures — lets the CSV import
 * wizard skip the manual column-mapping step for recognized exports (mirrors
 * the broker detection in utils/investmentImport/parsers.ts, same
 * match-by-header-name-never-by-index principle).
 *
 * Only formats with a real, verified public header are implemented here
 * (Revolut, N26). Fineco/Intesa Sanpaolo intentionally do NOT have a detector:
 * their export format isn't publicly documented and no verified sample was
 * available at implementation time (see docs/INVESTMENT_IMPORT_RESEARCH.md) —
 * shipping a guessed signature risks silently mis-mapping real transactions,
 * worse than falling back to manual mapping. Files from those banks still
 * import fine through the generic manual-mapping flow.
 */

export type BankFormatId = 'revolut' | 'n26' | 'traderepublic';

export interface BankColumnMapping {
  dateCol: number;
  amountCol: number;
  notesCol: number | null;
  /** Column whose value, once fuzzy-matched, hints at a category (see categoryMatcher.ts). */
  categoryCol: number | null;
  /** Column holding a Merchant Category Code, if any (see categoryMatcher.ts matchCategoryByMCC). */
  mccCol?: number | null;
}

export interface DetectedBankFormat {
  bank: BankFormatId;
  mapping: BankColumnMapping;
  /**
   * Some exports mix rows that don't belong in this wizard at all — e.g.
   * Trade Republic's unified export includes investment trades alongside
   * cash movements, and trades belong in the Investment Import Wizard, not
   * here. Return true to KEEP a row; rows this excludes are counted and
   * reported to the user (see filterReasonKey) rather than silently dropped.
   */
  filterRow?: (row: string[]) => boolean;
  /** i18n key (under dataImport.*) describing what filterRow excludes. */
  filterReasonKey?: string;
}

const findColumn = (header: string[], ...names: string[]): number => {
  const lower = header.map((h) => h.trim().toLowerCase());
  for (const name of names) {
    const idx = lower.indexOf(name.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
};

const hasAll = (header: string[], ...names: string[]): boolean =>
  names.every((name) => findColumn(header, name) !== -1);

/**
 * Detects a known bank export from its header row and returns a ready-to-use
 * column mapping. Returns null when unrecognized (caller falls back to the
 * generic autoDetectColumns heuristic).
 */
export function detectBankFormat(header: string[]): DetectedBankFormat | null {
  // Revolut (current account) — verified header:
  // "Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance"
  if (hasAll(header, 'Type', 'Started Date', 'Completed Date', 'Description', 'Amount')) {
    return {
      bank: 'revolut',
      mapping: {
        dateCol: findColumn(header, 'Completed Date', 'Started Date'),
        amountCol: findColumn(header, 'Amount'),
        notesCol: findColumn(header, 'Description'),
        categoryCol: findColumn(header, 'Type'),
      },
    };
  }

  // N26 — verified header:
  // "Date,Payee,Account number,Transaction type,Payment reference,Category,Amount (EUR),..."
  if (hasAll(header, 'Date', 'Payee', 'Transaction type', 'Category') && findColumn(header, 'Amount (EUR)') !== -1) {
    return {
      bank: 'n26',
      mapping: {
        dateCol: findColumn(header, 'Date'),
        amountCol: findColumn(header, 'Amount (EUR)'),
        notesCol: findColumn(header, 'Payee'),
        categoryCol: findColumn(header, 'Category'),
      },
    };
  }

  // Trade Republic — verified header (unified cash + investment export):
  // "datetime,date,account_type,category,type,asset_class,name,symbol,shares,
  //  price,amount,fee,tax,currency,original_amount,original_currency,fx_rate,
  //  description,transaction_id,counterparty_name,counterparty_iban,
  //  payment_reference,mcc_code"
  // Note: prefers "date" over "datetime" (both present) — see autoDetectColumns
  // for the same exact-name-first rule applied to unrecognized files.
  if (hasAll(header, 'account_type', 'type', 'amount') && findColumn(header, 'date') !== -1) {
    const accountTypeIdx = findColumn(header, 'account_type');
    const typeIdx = findColumn(header, 'type');
    return {
      bank: 'traderepublic',
      mapping: {
        dateCol: findColumn(header, 'date'),
        amountCol: findColumn(header, 'amount'),
        notesCol: findColumn(header, 'name', 'description'),
        categoryCol: typeIdx,
        mccCol: findColumn(header, 'mcc_code', 'mcc') !== -1 ? findColumn(header, 'mcc_code', 'mcc') : null,
      },
      // Trade Republic's export mixes cash-account movements with investment
      // trades (account_type "TRADING", type "BUY"/"SELL") — those belong in
      // the Investment Import Wizard, not here.
      filterRow: (row) => {
        const accountType = (row[accountTypeIdx] || '').trim().toUpperCase();
        const type = (row[typeIdx] || '').trim().toUpperCase();
        if (accountType === 'TRADING') return false;
        if (type === 'BUY' || type === 'SELL') return false;
        return true;
      },
      filterReasonKey: 'traderepublicInvestmentRowsSkipped',
    };
  }

  return null;
}
