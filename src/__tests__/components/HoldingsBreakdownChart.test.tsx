import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import HoldingsBreakdownChart from '../../components/HoldingsBreakdownChart';
import {LanguageContext} from '../../contexts/LanguageContext';
import {CurrencyContext} from '../../contexts/CurrencyContext';
import en from '../../i18n/locales/en.json';
import type {InvestmentHoldingDto} from '../../types/api';

const holdings: InvestmentHoldingDto[] = [{
  id: 1,
  assetKey: 'stocks',
  positionType: 'single',
  quantity: 2,
  averagePrice: 50,
  currentValue: 120,
  investedAmount: 100,
  currency: 'EUR',
  notes: '',
  updatedAt: '2026-08-01T00:00:00Z',
  instrument: {
    id: 10,
    kind: 'stock',
    symbol: 'TEST',
    name: 'Test Company',
    provider: 'internal',
    verified: true,
    active: true,
    metadata: {},
  },
}];

const theme = {mode: 'dark', textColor: '#fff', buttonBackgroundColor: '#079164'};

const renderChart = (items: InvestmentHoldingDto[]) => render(
  <LanguageContext.Provider value={{translations: en, language: 'en'}}>
    <CurrencyContext.Provider value={{formatAmount: (value: number) => `€${value}`}}>
      <HoldingsBreakdownChart theme={theme} holdings={items} assetKey={null} isHidden={false}/>
    </CurrencyContext.Provider>
  </LanguageContext.Provider>,
);

describe('HoldingsBreakdownChart', () => {
  it('shows the empty state without holdings', () => {
    renderChart([]);
    expect(screen.getByText(en.graphs.statsHoldings.noHoldingsDescription)).toBeInTheDocument();
  });

  it('renders the ranked composition and interactive asset legend', () => {
    renderChart(holdings);
    expect(screen.getByText(en.graphs.statsHoldings.breakdownTitle)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'TEST'})).toBeInTheDocument();
  });
});
