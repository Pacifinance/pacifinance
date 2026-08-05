/**
 * Tests for InvestmentHoldingsPanel's per-holding detail line: quantity ×
 * average price, and a gain/loss figure when a real current value is known
 * (current_value stays null for CSV-imported holdings, so this must degrade
 * gracefully rather than showing a misleading 0% gain).
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import InvestmentHoldingsPanel from '../../sections/InvestmentHoldingsPanel';

vi.mock('../../hooks/useDemoServices', () => ({
  useDemoServices: () => ({
    investmentService: {
      deleteHolding: vi.fn(),
      saveHolding: vi.fn(),
      saveHoldingHistory: vi.fn(),
    },
  }),
}));

const translations = {
  general: { selectAnOption: '—', cancel: 'Cancel' },
  assets: { stocks: 'Stocks', etf: 'ETF', crypto: 'Crypto', bitcoin: 'Bitcoin', bonds: 'Bonds', funds: 'Funds', commodities: 'Commodities' },
  investments: {
    holdings: {
      title: 'Detailed holdings',
      emptyState: 'No holdings yet.',
      addTitle: 'Add holding',
      editTitle: 'Edit',
      quantity: 'Quantity',
      averagePrice: 'Average price',
      currentValue: 'Current value',
      investedAmount: 'Invested amount',
      notesPlaceholder: 'Notes',
      addButton: 'Add',
      saveButton: 'Save',
      cancelEdit: 'Cancel',
      deleteButton: 'Delete',
      noValueForMonth: 'No value for this month',
    },
    importWizard: {},
  },
};

const theme = { mode: 'light', textColor: '#000' };
const currencyCtx = {
  formatAmount: (v) => `€${Number(v).toFixed(2)}`,
  fromEUR: (v) => v,
  toEUR: (v) => v,
};

const baseHolding = {
  id: 1,
  assetKey: 'stocks',
  positionType: 'single',
  quantity: 10,
  averagePrice: 100,
  currentValue: null,
  investedAmount: 1000,
  currency: 'EUR',
  notes: '',
  updatedAt: '2026-01-01',
  instrument: { id: 1, kind: 'stock', symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ', currency: 'USD', isin: 'US0378331005', verified: true, provider: 'openfigi', metadata: {} },
};

function renderPanel(holdings) {
  return render(
    <ThemeContext.Provider value={{ theme }}>
      <LanguageContext.Provider value={{ language: 'en', translations }}>
        <CurrencyContext.Provider value={currencyCtx}>
          <InvestmentHoldingsPanel assetKey="stocks" holdings={holdings} onClose={vi.fn()} onChanged={vi.fn()} />
        </CurrencyContext.Provider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>,
  );
}

describe('InvestmentHoldingsPanel quantity/gain-loss detail line', () => {
  it('shows quantity × average price', () => {
    renderPanel([baseHolding]);
    expect(screen.getByText(/10.*€100\.00/)).toBeInTheDocument();
  });

  it('does not show a gain/loss figure when current_value is unknown (CSV-imported, cost-basis only)', () => {
    renderPanel([baseHolding]);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('shows a positive gain/loss figure when a current value is set above cost', () => {
    renderPanel([{ ...baseHolding, currentValue: 1200 }]);
    expect(screen.getByText(/\+€200\.00 \(\+20\.0%\)/)).toBeInTheDocument();
  });

  it('shows a negative gain/loss figure when a current value is set below cost', () => {
    renderPanel([{ ...baseHolding, currentValue: 800 }]);
    expect(screen.getByText(/€-200\.00 \(-20\.0%\)/)).toBeInTheDocument();
  });
});
