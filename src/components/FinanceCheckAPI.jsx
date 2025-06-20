
import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import MarketDataService from '../services/MarketDataService';
import styled from 'styled-components';
import { TrendingUpIcon, TrendingDownIcon } from '@mui/icons-material';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const QuickOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const OverviewCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  text-align: center;
  
  h3 {
    margin-bottom: 15px;
    color: ${props => props.theme.primaryColor};
  }
`;

const DataList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  .symbol {
    font-weight: bold;
    font-size: 0.9rem;
  }
  
  .name {
    font-size: 0.8rem;
    opacity: 0.7;
  }
`;

const ItemPrice = styled.div`
  text-align: right;
  
  .price {
    font-weight: bold;
    font-size: 1rem;
  }
  
  .change {
    font-size: 0.8rem;
    color: ${props => props.positive ? '#4CAF50' : '#F44336'};
    display: flex;
    align-items: center;
    gap: 3px;
    justify-content: flex-end;
  }
`;

function FinanceCheckAPI() {
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState({
    topStocks: [],
    topCrypto: [],
    marketIndices: []
  });

  useEffect(() => {
    loadMarketOverview();
  }, []);

  const loadMarketOverview = async () => {
    setLoading(true);
    try {
      const [stocks, crypto, indices] = await Promise.all([
        MarketDataService.getStockData(),
        MarketDataService.getCryptoData(),
        MarketDataService.getMarketIndices()
      ]);

      setMarketData({
        topStocks: stocks.slice(0, 5),
        topCrypto: crypto.slice(0, 5),
        marketIndices: indices
      });
    } catch (error) {
      console.error('Error loading market overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Caricamento dati di mercato...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Panoramica Mercati Finanziari
      </h1>
      
      <QuickOverview>
        <OverviewCard theme={theme}>
          <h3>Indici Principali</h3>
          <DataList>
            {marketData.marketIndices.map((index, i) => (
              <DataItem key={i} theme={theme}>
                <ItemInfo>
                  <span className="symbol">{index.symbol}</span>
                  <span className="name">{index.name}</span>
                </ItemInfo>
                <ItemPrice positive={index.change >= 0}>
                  <div className="price">{formatCurrency(index.price)}</div>
                  <div className="change">
                    {index.change >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                    {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                  </div>
                </ItemPrice>
              </DataItem>
            ))}
          </DataList>
        </OverviewCard>

        <OverviewCard theme={theme}>
          <h3>Top Azioni</h3>
          <DataList>
            {marketData.topStocks.map((stock, i) => (
              <DataItem key={i} theme={theme}>
                <ItemInfo>
                  <span className="symbol">{stock.symbol}</span>
                  <span className="name">{stock.name}</span>
                </ItemInfo>
                <ItemPrice positive={stock.change >= 0}>
                  <div className="price">{formatCurrency(stock.price)}</div>
                  <div className="change">
                    {stock.change >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </ItemPrice>
              </DataItem>
            ))}
          </DataList>
        </OverviewCard>

        <OverviewCard theme={theme}>
          <h3>Top Crypto</h3>
          <DataList>
            {marketData.topCrypto.map((crypto, i) => (
              <DataItem key={i} theme={theme}>
                <ItemInfo>
                  <span className="symbol">{crypto.symbol}</span>
                  <span className="name">{crypto.name}</span>
                </ItemInfo>
                <ItemPrice positive={crypto.change >= 0}>
                  <div className="price">{formatCurrency(crypto.price)}</div>
                  <div className="change">
                    {crypto.change >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                    {crypto.change >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                  </div>
                </ItemPrice>
              </DataItem>
            ))}
          </DataList>
        </OverviewCard>
      </QuickOverview>
    </Container>
  );
}

export default FinanceCheckAPI;
