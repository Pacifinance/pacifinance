/**
 * Client-side, offline text parser for the quick-add "paste or dictate" field.
 * Extracts a plausible amount and guesses a category from free text — e.g.
 * "24,90 spesa al supermercato" or a phone's own dictated "quaranta euro
 * benzina". Runs entirely in the browser (plain regex + the existing import
 * wizard's fuzzy category matcher): no text, audio, or image is ever sent
 * anywhere. This is the privacy-preserving alternative to cloud speech-to-text
 * or OCR — see todo.md's Fase 1 for the rationale.
 */
import { matchCategory } from './categoryMatcher';

export interface SmartPasteResult {
  amount: number | null;
  categoryIndex: number | null;
  isIncome: boolean | null;
}

const CURRENCY_HINT = /(€|\$|£|eur\b|euro\b|dollari?\b|dollars?\b)/i;

/**
 * Parses free text into a best-effort amount + category guess. Never throws;
 * returns nulls for anything it can't confidently extract, so the caller can
 * fall back to asking the user to fill the field manually.
 */
export function parseSmartPasteText(rawText: string): SmartPasteResult {
  const text = (rawText || '').trim();
  if (!text) return { amount: null, categoryIndex: null, isIncome: null };

  // Amount: scan every number-like token, prefer the one adjacent to a
  // currency symbol/word (handles "spesa 12 minuti fa, 24,90€ al bar" style
  // text where an unrelated number could otherwise be picked first).
  const numberRegex = /\d{1,6}(?:[.,]\d{1,2})?/g;
  const matches = [...text.matchAll(numberRegex)];
  let amount: number | null = null;
  if (matches.length > 0) {
    const withCurrency = matches.find((m) => {
      const start = m.index ?? 0;
      const before = text.slice(Math.max(0, start - 6), start);
      const after = text.slice(start + m[0].length, start + m[0].length + 6);
      return CURRENCY_HINT.test(before) || CURRENCY_HINT.test(after);
    });
    const chosen = withCurrency ?? matches[0];
    const parsed = parseFloat(chosen[0].replace(',', '.'));
    amount = Number.isFinite(parsed) ? parsed : null;
  }

  // Category: reuse the CSV/Excel import wizard's fuzzy matcher (same
  // Italian/English alias dictionary) instead of duplicating it.
  const matched = matchCategory(text);

  return {
    amount,
    categoryIndex: matched?.index ?? null,
    isIncome: matched?.isIncome ?? null,
  };
}
