import axios from 'axios'

// Usar proxy local configurado no vite.config.js
const API_URL = '/api/coingecko'

// Cache simples para evitar chamadas redundantes
const cache = {
  marketData: null,
  marketDataTimestamp: 0,
  globalData: null,
  globalDataTimestamp: 0,
  coinHistory: {}
}

// Cache válido por 1 minuto
const CACHE_DURATION = 60000 

export async function getMarketData(vs_currency = 'usd', per_page = 100) {
  const now = Date.now()

  if (cache.marketData && now - cache.marketDataTimestamp < CACHE_DURATION) {
    return cache.marketData
  }

  try {
    const response = await axios.get(
      `${API_URL}/coins/markets`, {
        params: {
          vs_currency,
          per_page,
          order: 'market_cap_desc'
        }
      }
    )

    cache.marketData = response.data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_24h: coin.price_change_24h,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      last_updated: coin.last_updated
    }))

    cache.marketDataTimestamp = now
    return cache.marketData
  } catch (error) {
    console.error('Error fetching market data:', error)
    throw error
  }
}

export async function getCoinHistory(coinId, days = 30) {
  const cacheKey = `${coinId}-${days}`
  const now = Date.now()

  if (cache.coinHistory[cacheKey] && now - cache.coinHistory[cacheKey].timestamp < CACHE_DURATION) {
    return cache.coinHistory[cacheKey].data
  }

  try {
    const response = await axios.get(
      `${API_URL}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days
        }
      }
    )

    cache.coinHistory[cacheKey] = {
      data: response.data.prices,
      timestamp: now
    }

    return response.data.prices
  } catch (error) {
    console.error(`Error fetching history for ${coinId}:`, error)
    throw error
  }
}

export async function getGlobalData() {
  const now = Date.now()

  if (cache.globalData && now - cache.globalDataTimestamp < CACHE_DURATION) {
    return cache.globalData
  }

  try {
    const response = await axios.get(`${API_URL}/global`)

    cache.globalData = {
      total_market_cap: response.data.data.total_market_cap,
      total_volume: response.data.data.total_volume,
      market_cap_change_percentage_24h_usd: response.data.data.market_cap_change_percentage_24h_usd,
      market_cap_percentage: response.data.data.market_cap_percentage,
      active_cryptocurrencies: response.data.data.active_cryptocurrencies,
      last_updated: response.data.data.updated_at
    }

    cache.globalDataTimestamp = now
    return cache.globalData
  } catch (error) {
    console.error('Error fetching global data:', error)
    throw error
  }
}
