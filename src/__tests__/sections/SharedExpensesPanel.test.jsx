/**
 * Tests for SharedExpensesPanel — focuses on list rendering, the settle
 * flow, and delete/close callbacks rather than styling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import SharedExpensesPanel from '../../sections/SharedExpensesPanel';

const settleReceivable = vi.fn();
const deleteReceivable = vi.fn();

vi.mock('../../hooks/useDemoServices', () => ({
  useDemoServices: () => ({
    sharedExpenseService: {
      settleReceivable: (...args) => settleReceivable(...args),
      deleteReceivable: (...args) => deleteReceivable(...args),
    },
  }),
}));

const translations = {
  general: { cancel: 'Cancel' },
  insert: {
    sharedExpensesPanel: {
      title: 'Shared expenses',
      subtitle: 'Money owed by others',
      emptyState: 'No shared expenses yet.',
      untitled: 'Group expense',
      statusPending: 'Pending',
      statusPartial: 'Partially recovered',
      statusSettled: 'Recovered',
      markReceived: 'Mark amount received',
      deleteButton: 'Delete',
      amountReceivedLabel: 'Amount received',
      confirmSettle: 'Confirm',
    },
  },
};

const theme = { mode: 'light', textColor: '#000' };
const currencyCtx = { formatAmount: (v) => `€${Number(v).toFixed(2)}` };

const baseItem = {
  id: 1, date: '2026-03-10', notes: 'Uber vacation',
  totalAmount: 40, ownShare: 10, receivableAmount: 30, settledAmount: 0, status: 'pending',
};

function renderPanel(items = [baseItem]) {
  const onClose = vi.fn();
  const onChanged = vi.fn();
  const utils = render(
    <LanguageContext.Provider value={{ language: 'en', translations }}>
      <CurrencyContext.Provider value={currencyCtx}>
        <SharedExpensesPanel theme={theme} items={items} onClose={onClose} onChanged={onChanged} />
      </CurrencyContext.Provider>
    </LanguageContext.Provider>,
  );
  return { ...utils, onClose, onChanged };
}

describe('SharedExpensesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settleReceivable.mockResolvedValue({});
    deleteReceivable.mockResolvedValue({});
  });

  it('shows the empty state when there are no receivables', () => {
    renderPanel([]);
    expect(screen.getByText('No shared expenses yet.')).toBeInTheDocument();
  });

  it('lists a receivable with its outstanding amount and status', () => {
    renderPanel();
    expect(screen.getByText('Uber vacation')).toBeInTheDocument();
    expect(screen.getByText('€30.00')).toBeInTheDocument();
    // Match the row's status text specifically — the filter panel's status
    // dropdown also has a "Pending" option, so a plain getByText(/Pending/)
    // is ambiguous now that filtering exists.
    expect(screen.getByText((content, element) => element.tagName !== 'OPTION' && /Pending/.test(content))).toBeInTheDocument();
  });

  it('falls back to the untitled label when notes are empty', () => {
    renderPanel([{ ...baseItem, notes: '' }]);
    expect(screen.getByText('Group expense')).toBeInTheDocument();
  });

  it('opens the settle form pre-filled with the outstanding amount and confirms it', async () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /mark amount received/i }));

    const input = screen.getByLabelText(/amount received/i);
    expect(input.value).toBe('30.00');

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => expect(settleReceivable).toHaveBeenCalledWith({ id: 1, amount: 30 }));
  });

  it('deletes a receivable', async () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(deleteReceivable).toHaveBeenCalledWith({ id: 1 }));
  });

  it('does not show the "mark received" action once a receivable is fully settled', () => {
    renderPanel([{ ...baseItem, settledAmount: 30, status: 'settled' }]);
    expect(screen.queryByRole('button', { name: /mark amount received/i })).not.toBeInTheDocument();
  });

  it('groups receivables from different months under separate headers', () => {
    renderPanel([
      baseItem,
      { ...baseItem, id: 2, date: '2026-04-05', notes: 'Dinner' },
    ]);
    expect(screen.getByText(/March 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/April 2026/i)).toBeInTheDocument();
  });

  it('filters the list by status', () => {
    renderPanel([
      baseItem,
      { ...baseItem, id: 2, notes: 'Dinner', status: 'settled', settledAmount: 30 },
    ]);
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    fireEvent.change(screen.getByDisplayValue('All'), { target: { value: 'settled' } });
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.queryByText('Uber vacation')).not.toBeInTheDocument();
  });
});
