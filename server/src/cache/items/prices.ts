import { ExtDate } from "../../libs/datelib"
import { logger } from "../../libs/logger"
import { checkAndConsumeRateLimit } from "../../libs/rateLimiter"

import cache from "../cache"
import redis from "../redisClient"

/**
 * Contains all crypto metadata and prices fetched from CoinGecko
 */
type CoinsFetchedSimpleData = {
    id: string,
    name: string,
    image: string,
    current_price: number,
    total_volume: number,
    market_cap: number,
    price_change_24h: number,
    circulating_supply: number,
    market_cap_rank: number,
    ath: number,
    ath_date: string,
    atl: number,
    atl_date: string,
    sparkline_in_7d: {
        price: number[]
    },
    last_updated: string
}

/**
 * Contains the historic prices for a single coin fetched from CoinGecko
 */
type CoinFetchedMarketData = {
    prices: number[][],
    market_caps: number[][],
    total_volumes: number[][]
}

/**
 * Contains all crypto cached metadata and prices
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
        sparkline7D: number[],
        sparklineHistoric: number[],
        lastUpdated: string
    }
}

// Coins parameters

const cgApiUrl = "https://api.coingecko.com/api/v3"
const options: any = {
    method: 'GET',
    headers: {accept: 'application/json', 'x-cg-demo-api-key': process.env.CG_KEY}
}

/**
 * How many coins to track, ranked by market cap. Current prices for all N
 * coins cost a SINGLE /coins/markets call regardless of N — the only cost of
 * a bigger N is the historic-sparkline warm-up: the backfill fetches one
 * coin's 1-year history per hourly run (see buildHistoricSparkline below) to
 * stay inside the CoinGecko demo-tier rate limits, so a fresh cache takes
 * TOP_N_COINS hours to fill every historic chart. Coins without historic
 * data yet still show price/24h/7d normally.
 */
const TOP_N_COINS = 50
const SEARCH_RESULTS_LIMIT = 8
const SEARCH_CACHE_TTL_SEC = 15 * 60

type CoinGeckoSearchResponse = {
    coins?: Array<{
        id: string,
        symbol: string,
        name: string,
        market_cap_rank?: number | null
    }>
}

// Sparkline parameters

const historicSparklineDays = 365 * 5

async function buildHistoricSparkline(oldCoinData: CoinCachedData[string] | undefined,
    newCoinData: CoinsFetchedSimpleData, fetchHistoric: boolean) {

    let historicData = oldCoinData?.sparklineHistoric ?? []

    if (fetchHistoric) {
        const historicDataUrl = cgApiUrl + `/coins/${newCoinData.id}/market_chart?vs_currency=eur&days=365`
        const res = await fetch(historicDataUrl, options)
        if (res.status !== 200) {
            logger.info(`Error while fetching historic data for ${newCoinData.id}`)
            return []
        }
        const marketData = await res.json() as CoinFetchedMarketData
        historicData = marketData.prices
            .slice(0, -1) // ignore the last value (today's price)
            .map((value) => { return value[1] }) // keep the price (value[1]), ignore the timestamp (value[0])
        logger.info(`Fetched historic data for ${newCoinData.id}`)
    }

    // When the day changes, push the last price of that day to the historic data queue
    const lastUpdateDate = new ExtDate(newCoinData.last_updated)
    if (lastUpdateDate.getUTCHours() === 0 && newCoinData.sparkline_in_7d.price.length > 1) // at midnight
        historicData.push(...newCoinData.sparkline_in_7d.price.slice(-2, -1)) // get the second-last value (price of yesterday at 23)

    // Remove the oldest values if the queue is too big
    if (historicData.length > historicSparklineDays)
        historicData.splice(0, historicData.length - historicSparklineDays)

    return historicData
}

/**
 * Retrieves the crypto prices from CoinGecko
 * @returns Object to store in the database and cache
 */
async function fetchCryptoPrices(): Promise<CoinCachedData | null> {
    /**
     * To retrieve the last year worth of data, an additional API request per
     * coin is necessary. This can cause the system to incur in the demo API
     * usage limits. So, the idea is to fetch the historic data of a single coin
     * for each call of this function. This means that if the historic data of a
     * coin is fetched, the historic data of the next coin will be fetched after
     * one hour (1 call per hour is the call frequency of this function).
     * Of course, if the historic data of a coin is already present in the cache,
     * no historic data is fetched for that coin.
     */
    let historicDataFetched = false

    // Retrieve from the cache the expired prices
    const expiredCachedPrices = await cache.get("crypto") as CoinCachedData | null

    // Fetch the top coins by market cap
    const currentDataUrl = cgApiUrl +
        `/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=${TOP_N_COINS}&page=1&sparkline=true`
    const res = await fetch(currentDataUrl, options)
    if (res.status !== 200) {
        logger.info("Error while fetching crypto current data")
        return expiredCachedPrices
    }
    const coinsData = await res.json() as CoinsFetchedSimpleData[]

    // Build the object with the updated data of all coins
    const data: CoinCachedData = {}
    for (const coin of coinsData) {
        const oldCoinData = expiredCachedPrices ? expiredCachedPrices[coin.id] : undefined

        // Check whether the historic data must be fetched for this coin
        let fetchHistoricReq = false
        if (!historicDataFetched &&
            (!oldCoinData || !oldCoinData.sparklineHistoric || oldCoinData.sparklineHistoric.length < 364)
        ) {
            fetchHistoricReq = true
            historicDataFetched = true
        }

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
            sparkline7D: coin.sparkline_in_7d.price,
            sparklineHistoric: await buildHistoricSparkline(oldCoinData, coin, fetchHistoricReq),
            lastUpdated: coin.last_updated
        }
    }

    logger.info("Crypto prices fetched")

    return data
}

/**
 * Searches CoinGecko beyond the overview cache and returns the same shape used
 * by the market-prices page. Results are short-lived and shared across users.
 */
async function searchCryptoPrices(query: string): Promise<CoinCachedData> {
    const normalizedQuery = query.trim().toLowerCase()
    if (normalizedQuery.length < 2) return {}

    const searchCacheKey = `crypto:market-search:${encodeURIComponent(normalizedQuery)}`
    try {
        const cachedResult = await redis.get<CoinCachedData>(searchCacheKey)
        if (cachedResult) return cachedResult
    } catch (error) {
        logger.info(`Unable to read crypto market search cache: ${String(error)}`)
    }

    const allowed = await checkAndConsumeRateLimit("coingecko-market-search", 12)
    if (!allowed) return {}

    const searchResponse = await fetch(
        `${cgApiUrl}/search?query=${encodeURIComponent(normalizedQuery)}`,
        options,
    )
    if (searchResponse.status !== 200) return {}

    const searchData = await searchResponse.json() as CoinGeckoSearchResponse
    const ids = (searchData.coins ?? [])
        .slice(0, SEARCH_RESULTS_LIMIT)
        .map((coin) => coin.id)
    if (ids.length === 0) return {}

    const marketResponse = await fetch(
        `${cgApiUrl}/coins/markets?vs_currency=eur&ids=${encodeURIComponent(ids.join(","))}&sparkline=true`,
        options,
    )
    if (marketResponse.status !== 200) return {}

    const coins = await marketResponse.json() as CoinsFetchedSimpleData[]
    const result: CoinCachedData = {}
    for (const coin of coins) {
        result[coin.id] = {
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
            sparkline7D: coin.sparkline_in_7d?.price ?? [],
            sparklineHistoric: [],
            lastUpdated: coin.last_updated,
        }
    }

    try {
        await redis.set(searchCacheKey, result, { ex: SEARCH_CACHE_TTL_SEC })
    } catch (error) {
        logger.info(`Unable to write crypto market search cache: ${String(error)}`)
    }
    return result
}

export default { fetchCryptoPrices, searchCryptoPrices }
