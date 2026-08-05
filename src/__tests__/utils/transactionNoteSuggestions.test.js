import { describe, expect, it } from 'vitest';
import { isInstallmentNote, suggestNoteFromHistory } from '../../utils/transactionNoteSuggestions';

describe('isInstallmentNote', () => {
  it.each([
    'PAYPAL *PAGA IN 3 RATE',
    'Rata computer 4/12',
    'Installments laptop',
    'Ratenzahlung',
    'Mensualités téléphone',
    'Pago en cuotas',
    'Compra em parcelas',
  ])('recognizes %s', (note) => {
    expect(isInstallmentNote(note)).toBe(true);
  });

  it('does not classify an ordinary payment as an installment', () => {
    expect(isInstallmentNote('APPLE.COM/IT')).toBe(false);
  });
});

describe('suggestNoteFromHistory', () => {
  it('offers a useful historical note for the same amount and custom category', () => {
    const draft = { amount: 5, notes: 'LABORATORIO DI FIORI', userCategoryId: 42 };
    const history = [{ amount: 5, notes: 'Rosa', userCategoryId: 42 }];
    expect(suggestNoteFromHistory(draft, history)).toBe('Rosa');
  });

  it.each(['Rata', 'Installment', 'Rate', 'Mensualité', 'Cuota', 'Parcela'])(
    'advances an installment sequence when the draft contains %s',
    (word) => {
      const draft = { amount: 100, notes: word, categoryIndex: 10 };
      const history = [{ amount: 100, notes: `${word} computer 3/12`, categoryIndex: 10 }];
      expect(suggestNoteFromHistory(draft, history)).toBe(`${word} computer 4/12`);
    },
  );

  it('does not suggest an unrelated note based only on category', () => {
    expect(suggestNoteFromHistory(
      { amount: 9, notes: 'Coffee', categoryIndex: 1 },
      [{ amount: 30, notes: 'Dinner', categoryIndex: 1 }],
    )).toBeNull();
  });
});
