<template>
  <div class="market-overview">
    <h3>Visão Geral do Mercado</h3>
    
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Capitalização de Mercado</span>
        <span class="stat-value">${{ marketCap.toLocaleString() }}</span>
        <span 
          class="stat-change"
          :class="{
            'positive': marketCapChange24h > 0,
            'negative': marketCapChange24h < 0
          }"
        >
          {{ marketCapChange24h.toFixed(2) }}%
        </span>
      </div>
      
      <div class="stat-card">
        <span class="stat-label">Volume 24h</span>
        <span class="stat-value">${{ volume24h.toLocaleString() }}</span>
      </div>
      
      <div class="stat-card">
        <span class="stat-label">BTC Dominance</span>
        <span class="stat-value">{{ btcDominance.toFixed(1) }}%</span>
      </div>
      
      <div class="stat-card">
        <span class="stat-label">ETH Dominance</span>
        <span class="stat-value">{{ ethDominance.toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'MarketOverview',
  props: {
    stats: {
      type: Object,
      required: true
    }
  },
  
  setup(props) {
    const marketCap = computed(() => props.stats.total_market_cap?.usd || 0)
    const volume24h = computed(() => props.stats.total_volume?.usd || 0)
    const marketCapChange24h = computed(() => props.stats.market_cap_change_percentage_24h_usd || 0)
    const btcDominance = computed(() => props.stats.market_cap_percentage?.btc || 0)
    const ethDominance = computed(() => props.stats.market_cap_percentage?.eth || 0)
    
    return {
      marketCap,
      volume24h,
      marketCapChange24h,
      btcDominance,
      ethDominance
    }
  }
}
</script>

<style scoped>
.market-overview {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.market-overview h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #334155;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.9rem;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}
</style>