import React, {useEffect, useContext} from 'react';
import { Helmet } from 'react-helmet';
import { UserContext } from '../contexts/UserContext';
import { LanguageContext } from '../contexts/LanguageContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import MarketPrices from '../sections/MarketPrices';

function MarketPricesPage() {
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    handleSetIsUpdated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seoTitle = language === 'it'
    ? 'Prezzi di Mercato Crypto in Tempo Reale | Pacifinance'
    : 'Real-Time Crypto Market Prices | Pacifinance';
  const seoDescription = language === 'it'
    ? 'Monitora i prezzi in tempo reale di criptovalute, ETF, azioni e materie prime. Grafici interattivi, statistiche dettagliate e storico prezzi.'
    : 'Track real-time prices of cryptocurrencies, ETFs, stocks and commodities. Interactive charts, detailed statistics and price history.';

  return (
    <Div>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`https://pacifinance.com/${language}/market-prices`} />
      </Helmet>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <MarketPrices />
    </Div>
  );
}

export default MarketPricesPage;
const Div = styled.div `
position: relative;
`;