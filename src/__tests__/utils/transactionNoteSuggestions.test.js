import { describe, expect, it } from 'vitest';
import { inferPaymentTypeLabel, isInstallmentNote, suggestNoteFromHistory } from '../../utils/transactionNoteSuggestions';

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

describe('inferPaymentTypeLabel', () => {
  it.each([
    ['Abbonamento palestra', 'subscription'],
    ['Streaming subscription', 'subscription'],
    ['Addebito periodico assicurazione', 'periodic payment'],
    ['Direct debit insurance', 'periodic payment'],
    ['Prélèvement automatique assurance', 'periodic payment'],
    ['Wiederkehrend Versicherung', 'periodic payment'],
    ['PAYPAL *PAGA IN 3 RATE', 'installment'],
    ['Paiement unique', 'single payment'],
  ])('classifies %s as %s', (note, expected) => {
    expect(inferPaymentTypeLabel(note)).toBe(expected);
  });

  it('learns a non-single type from a similar historical merchant', () => {
    expect(inferPaymentTypeLabel('NETFLIX.COM', [
      { notes: 'Netflix mensile', paymentType: { label: 'subscription' } },
    ])).toBe('subscription');
  });

  it('ignores one recurring outlier among mostly one-off expenses at the same merchant', () => {
    expect(inferPaymentTypeLabel('Cena da Mario', [
      { notes: 'Cena ristorante', paymentType: { label: 'single payment' } },
      { notes: 'Cena amici', paymentType: { label: 'single payment' } },
      { notes: 'Cena aziendale', paymentType: { label: 'periodic payment' } },
    ])).toBeNull();
  });

  it('still learns a recurring type when it is the most common one for that merchant', () => {
    expect(inferPaymentTypeLabel('Palestra settembre', [
      { notes: 'Palestra luglio', paymentType: { label: 'periodic payment' } },
      { notes: 'Palestra agosto', paymentType: { label: 'periodic payment' } },
      { notes: 'Palestra borraccia', paymentType: { label: 'single payment' } },
    ])).toBe('periodic payment');
  });

  it('does not infer a type for unrelated text', () => {
    expect(inferPaymentTypeLabel('Supermercato')).toBeNull();
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
