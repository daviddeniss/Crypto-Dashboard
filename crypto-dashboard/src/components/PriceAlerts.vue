<template>
  <div class="price-alerts">
    <h3>🔔 Alertas de Preço</h3>
    
    <div class="add-alert">
      <select v-model="newAlert.coinId" class="coin-select">
        <option value="" disabled>Selecione uma moeda</option>
        <option 
          v-for="coin in coins" 
          :key="coin.id" 
          :value="coin.id"
        >
          {{ coin.name }} ({{ coin.symbol.toUpperCase() }})
        </option>
      </select>
      
      <select v-model="newAlert.direction" class="direction-select">
        <option value="above">Acima de</option>
        <option value="below">Abaixo de</option>
      </select>
      
      <input 
        v-model.number="newAlert.price" 
        type="number" 
        placeholder="Preço" 
        min="0"
        step="0.000001"
        class="price-input"
      >
      
      <button 
        @click="addAlert"
        :disabled="!isValidAlert"
        class="add-btn"
      >
        Adicionar Alerta
      </button>
    </div>
    
    <div class="alerts-list">
      <div 
        v-for="(alert, index) in alerts" 
        :key="index" 
        class="alert-item"
        :class="{ 'triggered': alert.triggered }"
      >
        <span class="coin-name">
          {{ getCoinName(alert.coinId) }}
        </span>
        <span class="alert-condition">
          {{ alert.direction === 'above' ? '≥' : '≤' }} 
          ${{ alert.price.toLocaleString() }}
        </span>
        <span 
          v-if="alert.triggered"
          class="triggered-badge"
        >
          Disparado
        </span>
        <button 
          @click="removeAlert(index)"
          class="remove-btn"
        >
          ×
        </button>
      </div>
      
      <div v-if="alerts.length === 0" class="no-alerts">
        Nenhum alerta configurado
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'PriceAlerts',
  props: {
    coins: {
      type: Array,
      required: true
    },
    alerts: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['add-alert', 'remove-alert'],
  
  setup(props, { emit }) {
    const newAlert = ref({
      coinId: '',
      direction: 'above',
      price: null
    })
    
    const isValidAlert = computed(() => {
      return newAlert.value.coinId && 
             newAlert.value.price > 0
    })
    
    const getCoinName = (coinId) => {
      const coin = props.coins.find(c => c.id === coinId)
      return coin ? `${coin.name} (${coin.symbol.toUpperCase()})` : 'Moeda desconhecida'
    }
    
    const addAlert = () => {
      if (!isValidAlert.value) return
      
      const alert = {
        ...newAlert.value,
        id: Date.now(),
        triggered: false
      }
      
      emit('add-alert', alert)
      
      // Reset form
      newAlert.value = {
        coinId: '',
        direction: 'above',
        price: null
      }
    }
    
    const removeAlert = (index) => {
      emit('remove-alert', index)
    }
    
    return {
      newAlert,
      isValidAlert,
      getCoinName,
      addAlert,
      removeAlert
    }
  }
}
</script>

<style scoped>
.price-alerts {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.price-alerts h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #334155;
}

.add-alert {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.coin-select, .direction-select, .price-input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  flex: 1;
  min-width: 120px;
}

.add-btn {
  padding: 0.5rem 1rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #4338ca;
}

.add-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.25rem;
  gap: 0.5rem;
}

.alert-item.triggered {
  background: #fffbeb;
}

.coin-name {
  flex: 1;
  font-weight: 500;
}

.alert-condition {
  font-family: monospace;
  background: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.triggered-badge {
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 0.5rem;
}

.no-alerts {
  color: #64748b;
  text-align: center;
  padding: 1rem;
}
</style>