<template>
  <div class="dashboard">
    <header>
      <h1>📊 Crypto Dashboard</h1>
      <div class="last-updated">
        Última atualização: {{ formattedUpdateTime }}
      </div>
    </header>

    <div class="grid">
      <CoinList 
        :coins="activeCoins" 
        :favorites="favorites"
        @select-coin="selectCoin"
        @toggle-favorite="toggleFavorite"
      />

      <div class="main-content">
        <div class="chart-container">
          <CryptoChart 
            v-if="selectedCoinHistory.length > 0" 
            :data="chartData" 
            :options="chartOptions" 
          />
          <div v-else class="no-data">
            Selecione uma criptomoeda para ver o gráfico
          </div>
        </div>

        <MarketOverview :stats="marketStats" />
        <PriceAlerts 
          :coins="activeCoins"
          @add-alert="addPriceAlert"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { getMarketData, getCoinHistory, getGlobalData } from './services/coingecko'
import { setupWebSocket } from './services/binance'
import { loadFavorites, saveFavorites } from './services/storage'
import CoinList from './components/CoinList.vue'
import CryptoChart from './components/CryptoChart.vue'
import MarketOverview from './components/MarketOverview.vue'
import PriceAlerts from './components/PriceAlerts.vue'

export default {
  components: { CoinList, CryptoChart, MarketOverview, PriceAlerts },

  setup() {
    const activeCoins = ref([])
    const selectedCoin = ref(null)
    const selectedCoinHistory = ref([])
    const marketStats = ref({})
    const favorites = ref(loadFavorites())
    const priceAlerts = ref([])
    const lastUpdate = ref(Date.now())

    const chartData = computed(() => ({
      labels: selectedCoinHistory.value.map(([timestamp]) => 
        new Date(timestamp).toLocaleDateString()
      ),
      datasets: [{
        label: `${selectedCoin.value?.name || 'Coin'} Price (USD)`,
        data: selectedCoinHistory.value.map(([, price]) => price),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    }))

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `$${context.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => `$${value}`
          }
        }
      }
    }

    const formattedUpdateTime = computed(() =>
      new Date(lastUpdate.value).toLocaleTimeString()
    )

    const loadData = async () => {
      try {
        activeCoins.value = await getMarketData()
        marketStats.value = await getGlobalData()
        lastUpdate.value = Date.now()

        if (activeCoins.value.length > 0 && !selectedCoin.value) {
          selectCoin(favorites.value.length > 0 
            ? activeCoins.value.find(c => favorites.value.includes(c.id)) || activeCoins.value[0]
            : activeCoins.value[0]
          )
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    const selectCoin = async (coin) => {
      selectedCoin.value = coin
      try {
        selectedCoinHistory.value = await getCoinHistory(coin.id, 30)
      } catch (error) {
        console.error('Error loading coin history:', error)
        selectedCoinHistory.value = []
      }
    }

    const toggleFavorite = (coinId) => {
      if (favorites.value.includes(coinId)) {
        favorites.value = favorites.value.filter(id => id !== coinId)
      } else {
        favorites.value = [...favorites.value, coinId]
      }
      saveFavorites(favorites.value)
    }

    const addPriceAlert = (alert) => {
      priceAlerts.value = [...priceAlerts.value, alert]
    }

    const checkPriceAlerts = () => {
      priceAlerts.value.forEach(alert => {
        const coin = activeCoins.value.find(c => c.id === alert.coinId)
        if (coin && !alert.triggered) {
          if ((alert.direction === 'above' && coin.current_price > alert.price) ||
              (alert.direction === 'below' && coin.current_price < alert.price)) {
            alert.triggered = true
            alert.notificationTime = Date.now()
            // Aqui poderia ser usado Notification API ou toast
            console.log(`ALERT: ${coin.name} ${alert.direction} $${alert.price}`)
          }
        }
      })
    }

    let updateInterval
    let ws

    onMounted(() => {
      loadData()
      updateInterval = setInterval(loadData, 60000)

      const symbols = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'adausdt']
      ws = setupWebSocket(symbols, (tickerData) => {
        activeCoins.value = activeCoins.value.map(coin => {
          const ticker = tickerData.find(t =>
            t.s === `${coin.symbol.toLowerCase()}usdt`
          )
          if (ticker) {
            return {
              ...coin,
              current_price: parseFloat(ticker.c),
              price_change_percentage_24h: parseFloat(ticker.P),
              price_change_24h: parseFloat(ticker.p)
            }
          }
          return coin
        })
        checkPriceAlerts()
        lastUpdate.value = Date.now()
      })
    })

    onUnmounted(() => {
      clearInterval(updateInterval)
      if (ws && ws.close) ws.close()
    })

    watch(favorites, (newVal) => {
      saveFavorites(newVal)
    }, { deep: true })

    return {
      activeCoins,
      selectedCoin,
      selectedCoinHistory,
      marketStats,
      favorites,
      priceAlerts,
      lastUpdate,
      chartData,
      chartOptions,
      formattedUpdateTime,
      selectCoin,
      toggleFavorite,
      addPriceAlert
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chart-container {
  height: 400px;
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
}

.last-updated {
  color: #64748b;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
