import { useEffect, useState } from 'react'
import {
  getCart,
  removeFromCart,
  getCartTotal,
  increaseQuantity,
  decreaseQuantity,
  getCartCount
} from '../cart'

export default function Cart() {
  const [cart, setCart] = useState([])
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)

  const loadCart = () => {
    setCart(getCart())
    setCount(getCartCount())
  }

  useEffect(() => {
    loadCart()

    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [])

  // 🔥 NUEVO: función de compra
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }

    // 🔥 Validación fake de stock
    const outOfStock = cart.find(item => item.quantity > 5)

    if (outOfStock) {
      alert(`No hay suficiente stock de: ${outOfStock.title}`)
      return
    }

    // 🧾 Crear pedido (simulado)
    const order = {
      id: Date.now(),
      items: cart,
      total: getCartTotal(),
      date: new Date().toLocaleString()
    }

    console.log('Pedido creado:', order)

    // 🧹 Vaciar carrito
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cartUpdated'))

    alert('✅ Compra realizada con éxito')
  }

  return (
    <>
      {/* 🛒 ICONO SIEMPRE VISIBLE */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          cursor: 'pointer',
          fontSize: '26px',
          zIndex: 2000,
          background: 'white',
          borderRadius: '50%',
          padding: '10px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
        }}
      >
        🛒
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: '#e91e63',
            color: 'white',
            borderRadius: '50%',
            padding: '3px 7px',
            fontSize: '12px'
          }}>
            {count}
          </span>
        )}
      </div>

      {/* 🧾 PANEL DEL CARRITO */}
      {open && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          width: '320px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.25)',
          padding: '15px',
          zIndex: 2000
        }}>
          <h3 style={{ marginBottom: '10px' }}>🛒 Carrito</h3>

          {cart.length === 0 && <p>Vacío</p>}

          {cart.map(item => (
            <div key={item.id} style={{ marginBottom: '12px' }}>
              <strong>{item.title}</strong>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '5px'
              }}>
                <button onClick={() => decreaseQuantity(item.id)}>➖</button>

                <span style={{ margin: '0 10px' }}>
                  {item.quantity}
                </span>

                <button onClick={() => increaseQuantity(item.id)}>➕</button>

                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    marginLeft: 'auto',
                    background: '#e53935',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '3px 6px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <hr />

          <strong>Total: ${getCartTotal()}</strong>

          {/* 🔥 NUEVO BOTÓN */}
          <button
            onClick={handleCheckout}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '10px',
              background: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Finalizar compra
          </button>
        </div>
      )}
    </>
  )
}