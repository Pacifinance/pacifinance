/**
 * Tests for DeleteTransactionModal
 *
 * Verifies title/explanation logic and button wiring. Does not exercise the
 * MUI Select dropdown (portal-based) beyond presence of label/hint text.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import DeleteTransactionModal from '../../components/DeleteTransactionModal';

const translations = {
  insert: {
    deleteTransaction: {
      titleOutflow: 'Delete outflow',
      titleIncome: 'Delete income',
      transactionDateLabel: 'Date',
      transactionAmountLabel: 'Amount',
      balanceSourceLabel: 'Balance source',
      balanceSourceNone: 'None (skip)',
      noBalanceChange: 'NO_BALANCE_CHANGE',
      explanationCurrentOutflow: 'CURRENT_OUTFLOW',
      explanationCurrentIncome: 'CURRENT_INCOME',
      explanationPastOutflow: 'PAST_OUTFLOW_{month}',
      explanationPastIncome: 'PAST_INCOME_{month}',
      confirm: 'Delete',
      cancel: 'Cancel',
    },
  },
};

const theme = { mode: 'light', textColor: '#000' };
const currencyCtx = { formatAmount: (v) => `€${Number(v).toFixed(2)}` };
const balanceOptions = { Bank: [0, () => {}] };

function renderModal(props = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const onChangeSelectedOption = vi.fn();
  // Pick a date in the current month so the "current" explanation renders
  // deterministically without depending on wall-clock time.
  const today = new Date();
  const currentIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-15`;
  const utils = render(
    <LanguageContext.Provider value={{ language: 'en', translations }}>
      <CurrencyContext.Provider value={currencyCtx}>
        <DeleteTransactionModal
          isOpen
          theme={theme}
          isOutflow
          transactionDate={currentIso}
          transactionAmount={42}
          balanceOptions={balanceOptions}
          selectedOption=""
          onChangeSelectedOption={onChangeSelectedOption}
          onConfirm={onConfirm}
          onCancel={onCancel}
          {...props}
        />
      </CurrencyContext.Provider>
    </LanguageContext.Provider>,
  );
  return { ...utils, onConfirm, onCancel, onChangeSelectedOption, currentIso };
}

describe('DeleteTransactionModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders nothing when isOpen is false', () => {
    const { container } = renderModal({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the outflow title when isOutflow is true', () => {
    renderModal();
    expect(screen.getByText('Delete outflow')).toBeInTheDocument();
  });

  it('shows the income title when isOutflow is false', () => {
    renderModal({ isOutflow: false });
    expect(screen.getByText('Delete income')).toBeInTheDocument();
  });

  it('wires Cancel and Confirm buttons to the corresponding callbacks', () => {
    const { onCancel, onConfirm } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders the current-month explanation for a transaction in the current month', () => {
    renderModal({ isOutflow: true });
    expect(screen.getByText('CURRENT_OUTFLOW')).toBeInTheDocument();
  });

  it('renders the past-month explanation with month substitution for a past date', () => {
    renderModal({ isOutflow: true, transactionDate: '2020-06-15' });
    // Match any rendering where PAST_OUTFLOW_ prefix is followed by a month label
    expect(screen.getByText(/^PAST_OUTFLOW_.+/)).toBeInTheDocument();
  });

  it('formats the transaction amount via CurrencyContext', () => {
    renderModal({ transactionAmount: 42 });
    expect(screen.getByText(/€42\.00/)).toBeInTheDocument();
  });
});
