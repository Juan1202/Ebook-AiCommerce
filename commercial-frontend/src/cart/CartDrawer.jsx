import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from './cart.store'
import { selectItems, selectTotalAmount, selectTotalItems } from './cart.selectors'
import CartLine from './CartLine'
import { getBook } from '../api'

/**
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const items = useCartStore(selectItems)
  const totalAmount = useCartStore(selectTotalAmount)
  const totalItems = useCartStore(selectTotalItems)

  const [stockErrors, setStockErrors] = useState([])
  const [checkingStock, setCheckingStock] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setStockErrors([])
      return
    }

    let isMounted = true

    async function checkStock() {
      setCheckingStock(true)
      const errors = []
      try {
        const promises = items.map(async (item) => {
          try {
            return await getBook(item.bookId)
          } catch (e) {
            console.error(`Error al consultar stock del libro ${item.bookId}:`, e)
            return null
          }
        })
        const booksData = await Promise.all(promises)

        if (!isMounted) return

        items.forEach((item, idx) => {
          const bookData = booksData[idx]
          if (bookData) {
            const available = bookData.quantity_available !== undefined && bookData.quantity_available !== null
              ? Number(bookData.quantity_available)
              : 9999

            if (item.quantity > available) {
              errors.push({
                bookId: item.bookId,
                title: bookData.title || item.title,
                requested: item.quantity,
                available: available
              })
            }
          }
        })
      } catch (err) {
        console.error("Error al validar stock completo:", err)
      } finally {
        if (isMounted) {
          setStockErrors(errors)
          setCheckingStock(false)
        }
      }
    }

    checkStock()

    return () => {
      isMounted = false
    }
  }, [isOpen, items])

  function handleGoToCheckout() {
    if (stockErrors.length > 0 || checkingStock) return
    onClose()
    navigate('/checkout')
  }

  const totalFormatted = totalAmount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

  return (
    <>
      {isOpen && (
        <div
          className="cart-backdrop"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`cart-drawer${isOpen ? ' is-open' : ''}`}
      >
        <div className="cart-drawer__header">
          <div>
            <h2 className="cart-drawer__title">Carrito</h2>
            {totalItems > 0 && (
              <p className="cart-drawer__subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
              </p>
            )}
          </div>
          <button className="cart-drawer__close" onClick={onClose} aria-label="Cerrar carrito">
            ×
          </button>
        </div>

        <div className="cart-drawer__body">
          {stockErrors.length > 0 && (
            <div className="cart-drawer__error" style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(254, 226, 226, 0.95)', color: '#991b1b' }}>
              {stockErrors.map((err, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', lineHeight: '1.4' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '-1px' }}>⚠️</span>
                  <div>
                    <strong>Stock insuficiente para el libro:</strong> "{err.title}". Máximo disponible: <strong>{err.available} {err.available === 1 ? 'unidad' : 'unidades'}</strong>.
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <span className="cart-drawer__empty-icon">🛒</span>
              <p className="cart-drawer__empty-text">Tu carrito está vacío</p>
              <p className="cart-drawer__empty-hint">Agrega libros desde el catálogo</p>
            </div>
          ) : (
            <div>
              {items.map((item) => {
                const stockError = stockErrors.find((e) => e.bookId === item.bookId)
                return (
                  <CartLine
                    key={item.bookId}
                    item={item}
                    stockError={stockError}
                  />
                )
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__summary-row">
              <span className="cart-drawer__summary-label">Total estimado</span>
              <span className="cart-drawer__summary-amount">{totalFormatted}</span>
            </div>

            <button
              className="cart-drawer__cta"
              onClick={handleGoToCheckout}
              disabled={stockErrors.length > 0 || checkingStock}
              style={{
                opacity: (stockErrors.length > 0 || checkingStock) ? 0.6 : 1,
                cursor: (stockErrors.length > 0 || checkingStock) ? 'not-allowed' : 'pointer',
                backgroundColor: (stockErrors.length > 0) ? '#4a1515' : 'var(--primary)',
                color: (stockErrors.length > 0) ? '#fca5a5' : '#ffffff',
                border: (stockErrors.length > 0) ? '1px solid #7f1d1d' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {checkingStock ? 'Verificando Stock...' : 'Ir a Pagar'}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
