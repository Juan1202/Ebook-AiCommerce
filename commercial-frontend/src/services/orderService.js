import axios from 'axios'

const BFF = import.meta.env.VITE_BFF_URL || 'http://localhost:8009'

const http = axios.create({ baseURL: BFF, timeout: 15000 })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('bf_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
/**
 * @param {string} customerId
 * @param {import('../cart/cart.types').CartItem[]} items
 * @returns {Promise<Object>}
 */
export async function createOrder(customerId, items) {
  const response = await http.post('/api/orders', {
    customer_id: customerId,
    items: items.map((i) => ({
      book_id: i.bookId,
      quantity: i.quantity,
      unit_price_override: i.unitPrice,
    })),
  })
  return response.data
}

export async function confirmOrder(orderId) {
  const response = await http.post(`/api/orders/${orderId}/confirm`)
  return response.data
}

export async function getOrders(customerId) {
  const response = await http.get(`/api/orders?customer_id=${customerId}`)
  return response.data
}

export async function getOrder(orderId) {
  const response = await http.get(`/api/orders/${orderId}`)
  return response.data
}
