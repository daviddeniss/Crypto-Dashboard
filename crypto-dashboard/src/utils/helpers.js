// Formata valores monetários
export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(value)
}

// Formata porcentagens
export function formatPercentage(value) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

// Retorna a cor baseada no valor (positivo/negativo)
export function getValueColor(value) {
  return value > 0 ? 'var(--success)' : value < 0 ? 'var(--danger)' : 'inherit'
}

// Debounce para otimizar chamadas de API
export function debounce(fn, delay = 300) {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

// Converte timestamp para formato legível
export function formatTimestamp(timestamp, format = 'DD/MM/YYYY HH:mm') {
  const date = new Date(timestamp)
  return dayjs(date).format(format)
}

// Filtra e ordena a lista de moedas
export function filterAndSortCoins(coins, searchQuery, sortField = 'market_cap', sortDirection = 'desc') {
  const filtered = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return filtered.sort((a, b) => {
    const valueA = a[sortField]
    const valueB = b[sortField]
    
    if (sortDirection === 'asc') {
      return valueA - valueB
    }
    return valueB - valueA
  })
}