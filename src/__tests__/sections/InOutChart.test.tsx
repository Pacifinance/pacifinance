import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import InOutChart from '../../sections/InOutChart';
import {LanguageContext} from '../../contexts/LanguageContext';
import {CurrencyContext} from '../../contexts/CurrencyContext';
import {UserContext} from '../../contexts/UserContext';
import en from '../../i18n/locales/en.json';

vi.mock('../../utils/userDataSelectors', () => ({
  getIncomesArray: () => [200, 100],
  getOutflowsArray: () => [150, 120],
  getMonthlyTotalsAllTime: () => [],
  getEntriesForMonthKey: () => [],
  getCategoryBreakdownForEntries: () => ({}),
  indexToMonthKey: () => '2026-08',
}));

const theme = {mode: 'dark', textColor: '#fff', buttonBackgroundColor: '#079164'};

const renderExplorer = () => render(
  <LanguageContext.Provider value={{translations: en, language: 'en'}}>
    <CurrencyContext.Provider value={{formatAmount: (value: number) => `$${value}`, fromEUR: (value: number) => value}}>
      <UserContext.Provider value={{fetchAllTimeMonthlyTotals: vi.fn(), fetchMonthDetail: vi.fn()}}>
        <InOutChart theme={theme} userData={{limits: {}}} isHidden={false}/>
      </UserContext.Provider>
    </CurrencyContext.Provider>
  </LanguageContext.Provider>,
);

describe('InOutChart', () => {
  it('renders safely with no user data', () => {
    renderExplorer();
    expect(screen.getByText(en.graphs.statsOutflows.explorer.title)).toBeInTheDocument();
  });

  it('offers all explorer views', () => {
    renderExplorer();
    expect(screen.getByRole('button', {name: en.graphs.statsOutflows.explorer.viewTrend})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: en.graphs.statsOutflows.explorer.viewNet})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: en.graphs.statsOutflows.explorer.viewCategories})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: en.graphs.statsOutflows.explorer.viewTable})).toBeInTheDocument();
  });

  it('switches to the accessible data table', () => {
    renderExplorer();
    fireEvent.click(screen.getByText(en.graphs.statsOutflows.explorer.viewTable));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
