import axios from 'axios'

const BFF = import.meta.env.VITE_BFF_URL || 'http://localhost:8009'

const http = axios.create({ baseURL: BFF, timeout: 15000 })

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
