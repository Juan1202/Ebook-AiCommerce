export const getCart = () => {
  return JSON.parse(localStorage.getItem('cart')) || []
}

export const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart))
}

export const addToCart = (book) => {
  const cart = getCart()

  const existing = cart.find(item => item.id === book.id)

  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ ...book, quantity: 1 })
  }

  saveCart(cart)
  window.dispatchEvent(new Event('cartUpdated'))
}

export const removeFromCart = (id) => {
  const cart = getCart().filter(item => item.id !== id)
  saveCart(cart)
  window.dispatchEvent(new Event('cartUpdated'))
}

export const getCartCount = () => {
  return getCart().reduce((acc, item) => acc + item.quantity, 0)
}

export const getCartTotal = () => {
  return getCart().reduce((acc, item) => {
    return acc + (item.price || 0) * item.quantity
  }, 0)
}

// ➕ Aumentar cantidad
export const increaseQuantity = (id) => {
  const cart = getCart()
  const item = cart.find(i => i.id === id)

  if (item) item.quantity += 1

  saveCart(cart)
  window.dispatchEvent(new Event('cartUpdated'))
}

// ➖ Disminuir cantidad
export const decreaseQuantity = (id) => {
  let cart = getCart()
  const item = cart.find(i => i.id === id)

  if (item) {
    item.quantity -= 1

    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id)
    }
  }

  saveCart(cart)
  window.dispatchEvent(new Event('cartUpdated'))
}