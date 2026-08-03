import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import BalancesChart from '../../sections/BalancesChart';
import {LanguageContext} from '../../contexts/LanguageContext';
import {CurrencyContext} from '../../contexts/CurrencyContext';
import {UserContext} from '../../contexts/UserContext';
import {MediaQueryContext} from '../../contexts/MediaQueryContext';
import en from '../../i18n/locales/en.json';

vi.mock('../../utils/userDataSelectors.js', () => ({
  getBalanceChartData: () => [
    {month: '2026-01', bankReal: 100, cashReal: 20, digitalServicesReal: 0, emergencyFundReal: 0, stocksReal: 50, etfReal: 30, bondsReal: 0, fundsReal: 0, commoditiesReal: 0, bitcoinReal: 0, cryptoReal: 0},
    {month: '2026-02', bankReal: 110, cashReal: 20, digitalServicesReal: 0, emergencyFundReal: 0, stocksReal: 60, etfReal: 40, bondsReal: 0, fundsReal: 0, commoditiesReal: 0, bitcoinReal: 0, cryptoReal: 0},
  ],
}));

const theme = {mode: 'dark', textColor: '#fff', buttonBackgroundColor: '#079164'};

const renderChart = () => render(
  <LanguageContext.Provider value={{translations: en, language: 'en'}}>
    <CurrencyContext.Provider value={{formatAmount: (value: number) => `€${value}`, fromEUR: (value: number) => value}}>
      <UserContext.Provider value={{fetchAllTimeBalances: vi.fn()}}>
        <MediaQueryContext.Provider value={{isMobileScreen: false}}>
          <BalancesChart theme={theme} userData={{balances: []}} isHidden={false}/>
        </MediaQueryContext.Provider>
      </UserContext.Provider>
    </CurrencyContext.Provider>
  </LanguageContext.Provider>,
);

describe('BalancesChart', () => {
  it('renders safely with no user data', () => {
    render(
      <LanguageContext.Provider value={{translations: en, language: 'en'}}>
        <CurrencyContext.Provider value={{formatAmount: String, fromEUR: Number}}>
          <UserContext.Provider value={{}}><MediaQueryContext.Provider value={{isMobileScreen: false}}><BalancesChart theme={theme} userData={null} isHidden={false}/></MediaQueryContext.Provider></UserContext.Provider>
        </CurrencyContext.Provider>
      </LanguageContext.Provider>,
    );
    expect(screen.getByText(en.graphs.balanceExplorer.title)).toBeInTheDocument();
  });

  it('offers every analysis mode in one explorer', () => {
    renderChart();
    expect(screen.getByText(en.graphs.balanceExplorer.viewTrend)).toBeInTheDocument();
    expect(screen.getByText(en.graphs.balanceExplorer.viewComposition)).toBeInTheDocument();
    expect(screen.getByText(en.graphs.balanceExplorer.viewChanges)).toBeInTheDocument();
    expect(screen.getByText(en.graphs.balanceExplorer.viewTable)).toBeInTheDocument();
  });

  it('switches to the numerical table', () => {
    renderChart();
    fireEvent.click(screen.getByText(en.graphs.balanceExplorer.viewTable));
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByText('Feb 26').length).toBeGreaterThan(0);
  });
});
