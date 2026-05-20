import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../cart/cart.store'
import { selectItems, selectTotalAmount, selectTotalItems } from '../cart/cart.selectors'
import { createOrder, confirmOrder } from '../services/orderService'
import { useAuthStore } from '../auth/authStore'
import { CheckCircle2, CreditCard, Wallet, AlertCircle } from 'lucide-react'
import './checkout.css'

export default function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore(selectItems)
  const totalAmount = useCartStore(selectTotalAmount)
  const totalItems = useCartStore(selectTotalItems)
  const clear = useCartStore((s) => s.clear)
  const { user } = useAuthStore()

  const [paymentMethod, setPaymentMethod] = useState('tarjeta')
  const [orderState, setOrderState] = useState('idle')
  const [errorDetail, setErrorDetail] = useState(null)



  if (items.length === 0 && orderState !== 'done') {
    return (
      <main className="checkout-page empty-checkout">
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, rgba(255,200,50,0.05), rgba(255,160,0,0.08))',
          borderRadius: '24px',
          border: '1px solid rgba(255,200,50,0.15)',
          maxWidth: '480px',
          margin: '4rem auto',
        }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🛍️</div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.6rem' }}>Tu carrito está vacío</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            No tienes artículos para proceder al pago.
          </p>
          <button
            onClick={() => navigate('/catalogo')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'linear-gradient(135deg, #f5a623, #e8890c)',
              color: '#fff',
              border: 'none',
              borderRadius: '50px',
              padding: '0.9rem 2.2rem',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(245,166,35,0.45)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(245,166,35,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(245,166,35,0.45)'; }}
          >
            📖 Explorar catálogo
          </button>
        </div>
      </main>
    )
  }

  async function handleExecuteOrder(e) {
    e.preventDefault()
    if (orderState === 'loading') return



    setOrderState('loading')
    setErrorDetail(null)

    const customerId = user?.user_id ?? user?.id ?? ('guest-' + (crypto.randomUUID?.() ?? 'anon'))

    try {
      const order = await createOrder(customerId, items)
      await confirmOrder(order.id)

      clear()
      setOrderState('done')
      navigate(`/order-success/${order.id}`, {
        state: { order, totalAmount, paymentMethod }
      })
    } catch (err) {
      setOrderState('error')
      if (err.response?.data?.detail?.error === 'insufficient_stock') {
        setErrorDetail('Stock insuficiente para algunos libros.')
      } else {
        setErrorDetail('Error al crear el pedido. Intenta de nuevo.')
      }
      setTimeout(() => setOrderState('idle'), 5000)
    }
  }

  const totalFormatted = totalAmount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem 0.7rem 2.4rem',
    borderRadius: '10px',
    border: '1.5px solid var(--border-color, #2a2d3e)',
    background: 'var(--bg-input, #181a27)',
    color: 'var(--text-primary, #e2e4f0)',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Revisión de Pedido y Pago</h1>
          <p>Confirma tus productos y elige cómo pagar.</p>
        </div>

        <div className="checkout-layout">
          <form className="checkout-payment-section" onSubmit={handleExecuteOrder}>



            {/* ── Método de pago ── */}
            <section className="payment-methods">
              <h3>Método de pago</h3>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'tarjeta' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="tarjeta"
                    checked={paymentMethod === 'tarjeta'}
                    onChange={() => setPaymentMethod('tarjeta')}
                  />
                  <CreditCard size={20} />
                  <span>Tarjeta</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'pse' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pse"
                    checked={paymentMethod === 'pse'}
                    onChange={() => setPaymentMethod('pse')}
                  />
                  <Wallet size={20} />
                  <span>PSE</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'nequi' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="nequi"
                    checked={paymentMethod === 'nequi'}
                    onChange={() => setPaymentMethod('nequi')}
                  />
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem', lineHeight: 1 }}>N</span>
                  <span>Nequi</span>
                </label>
              </div>

              {paymentMethod === 'tarjeta' && (
                <div className="card-details fake-form">
                  <input 
                    type="text" 
                    placeholder="Número de tarjeta (16 dígitos)" 
                    required 
                    maxLength="16"
                    pattern="\d{16}"
                    title="Ingresa 16 números sin espacios"
                    onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                  />
                  <div className="card-split">
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      required 
                      maxLength="5"
                      pattern="(0[1-9]|1[0-2])\/\d{2}"
                      title="Formato válido MM/YY"
                      onInput={(e) => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                        e.target.value = v;
                      }}
                    />
                    <input 
                      type="password" 
                      placeholder="CVC" 
                      required 
                      maxLength="4"
                      pattern="\d{3,4}"
                      title="Ingresa 3 o 4 números"
                      onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nombre en la tarjeta" 
                    required 
                    pattern="[a-zA-Z\s]+"
                    title="Solo letras y espacios"
                    onInput={(e) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '')}
                  />
                </div>
              )}
            </section>

            {errorDetail && (
              <div className="checkout-error">
                <AlertCircle size={18} />
                <span>{errorDetail}</span>
              </div>
            )}

            <button
              type="submit"
              className="execute-order-btn"
              disabled={orderState === 'loading'}
            >
              {orderState === 'loading' ? 'Procesando...' : `Pagar ${totalFormatted}`}
            </button>
          </form>

          <aside className="checkout-review">
            <h3>Resumen del Pedido</h3>
            <span className="items-count">{totalItems} artículos</span>
            
            <div className="review-items">
              {items.map((item) => (
                <div key={item.bookId} className="review-item">
                  <div className="item-info">
                    <span className="item-title">{item.title}</span>
                    <span className="item-qty">Cant: {item.quantity}</span>
                  </div>
                  <span className="item-price">
                    {(item.unitPrice * item.quantity).toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="review-total">
              <span>Total a pagar</span>
              <span className="total-amount">{totalFormatted}</span>
            </div>


          </aside>
        </div>
      </div>
    </main>
  )
}
