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

export type BankFormatId = 'revolut' | 'n26' | 'traderepublic' | 'paypal';

/**
 * Default balance macrocategory for each detected bank/provider — used by the
 * import wizard to preselect a sensible payment source when the user hasn't
 * (yet) linked a specific liquidity sub-account to this provider (see
 * DataImportWizard.tsx and user_liquidity_accounts.linked_bank_key).
 */
export const BANK_FORMAT_ASSET_KEY: Record<BankFormatId, 'bank' | 'digitalServices'> = {
  traderepublic: 'bank',
  n26: 'bank',
  revolut: 'digitalServices',
  paypal: 'digitalServices',
};

export interface BankColumnMapping {
  dateCol: number;
  amountCol: number;
  notesCol: number | null;
  /** Column whose value, once fuzzy-matched, hints at a category (see categoryMatcher.ts). */
  categoryCol: number | null;
  /** Column holding a Merchant Category Code, if any (see categoryMatcher.ts matchCategoryByMCC). */
  mccCol?: number | null;
  /** Column holding a full timestamp, when dateCol itself is day-only (e.g. Trade Republic's own "date" vs "datetime"). */
  timeCol?: number | null;
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
  /** Removes or replaces sensitive source values before preview and parsing. */
  sanitizeRow?: (row: string[]) => string[];
  /**
   * Per-row override for fields processRows() can't infer from the generic
   * column mapping alone — e.g. Trade Republic's cashback-into-shares reward
   * rows, which are real money moving straight into a holding, not a cash
   * inflow, so they need `purpose: 'investment'` and to be kept out of
   * income statistics rather than imported as generic income.
   */
  annotateRow?: (row: string[]) => { purpose?: string; excludeFromStatistics?: boolean } | null;
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
 * Shared vocabulary for semantically equivalent export columns. Detectors use
 * these concepts instead of branching on a bank export's UI language. Adding
 * a newly observed translation therefore extends every compatible detector.
 */
export const BANK_COLUMN_ALIASES = {
  type: ['Type', 'Tipo', 'Typ', 'Art'],
  product: ['Product', 'Prodotto', 'Produkt', 'Produit', 'Producto', 'Produto'],
  startedDate: ['Started Date', 'Data di inizio', 'Startdatum', 'Date de début', 'Fecha de inicio', 'Data de início'],
  completedDate: ['Completed Date', 'Data di completamento', 'Abschlussdatum', 'Date de finalisation', 'Fecha de finalización', 'Data de conclusão'],
  description: ['Description', 'Descrizione', 'Beschreibung', 'Descripción', 'Descrição'],
  amount: ['Amount', 'Importo', 'Betrag', 'Montant', 'Importe', 'Valor'],
  date: ['Date', 'Data', 'Datum', 'Fecha'],
  time: ['Time', 'Ora', 'Uhrzeit', 'Heure', 'Hora'],
  currency: ['Currency', 'Valuta', 'Währung', 'Devise', 'Divisa', 'Moeda'],
  net: ['Net', 'Netto', 'Nettobetrag', 'Montant net', 'Neto', 'Líquido'],
  name: ['Name', 'Nome', 'Name des Empfängers', 'Nom', 'Nombre'],
  transactionId: ['Transaction ID', 'Codice transazione', 'Transaktionscode', 'Numéro de transaction', 'Código de transacción', 'Código da transação'],
  senderEmail: ['From Email Address', 'Indirizzo email mittente', 'E-Mail-Adresse des Absenders', "Adresse email de l'expéditeur", 'Correo electrónico del remitente', 'E-mail do remetente'],
} as const;

type BankColumnConcept = keyof typeof BANK_COLUMN_ALIASES;

const findConcept = (header: string[], concept: BankColumnConcept): number =>
  findColumn(header, ...BANK_COLUMN_ALIASES[concept]);

const hasConcepts = (header: string[], ...concepts: BankColumnConcept[]): boolean =>
  concepts.every((concept) => findConcept(header, concept) !== -1);

/**
 * Detects a known bank export from its header row and returns a ready-to-use
 * column mapping. Returns null when unrecognized (caller falls back to the
 * generic autoDetectColumns heuristic).
 */
export function detectBankFormat(header: string[]): DetectedBankFormat | null {
  // PayPal activity report — verified against a real localized export. Email,
  // transaction IDs, bank-account data and invoice references are deliberately
  // not mapped, so they never enter the API payload.
  if (hasConcepts(header, 'date', 'time', 'description', 'currency', 'net', 'name', 'transactionId', 'senderEmail')) {
    const descriptionIdx = findConcept(header, 'description');
    const nameIdx = findConcept(header, 'name');
    const sensitiveIndexes = header.flatMap((value, index) => {
      const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return /(e-?mail|transaction|transazione|transaktions|codice|bank|banc|conto|account|fattura|invoice|rechnung|referenc|riferimento|referencia)/.test(normalized)
        ? [index]
        : [];
    });
    const looksLikeBusiness = (value: string): boolean =>
      /(?:\b(?:srl|spa|sas|ltd|limited|gmbh|inc|llc|plc|sa|sca)\b|\.com\b|airlines?\b)/i.test(value.trim());
    const technicalRows = [
      /versamento generico con carta/i,
      /generic card deposit/i,
      /pagamento con credito acquirenti paypal/i,
      /paypal buyer credit payment/i,
      /conversione di valuta/i,
      /currency conversion/i,
      /blocco conto per autorizzazione/i,
      /authorization hold/i,
      /storno di blocco conto/i,
      /reversal of.*hold/i,
    ];
    return {
      bank: 'paypal',
      mapping: {
        dateCol: findConcept(header, 'date'),
        amountCol: findConcept(header, 'net'),
        notesCol: findConcept(header, 'name'),
        categoryCol: descriptionIdx,
        timeCol: findConcept(header, 'time'),
      },
      filterRow: (row) => !technicalRows.some((pattern) => pattern.test((row[descriptionIdx] || '').trim())),
      filterReasonKey: 'paypalTechnicalRowsSkipped',
      sanitizeRow: (row) => {
        const sanitized = [...row];
        sensitiveIndexes.forEach((index) => { sanitized[index] = ''; });
        // Personal counterpart names are not persisted as notes. Verified
        // company names remain useful for categorization; otherwise fall back
        // to PayPal's neutral transaction description.
        if (!looksLikeBusiness(row[nameIdx] || '')) sanitized[nameIdx] = row[descriptionIdx] || '';
        return sanitized;
      },
    };
  }

  // Revolut (current account) — verified header:
  // "Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance"
  if (hasConcepts(header, 'type', 'product', 'startedDate', 'completedDate', 'description', 'amount')) {
    const completedDateCol = findConcept(header, 'completedDate');
    return {
      bank: 'revolut',
      mapping: {
        dateCol: completedDateCol,
        amountCol: findConcept(header, 'amount'),
        notesCol: findConcept(header, 'description'),
        categoryCol: findConcept(header, 'type'),
        timeCol: completedDateCol,
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
        // "date" (day-only) is dateCol above; "datetime" carries the actual
        // time-of-day, useful to tell a work purchase from a personal one
        // even when they land on the same day.
        timeCol: findColumn(header, 'datetime') !== -1 ? findColumn(header, 'datetime') : null,
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
      // BENEFITS_SAVEBACK rows are a reward Trade Republic invests directly
      // into an existing holding — no cash actually moves, so this isn't
      // real income (unlike INTEREST_PAYMENT, which is genuine cash income
      // and is left untouched). Flagging it keeps it out of income stats
      // until it can be reconciled against the holding it funded (tracked
      // separately in todo.md - not done automatically yet).
      annotateRow: (row) => {
        const type = (row[typeIdx] || '').trim().toUpperCase();
        if (type === 'BENEFITS_SAVEBACK') return { purpose: 'investment', excludeFromStatistics: true };
        return null;
      },
    };
  }

  return null;
}
