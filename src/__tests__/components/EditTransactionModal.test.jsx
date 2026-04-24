/**
 * Tests for EditTransactionModal
 *
 * Focuses on the modal's decision logic (confirm disabled, skip vs source
 * callback, explanation text, delta preview) rather than MUI Select's
 * portal-based dropdown UI.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import EditTransactionModal from '../../components/EditTransactionModal';

const translations = {
  insert: {
    editTransaction: {
      titleOutflow: 'Edit outflow',
      titleIncome: 'Edit income',
      subtitle: 'SUBTITLE',
      before: 'Before',
      after: 'After',
      explanationSameMonth: 'SAME_MONTH_EXPLANATION',
      explanationDifferentMonths: 'DIFFERENT_MONTHS_EXPLANATION',
      balanceSourceLabel: 'Balance source',
      balanceSourcePlaceholder: 'Select…',
      balanceSourceNone: "Don't update balances",
      balanceSourceRecommended: 'RECOMMENDED_HINT',
      noBalanceChange: 'NO_BALANCE_CHANGE_HINT',
      confirm: 'Confirm edit',
      cancel: 'Cancel',
    },
  },
};

const theme = { mode: 'light', textColor: '#000' };
const currencyCtx = { formatAmount: (v) => `€${Number(v).toFixed(2)}` };
const balanceOptions = { Bank: [0, () => {}], Cash: [0, () => {}] };

function renderModal(props = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const onChangeSelectedSource = vi.fn();
  const utils = render(
    <LanguageContext.Provider value={{ language: 'en', translations }}>
      <CurrencyContext.Provider value={currencyCtx}>
        <EditTransactionModal
          isOpen
          theme={theme}
          isOutflow
          originalDate="2026-03-10"
          originalAmount={10}
          editedDate="2026-03-20"
          editedAmount={12}
          balanceOptions={balanceOptions}
          selectedSource=""
          onChangeSelectedSource={onChangeSelectedSource}
          onConfirm={onConfirm}
          onCancel={onCancel}
          {...props}
        />
      </CurrencyContext.Provider>
    </LanguageContext.Provider>,
  );
  return { ...utils, onConfirm, onCancel, onChangeSelectedSource };
}

describe('EditTransactionModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders nothing when isOpen is false', () => {
    const { container } = renderModal({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the outflow title when isOutflow is true', () => {
    renderModal();
    expect(screen.getByText('Edit outflow')).toBeInTheDocument();
  });

  it('shows the income title when isOutflow is false', () => {
    renderModal({ isOutflow: false });
    expect(screen.getByText('Edit income')).toBeInTheDocument();
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    const { onCancel } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables Confirm when no source is selected and shows the recommended hint', () => {
    renderModal();
    const confirmBtn = screen.getByRole('button', { name: /confirm edit/i });
    expect(confirmBtn).toBeDisabled();
    expect(screen.getByText('RECOMMENDED_HINT')).toBeInTheDocument();
  });

  it('enables Confirm and forwards the chosen source when a balance source is selected', () => {
    const { onConfirm, rerender } = renderModal({ selectedSource: 'Bank' });
    const confirmBtn = screen.getByRole('button', { name: /confirm edit/i });
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith('Bank');
    // keep rerender reference used so linter is happy
    expect(typeof rerender).toBe('function');
  });

  it('passes null to onConfirm when the skip option is active', () => {
    const { onConfirm } = renderModal({ selectedSource: '__skip__' });
    expect(screen.getByText('NO_BALANCE_CHANGE_HINT')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /confirm edit/i });
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith(null);
  });

  it('shows the same-month explanation when original and edited dates share month+year', () => {
    renderModal({
      originalDate: '2026-03-01',
      editedDate: '2026-03-28',
    });
    expect(screen.getByText('SAME_MONTH_EXPLANATION')).toBeInTheDocument();
    expect(screen.queryByText('DIFFERENT_MONTHS_EXPLANATION')).not.toBeInTheDocument();
  });

  it('shows the different-months explanation when months differ', () => {
    renderModal({
      originalDate: '2026-03-10',
      editedDate: '2026-04-05',
    });
    expect(screen.getByText('DIFFERENT_MONTHS_EXPLANATION')).toBeInTheDocument();
    expect(screen.queryByText('SAME_MONTH_EXPLANATION')).not.toBeInTheDocument();
  });

  it('renders the before and after amounts formatted via CurrencyContext', () => {
    renderModal({ originalAmount: 10, editedAmount: 12 });
    expect(screen.getByText('€10.00')).toBeInTheDocument();
    expect(screen.getByText('€12.00')).toBeInTheDocument();
  });
});
