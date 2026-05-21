const STORAGE_KEY = 'bookflow-orders'

export function saveOrder(order) {
  const current =
    JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    ) || []

  current.unshift(order)

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(current)
  )
}

export function getOrders() {
  return (
    JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    ) || []
  )
}