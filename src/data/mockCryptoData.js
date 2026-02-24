/**
 * Mock cryptocurrency market data for development mode.
 * Shape matches the `/api/prices/crypto` endpoint response (CoinGecko-sourced).
 * Each coin: { name, image, current, sparkline: number[] }
 *
 * Sparklines contain 168 hourly data points (7 days) with realistic variation.
 */

// Helper: generate a 168-point sparkline around a base price with a given volatility %
const sparkline = (base, volatilityPct = 5) => {
    const pts = [];
    let price = base * (1 - volatilityPct / 100); // start slightly below
    for (let i = 0; i < 168; i++) {
        const drift = (Math.random() - 0.48) * base * (volatilityPct / 500);
        price = Math.max(price + drift, base * 0.8);
        pts.push(parseFloat(price.toFixed(price > 1 ? 2 : 6)));
    }
    return pts;
};

const mockCryptoData = {
    bitcoin: {
        name: 'Bitcoin',
        image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        current: 67432.00,
        sparkline: sparkline(67432, 4)
    },
    ethereum: {
        name: 'Ethereum',
        image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        current: 3521.45,
        sparkline: sparkline(3521, 5)
    },
    tether: {
        name: 'Tether',
        image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
        current: 1.00,
        sparkline: sparkline(1.0, 0.1)
    },
    binancecoin: {
        name: 'BNB',
        image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
        current: 598.30,
        sparkline: sparkline(598, 4)
    },
    solana: {
        name: 'Solana',
        image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        current: 172.85,
        sparkline: sparkline(172, 7)
    },
    ripple: {
        name: 'XRP',
        image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
        current: 0.5234,
        sparkline: sparkline(0.52, 6)
    },
    'usd-coin': {
        name: 'USDC',
        image: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
        current: 1.00,
        sparkline: sparkline(1.0, 0.05)
    },
    cardano: {
        name: 'Cardano',
        image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
        current: 0.4512,
        sparkline: sparkline(0.45, 6)
    },
    avalanche: {
        name: 'Avalanche',
        image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
        current: 35.67,
        sparkline: sparkline(35, 7)
    },
    dogecoin: {
        name: 'Dogecoin',
        image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
        current: 0.1245,
        sparkline: sparkline(0.12, 8)
    },
    polkadot: {
        name: 'Polkadot',
        image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
        current: 7.23,
        sparkline: sparkline(7.2, 6)
    },
    chainlink: {
        name: 'Chainlink',
        image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
        current: 14.56,
        sparkline: sparkline(14.5, 5)
    },
    'matic-network': {
        name: 'Polygon',
        image: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
        current: 0.7123,
        sparkline: sparkline(0.71, 7)
    },
    litecoin: {
        name: 'Litecoin',
        image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
        current: 84.32,
        sparkline: sparkline(84, 5)
    },
    uniswap: {
        name: 'Uniswap',
        image: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
        current: 7.89,
        sparkline: sparkline(7.9, 6)
    },
    cosmos: {
        name: 'Cosmos',
        image: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
        current: 8.45,
        sparkline: sparkline(8.4, 5)
    },
    stellar: {
        name: 'Stellar',
        image: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
        current: 0.1123,
        sparkline: sparkline(0.11, 6)
    },
    near: {
        name: 'NEAR Protocol',
        image: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg',
        current: 5.67,
        sparkline: sparkline(5.7, 7)
    },
    aptos: {
        name: 'Aptos',
        image: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
        current: 8.92,
        sparkline: sparkline(8.9, 8)
    },
    arbitrum: {
        name: 'Arbitrum',
        image: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
        current: 1.12,
        sparkline: sparkline(1.1, 7)
    },
    optimism: {
        name: 'Optimism',
        image: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
        current: 2.34,
        sparkline: sparkline(2.3, 7)
    },
    sui: {
        name: 'Sui',
        image: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg',
        current: 1.23,
        sparkline: sparkline(1.2, 9)
    },
    'render-token': {
        name: 'Render',
        image: 'https://assets.coingecko.com/coins/images/11636/small/rndr.png',
        current: 8.45,
        sparkline: sparkline(8.4, 10)
    },
    injective: {
        name: 'Injective',
        image: 'https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png',
        current: 24.56,
        sparkline: sparkline(24.5, 8)
    },
    pepe: {
        name: 'Pepe',
        image: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg',
        current: 0.00000789,
        sparkline: sparkline(0.0000078, 12)
    }
};

export default mockCryptoData;
