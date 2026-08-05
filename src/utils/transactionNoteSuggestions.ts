import { tokenizeNote } from './categoryPatterns';

export interface NoteSuggestionEntry {
  notes?: string | null;
  amount: number;
  date?: string | null;
  categoryIndex?: number | null;
  userCategoryId?: number | null;
}

const INSTALLMENT_WORDS = /\b(rata|rate|ratenzahlung|installment|instalment|mensualite|echeance|cuota|plazo|parcela|prestacao)\b/i;
const INSTALLMENT_SEQUENCE = /\b(\d{1,3})\s*(?:\/|di|of|von|sur|de)\s*(\d{1,3})\b/i;

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
    const normalizedDraft = draftNote.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedHistory = note.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (INSTALLMENT_WORDS.test(normalizedDraft) || INSTALLMENT_WORDS.test(normalizedHistory)) {
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
