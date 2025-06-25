<template>
  <div class="coin-list">
    <div class="search-box">
      <input 
        v-model="searchQuery" 
        placeholder="Buscar criptomoedas..."
        type="text"
      >
    </div>
    
    <div class="list-header">
      <span>Moeda</span>
      <span>Preço</span>
    </div>
    
    <div class="coins-container">
      <div 
        v-for="coin in filteredCoins" 
        :key="coin.id" 
        class="coin-item"
        :class="{ 
          'selected': coin.id === selectedCoin?.id,
          'favorite': favorites.includes(coin.id)
        }"
        @click="selectCoin(coin)"
      >
        <div class="coin-info">
          <img :src="coin.image" :alt="coin.name" width="24">
          <span>{{ coin.name }}</span>
          <span class="symbol">{{ coin.symbol.toUpperCase() }}</span>
          <button 
            class="favorite-btn"
            @click.stop="toggleFavorite(coin.id)"
          >
            {{ favorites.includes(coin.id) ? '★' : '☆' }}
          </button>
        </div>
        
        <div class="coin-price">
          <span>${{ coin.current_price.toLocaleString() }}</span>
          <span 
            :class="{
              'positive': coin.price_change_percentage_24h > 0,
              'negative': coin.price_change_percentage_24h < 0
            }"
          >
            {{ coin.price_change_percentage_24h?.toFixed(2) || '0.00' }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  props: {
    coins: {
      type: Array,
      required: true
    },
    selectedCoin: {
      type: Object,
      default: null
    },
    favorites: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['select-coin', 'toggle-favorite'],
  
  setup(props, { emit }) {
    const searchQuery = ref('')
    
    const filteredCoins = computed(() => {
      return props.coins.filter(coin => 
        coin.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })
    
    const selectCoin = (coin) => {
      emit('select-coin', coin)
    }
    
    const toggleFavorite = (coinId) => {
      emit('toggle-favorite', coinId)
    }
    
    return {
      searchQuery,
      filteredCoins,
      selectCoin,
      toggleFavorite
    }
  }
}
</script>

<style scoped>
.coin-list {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.search-box {
  margin-bottom: 1rem;
}

.search-box input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-weight: bold;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0.5rem;
}

.coins-container {
  max-height: 70vh;
  overflow-y: auto;
}

.coin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.coin-item:hover {
  background-color: #f8fafc;
}

.coin-item.selected {
  background-color: #e0e7ff;
}

.coin-item.favorite {
  border-left: 3px solid #f59e0b;
}

.coin-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.coin-info img {
  width: 24px;
  height: 24px;
}

.symbol {
  color: #64748b;
  font-size: 0.8rem;
}

.favorite-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #f59e0b;
  font-size: 1rem;
  margin-left: auto;
  padding: 0 0.5rem;
}

.coin-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 100px;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}
</style>