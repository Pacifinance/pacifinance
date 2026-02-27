import { ExtDate } from "../../libs/datelib"

import cache from "../cache"

/**
 * Contains all crypto metadata and prices
 */
type CoinCachedData = {
    [coinId: string]: {
        name: string,
        image: string,
        current: number,
        marketCap: number,
        totalVolume: number,
        change24h: number,
        circulatingSupply: number,
        marketCapRank: number,
        ath: number,
        athDate: string,
        atl: number,
        atlDate: string,
        sparkline: number[],
        lastUpdated: string
    }
}

// Coins

/**
 * URL-encoded list of coin IDs
 */
const coins = [
    "bitcoin", "solana", "ethereum", "polkadot", "crypto-com-chain", "binancecoin",
    "usd-coin", "tether", "cardano", "okb", "uniswap", "ripple", "paypal-usd", 
    "polygon-ecosystem-token", "dogecoin", "shiba-inu", "tron", "stellar",
    "avalanche-2", "internet-computer", "pancakeswap-token", "bonk", "pepe",
    "render-token", "algorand", "cosmos", "sui", "dai", "hedera-hashgraph",
    "chainlink", "monero", "hyperliquid"]
    .join("%2C")

// Sparkline parameters

const sparklineDays = 90
const nPointsPerDay = 24
const nPointsPerHour = nPointsPerDay / 24
const nPoints = sparklineDays * nPointsPerDay

function buildSparkline(cachedData: CoinCachedData[string] | undefined, newSparkline: number[], newLastUpdate: string) {
    if (!cachedData)
        return newSparkline

    if (newSparkline.length === 0)
        return cachedData.sparkline

    // Find out how many new points there are in the new sparkline
    const lastUpdateDate = new ExtDate(cachedData.lastUpdated)
    const newLastUpdateDate = new ExtDate(newLastUpdate)
    const nPointsBehind = Math.floor(((+newLastUpdateDate) - (+lastUpdateDate)) / (1000 * 60 * 60 / nPointsPerHour))

    // Add that many new points from the new sparkline at the end of the cached sparkline
    const newPoints = newSparkline.slice(newSparkline.length - nPointsBehind)
    cachedData.sparkline.push(...newPoints)

    // If there are more points than expected, delete them from the tail of the queue
    if (cachedData.sparkline.length > nPoints)
        cachedData.sparkline.splice(0, cachedData.sparkline.length - nPoints)

    return cachedData.sparkline
}

/**
 * Retrieves the crypto prices from CoinGecko
 * @returns Object to store in the database and cache
 */
async function fetchCryptoPrices(): Promise<CoinCachedData | null> {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${coins}&sparkline=true`
    const options: any = {
        method: 'GET',
        headers: {accept: 'application/json', 'x-cg-demo-api-key': process.env.CG_KEY}
    }

    const expiredCachedPrices = await cache.get("crypto") as CoinCachedData | null

    const res = await fetch(url, options)
    if (res.status !== 200) {
        console.log("Error while fetching crypto prices")
        return null
    }

    let res_data = await res.json()
    let data: CoinCachedData = {}
    for (let coin of res_data) {
        const oldCoinData = expiredCachedPrices ? expiredCachedPrices[coin.id] : undefined

        data[coin.id] = {
            name: coin.name,
            image: coin.image,
            current: coin.current_price,
            totalVolume: coin.total_volume,
            marketCap: coin.market_cap,
            change24h: coin.price_change_24h,
            circulatingSupply: coin.circulating_supply,
            marketCapRank: coin.market_cap_rank,
            ath: coin.ath,
            athDate: coin.ath_date,
            atl: coin.atl,
            atlDate: coin.atl_date,
            sparkline: buildSparkline(oldCoinData, coin.sparkline_in_7d.price, coin.last_updated),
            lastUpdated: coin.last_updated
        }
    }

    console.log("Crypto prices fetched")

    return data
}

export default { fetchCryptoPrices }