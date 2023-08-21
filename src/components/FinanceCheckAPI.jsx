import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
// per le chiamate API penso di utilizzare alpha vantage (piano gratuito: 5 API requests per minute; 100 API requests per day )
// se lo faccio da RapidAPI ho 500 API requests per day (nel piano gratuito) ma devo mettere i dati della carta di credito nel caso superassi)
//Piano Premium: (per 49$ al mese) 75 API requests per minute (15 minutes delay) o per 25$ al mese 30 API requests per minute info in delay di 15 minuti. 
//volendo c'è anche la libreria yahoo stock api da installare con npm che fa scraping dalle pagine di yahoo finance: https://www.npmjs.com/package/yahoo-stock-api (Metodo Rischioso ma gratuito)
//Yahoo finance sembra avere prezzi migliori(presente anche su rapidAPI)
function MarketCheckPage() {
  const [stocks, setStocks] = useState([]);
  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  
  useEffect(() => {
    // Effettuo le chiamate API per ottenere dati su azioni e criptovalute
    fetchStockData();
    fetchCryptoData();
  }, []);

  const fetchStockData = async () => {
    try {
      const response = await axios.get('API_URL_FOR_STOCKS');
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  const fetchCryptoData = async () => {
    try {
      const response = await axios.get('API_URL_FOR_CRYPTOS');
      setCryptocurrencies(response.data);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    }
  };

  return (
    <div>
      <h1>Controllo dei Mercati</h1>

      <section>
        <h2>Azioni</h2>
        <ul>
          {stocks.map(stock => (
            <li key={stock.symbol}>
              {stock.name} ({stock.symbol}): ${stock.price} ({stock.change}%)
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Criptovalute</h2>
        <ul>
          {cryptocurrencies.map(crypto => (
            <li key={crypto.symbol}>
              {crypto.name} ({crypto.symbol}): ${crypto.price} ({crypto.change}%)
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default MarketCheckPage;
