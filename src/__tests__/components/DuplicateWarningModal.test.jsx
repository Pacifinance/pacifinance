/**
 * Tests for DuplicateWarningModal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import DuplicateWarningModal from '../../components/DuplicateWarningModal';

const translations = {
  insert: {
    duplicateWarning: {
      titleOutflow: 'Possible duplicate outflow',
      titleIncome: 'Possible duplicate income',
      badge: 'BADGE',
      subtitle: 'SUBTITLE',
      existingLabel: 'Existing transaction',
      newLabel: 'New transaction',
      confirm: 'Save anyway',
      cancel: 'Cancel',
    },
  },
};

const theme = { mode: 'light', textColor: '#000' };
const currencyCtx = { formatAmount: (v) => `€${Number(v).toFixed(2)}` };

function renderModal(props = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const utils = render(
    <LanguageContext.Provider value={{ language: 'en', translations }}>
      <CurrencyContext.Provider value={currencyCtx}>
        <DuplicateWarningModal
          isOpen
          theme={theme}
          isOutflow
          existingDate="2026-03-10"
          existingAmount={40}
          existingNote="Uber"
          newDate="2026-03-11"
          newAmount={40}
          newNote="Uber"
          onConfirm={onConfirm}
          onCancel={onCancel}
          {...props}
        />
      </CurrencyContext.Provider>
    </LanguageContext.Provider>,
  );
  return { ...utils, onConfirm, onCancel };
}

describe('DuplicateWarningModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders nothing when isOpen is false', () => {
    const { container } = renderModal({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the outflow title when isOutflow is true', () => {
    renderModal();
    expect(screen.getByText('Possible duplicate outflow')).toBeInTheDocument();
  });

  it('shows the income title when isOutflow is false', () => {
    renderModal({ isOutflow: false });
    expect(screen.getByText('Possible duplicate income')).toBeInTheDocument();
  });

  it('renders both the existing and new amounts formatted via CurrencyContext', () => {
    renderModal({ existingAmount: 40, newAmount: 42 });
    expect(screen.getByText('€40.00')).toBeInTheDocument();
    expect(screen.getByText('€42.00')).toBeInTheDocument();
  });

  it('renders existing and new notes when provided', () => {
    renderModal({ existingNote: 'Uber vacation', newNote: 'Uber vacation' });
    expect(screen.getAllByText('Uber vacation')).toHaveLength(2);
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    const { onCancel } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when the Save anyway button is clicked', () => {
    const { onConfirm } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /save anyway/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
