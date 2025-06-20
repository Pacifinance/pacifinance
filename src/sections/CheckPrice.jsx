
import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { Section } from '../styles/MyStyled';
//import MarketDataService from '../services/MarketDataService';
import styled from 'styled-components';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  SearchIcon, 
  FilterListIcon,
  ShowChartIcon,
  AccountBalanceIcon,
  MonetizationOnIcon,
  CurrencyBitcoinIcon
} from '@mui/icons-material';

const CheckPriceContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 10px;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.8;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  padding: 20px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  
  input {
    width: 100%;
    padding: 12px 15px 12px 45px;
    border: 2px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    border-radius: 8px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'};
    color: ${props => props.theme.textColor};
    font-size: 16px;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.primaryColor};
    }
  }
  
  .search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.6;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FilterButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: ${props => props.active ? props.theme.primaryColor : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.textColor};
  border: 2px solid ${props => props.active ? props.theme.primaryColor : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.primaryColor};
    color: white;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 25px;
  border-bottom: 2px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  
  @media (max-width: 768px) {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Tab = styled.button`
  padding: 15px 25px;
  border: none;
  background: transparent;
  color: ${props => props.active ? props.theme.primaryColor : props.theme.textColor};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid ${props => props.active ? props.theme.primaryColor : 'transparent'};
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: ${props => props.theme.primaryColor};
  }
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const DataCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Symbol = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  color: ${props => props.theme.primaryColor};
`;

const Name = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 2px;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: right;
`;

const Change = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: flex-end;
  margin-top: 5px;
  color: ${props => props.positive ? '#4CAF50' : '#F44336'};
  font-weight: 500;
`;

const Volume = styled.div`
  font-size: 0.8rem;
  opacity: 0.6;
  margin-top: 10px;
  text-align: center;
`;

const LoadingCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  text-align: center;
  opacity: 0.7;
`;

const ExchangeRateCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.theme.primaryColor}20, ${props => props.theme.secondaryColor}20);
  margin-bottom: 25px;
  
  h3 {
    margin-bottom: 15px;
    text-align: center;
  }
`;

const RateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const RateItem = styled.div`
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'};
  
  .rate-pair {
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .rate-value {
    font-size: 1.2rem;
    color: ${props => props.theme.primaryColor};
    margin-top: 5px;
  }
`;

function CheckPrice() {
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  
  const [activeTab, setActiveTab] = useState('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stocks: [],
    etfs: [],
    crypto: [],
    indices: [],
    exchangeRates: {}
  });

  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: <ShowChartIcon /> },
    { id: 'stocks', label: 'Azioni', icon: <TrendingUpIcon /> },
    { id: 'etfs', label: 'ETF', icon: <AccountBalanceIcon /> },
    { id: 'crypto', label: 'Crypto', icon: <CurrencyBitcoinIcon /> },
    { id: 'indices', label: 'Indici', icon: <MonetizationOnIcon /> }
  ];

  const filterOptions = [
    { id: 'all', label: 'Tutti' },
    { id: 'gainers', label: 'In Rialzo' },
    { id: 'losers', label: 'In Ribasso' },
    { id: 'volume', label: 'Alto Volume' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stocks, etfs, crypto, indices, exchangeRates] = await Promise.all([
        // MarketDataService.getStockData(),
        // MarketDataService.getETFData(),
        // MarketDataService.getCryptoData(),
        // MarketDataService.getMarketIndices(),
        // MarketDataService.getExchangeRates()
      ]);

      setData({
        stocks,
        etfs,
        crypto,
        indices,
        exchangeRates
      });
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    let currentData = [];
    
    switch (activeTab) {
      case 'stocks':
        currentData = data.stocks;
        break;
      case 'etfs':
        currentData = data.etfs;
        break;
      case 'crypto':
        currentData = data.crypto;
        break;
      case 'indices':
        currentData = data.indices;
        break;
      case 'overview':
        currentData = [
          ...data.stocks.slice(0, 2),
          ...data.etfs.slice(0, 2),
          ...data.crypto.slice(0, 2)
        ];
        break;
      default:
        currentData = [];
    }

    // Apply search filter
    if (searchQuery) {
      currentData = currentData.filter(item => 
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'gainers':
        currentData = currentData.filter(item => item.change > 0);
        break;
      case 'losers':
        currentData = currentData.filter(item => item.change < 0);
        break;
      case 'volume':
        currentData = currentData.sort((a, b) => b.volume - a.volume);
        break;
      default:
        break;
    }

    return currentData;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <Section theme={theme}>
      <CheckPriceContainer>
        <Header>
          <h1>Controllo Prezzi di Mercato</h1>
          <p>Monitora in tempo reale azioni, ETF, criptovalute e tassi di cambio</p>
        </Header>

        {/* Exchange Rates */}
        {activeTab === 'overview' && data.exchangeRates && Object.keys(data.exchangeRates).length > 0 && (
          <ExchangeRateCard theme={theme}>
            <h3>Tassi di Cambio</h3>
            <RateGrid>
              <RateItem theme={theme}>
                <div className="rate-pair">EUR/USD</div>
                <div className="rate-value">{data.exchangeRates.EUR?.USD?.toFixed(4) || '1.0800'}</div>
              </RateItem>
              <RateItem theme={theme}>
                <div className="rate-pair">EUR/GBP</div>
                <div className="rate-value">{data.exchangeRates.EUR?.GBP?.toFixed(4) || '0.8600'}</div>
              </RateItem>
              <RateItem theme={theme}>
                <div className="rate-pair">USD/EUR</div>
                <div className="rate-value">{data.exchangeRates.USD?.EUR?.toFixed(4) || '0.9300'}</div>
              </RateItem>
            </RateGrid>
          </ExchangeRateCard>
        )}

        {/* Filter Section */}
        <FilterSection theme={theme}>
          <SearchBox theme={theme}>
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Cerca per simbolo o nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>
          
          <FilterButtons>
            {filterOptions.map(option => (
              <FilterButton
                key={option.id}
                active={filterType === option.id}
                theme={theme}
                onClick={() => setFilterType(option.id)}
              >
                {option.label}
              </FilterButton>
            ))}
          </FilterButtons>
        </FilterSection>

        {/* Tabs */}
        <TabsContainer theme={theme}>
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              theme={theme}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </Tab>
          ))}
        </TabsContainer>

        {/* Data Grid */}
        {loading ? (
          <DataGrid>
            {[...Array(6)].map((_, index) => (
              <LoadingCard key={index} theme={theme}>
                Caricamento dati...
              </LoadingCard>
            ))}
          </DataGrid>
        ) : (
          <DataGrid>
            {getCurrentData().map((item, index) => (
              <DataCard key={`${item.symbol}-${index}`} theme={theme}>
                <CardHeader>
                  <div>
                    <Symbol theme={theme}>{item.symbol}</Symbol>
                    <Name>{item.name}</Name>
                  </div>
                  <div>
                    <Price>{formatCurrency(item.price)}</Price>
                    <Change positive={item.change >= 0}>
                      {item.change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} 
                      ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                    </Change>
                  </div>
                </CardHeader>
                {item.volume && (
                  <Volume>Volume: {formatVolume(item.volume)}</Volume>
                )}
              </DataCard>
            ))}
          </DataGrid>
        )}

        {getCurrentData().length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
            Nessun risultato trovato per la ricerca "{searchQuery}"
          </div>
        )}
      </CheckPriceContainer>
    </Section>
  );
}

export default CheckPrice;
