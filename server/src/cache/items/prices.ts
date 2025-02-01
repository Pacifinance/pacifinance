/**
 * Retrieves the crypto prices from CoinGecko
 * @returns Object to store in the database and cache
 */
async function fetchCryptoPrices() {
    const currency = "eur";
    const coins = "bitcoin,solana,ethereum,polkadot,crypto-com-chain,binancecoin,usd-coin,tether,matic-network,cardano,okb,uniswap".replace(",", "%2C");
    const sparkline = "true";
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${coins}&sparkline=${sparkline}`;
    const options: any = {
        method: 'GET',
        headers: {accept: 'application/json', 'x-cg-demo-api-key': process.env.CG_KEY}
    };

    const res = await fetch(url, options);
    if (res.status !== 200)
        return null;

    let res_data = await res.json();
    let data: any = {};
    for (let coin of res_data)
        data[coin.id] = {name: coin.name, image: coin.image, current: coin.current_price, sparkline: coin.sparkline_in_7d.price}

    return data;
}

export default { fetchCryptoPrices };