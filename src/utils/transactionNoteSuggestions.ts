import { tokenizeNote } from './categoryPatterns';

export interface NoteSuggestionEntry {
  notes?: string | null;
  amount: number;
  date?: string | null;
  categoryIndex?: number | null;
  userCategoryId?: number | null;
}

const INSTALLMENT_WORDS = /\b(rata|rate|raten|ratenzahlung|installments?|instalments?|mensualites?|echeances?|cuotas?|plazos?|parcelas?|prestacoes?)\b/i;
const INSTALLMENT_SEQUENCE = /\b(\d{1,3})\s*(?:\/|di|of|von|sur|de)\s*(\d{1,3})\b/i;
const SUBSCRIPTION_WORDS = /\b(abbonamento|subscription|membership|abo|abonnement|suscripcion|assinatura)\b/i;
const PERIODIC_WORDS = /\b(periodic[oa]?|periodique|periodisch|periodico|recurring|ricorrente|recurrente|wiederkehrend|domiciliazione|lastschrift|addebito (?:diretto|automatico)|direct debit|prelevement automatique|domiciliacion|debito direto)\b/i;
const SINGLE_WORDS = /\b(pagamento unico|single payment|one off|einmalzahlung|paiement unique|pago unico|pagamento unico)\b/i;

export type PaymentTypeLabel = 'single payment' | 'subscription' | 'installment' | 'periodic payment';

export interface PaymentTypeHistoryEntry {
  notes?: string | null;
  paymentType?: { label?: string | null } | string | null;
}

const normalizeForRecognition = (value: string | null | undefined): string =>
  (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function sameCategory(a: NoteSuggestionEntry, b: NoteSuggestionEntry): boolean {
  if (a.userCategoryId != null || b.userCategoryId != null) return a.userCategoryId != null && a.userCategoryId === b.userCategoryId;
  return a.categoryIndex != null && a.categoryIndex === b.categoryIndex;
}

function advanceInstallment(note: string): string | null {
  const match = note.match(INSTALLMENT_SEQUENCE);
  if (!match) return null;
  const current = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isFinite(current) || !Number.isFinite(total) || current >= total) return null;
  return note.replace(match[0], match[0].replace(match[1], String(current + 1)));
}

/** Recognizes installment wording in every language currently supported by the app. */
export function isInstallmentNote(note: string | null | undefined): boolean {
  const normalized = normalizeForRecognition(note);
  return INSTALLMENT_WORDS.test(normalized);
}

/** Infers an expense payment type from explicit wording, then from similar historical merchants. */
export function inferPaymentTypeLabel(
  note: string | null | undefined,
  history: PaymentTypeHistoryEntry[] = [],
): PaymentTypeLabel | null {
  const normalized = normalizeForRecognition(note);
  if (!normalized) return null;
  if (isInstallmentNote(normalized)) return 'installment';
  if (SUBSCRIPTION_WORDS.test(normalized)) return 'subscription';
  if (PERIODIC_WORDS.test(normalized)) return 'periodic payment';
  if (SINGLE_WORDS.test(normalized)) return 'single payment';

  const tokens = new Set(tokenizeNote(normalized));
  if (tokens.size === 0) return null;
  for (const entry of history) {
    const sharesMerchant = tokenizeNote(entry.notes).some((token) => tokens.has(token));
    if (!sharesMerchant) continue;
    const label = typeof entry.paymentType === 'string' ? entry.paymentType : entry.paymentType?.label;
    if (label === 'subscription' || label === 'installment' || label === 'periodic payment') return label;
  }
  return null;
}

/** Returns a historical note worth offering to the user; it never mutates the draft. */
export function suggestNoteFromHistory(
  draft: NoteSuggestionEntry,
  history: NoteSuggestionEntry[],
): string | null {
  const draftNote = (draft.notes || '').trim();
  const draftTokens = new Set(tokenizeNote(draftNote));
  let best: { note: string; score: number } | null = null;

  for (const entry of history) {
    const note = (entry.notes || '').trim();
    if (!note || note.toLocaleLowerCase() === draftNote.toLocaleLowerCase()) continue;
    const amountMatches = Math.abs(Number(entry.amount) - Number(draft.amount)) <= 0.01;
    const categoryMatches = sameCategory(draft, entry);
    const sharedTokens = tokenizeNote(note).filter((token) => draftTokens.has(token)).length;
    let score = (amountMatches ? 3 : 0) + (categoryMatches ? 3 : 0) + Math.min(sharedTokens, 2) * 3;

    let suggestion = note;
    if (isInstallmentNote(draftNote) || isInstallmentNote(note)) {
      const advanced = advanceInstallment(note);
      if (advanced) {
        suggestion = advanced;
        score += 5;
      }
    }
    if (score >= 6 && (!best || score > best.score)) best = { note: suggestion, score };
  }
  return best?.note ?? null;
}
