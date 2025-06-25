export function setupWebSocket(symbols, callback) {
  const formattedSymbols = symbols.map(s => `${s.toLowerCase()}@ticker`)
  const streamNames = formattedSymbols.join('/')

  const socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streamNames}`)

  socket.onopen = () => {
    console.log('WebSocket connected')
  }

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)

      if (message.stream && message.data) {
        const symbol = message.stream.split('@')[0]
        const data = message.data

        // Enviar um array com o objeto para o callback
        callback([{
          s: symbol.toUpperCase(),  // Symbol
          c: parseFloat(data.c),    // Last price
          P: parseFloat(data.P),    // Price change percent
          p: parseFloat(data.p),    // Price change
          h: parseFloat(data.h),    // High price
          l: parseFloat(data.l),    // Low price
          v: parseFloat(data.v),    // Volume
          q: parseFloat(data.q)     // Quote volume
        }])
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error)
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  socket.onclose = () => {
    console.log('WebSocket disconnected')
    // Tentar reconectar após 5 segundos
    setTimeout(() => setupWebSocket(symbols, callback), 5000)
  }

  return socket
}
