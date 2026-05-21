import { useState, useEffect } from 'react'
import { useCartStore } from './cart.store'
import {
  selectItems,
  selectTotalAmount,
  selectTotalItems,
} from './cart.selectors'
import CartLine from './CartLine'
import { createOrder } from '../services/orderService'
import { useAuthStore } from '../auth/authStore'
import CheckoutModal from '../checkout/CheckoutModal'
import OrderSuccessModal from '../checkout/OrderSuccessModal'
import { saveOrder } from '../orders/orders.storage'

/**
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function CartDrawer({ isOpen, onClose }) {
  const items = useCartStore(selectItems)

  const totalAmount = useCartStore(selectTotalAmount)

  const totalItems = useCartStore(selectTotalItems)

  const clear = useCartStore((s) => s.clear)

  const { user } = useAuthStore()

  const [orderState, setOrderState] = useState('idle')

  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const [successOpen, setSuccessOpen] = useState(false)

  const [successData, setSuccessData] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  async function handleConfirm(checkoutData) {
    if (orderState === 'loading' || items.length === 0) {
      return
    }

    setOrderState('loading')

    const customerId =
      user?.id ??
      ('guest-' + (crypto.randomUUID?.() ?? 'anon'))

    console.log('Datos checkout:', checkoutData)

    try {
      await createOrder(customerId, items)

      const totalFormatted =
        totalAmount.toLocaleString(
          'es-CO',
          {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
          }
        )

      const orderNumber = Math.floor(
        Math.random() * 1000000
      )

      const orderData = {
        id: orderNumber,

        orderNumber,

        date: new Date().toLocaleDateString(),

        ...checkoutData,

        items,

        total: totalFormatted,

        status: 'Pendiente',
      }

      setSuccessData(orderData)

      saveOrder(orderData)

      setSuccessOpen(true)

      clear()

      setOrderState('done')

      setTimeout(() => {
        setOrderState('idle')
        onClose()
      }, 1500)

    } catch (error) {
      console.error(error)

      if (error.response?.status === 409) {
        setOrderState('stock-error')
      } else {
        setOrderState('error')
      }

      setTimeout(() => {
        setOrderState('idle')
      }, 3000)
    }
  }

  const totalFormatted =
    totalAmount.toLocaleString(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }
    )

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
        className={`cart-drawer${
          isOpen ? ' is-open' : ''
        }`}
      >
        <div className="cart-drawer__header">
          <div>
            <h2 className="cart-drawer__title">
              Carrito
            </h2>

            {totalItems > 0 && (
              <p className="cart-drawer__subtitle">
                {totalItems}{' '}
                {totalItems === 1
                  ? 'artículo'
                  : 'artículos'}
              </p>
            )}
          </div>

          <button
            className="cart-drawer__close"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <span className="cart-drawer__empty-icon">
                🛒
              </span>

              <p className="cart-drawer__empty-text">
                Tu carrito está vacío
              </p>

              <p className="cart-drawer__empty-hint">
                Agrega libros desde el catálogo
              </p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartLine
                  key={item.bookId}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__summary-row">
              <span className="cart-drawer__summary-label">
                Total estimado
              </span>

              <span className="cart-drawer__summary-amount">
                {totalFormatted}
              </span>
            </div>

            {orderState === 'error' && (
              <p className="cart-drawer__error">
                Error al crear el pedido.
                Intenta de nuevo.
              </p>
            )}

            {orderState === 'stock-error' && (
              <p className="cart-drawer__error">
                Algunos libros ya no tienen
                stock disponible.
              </p>
            )}

            <button
              className="cart-drawer__cta"
              onClick={() =>
                setCheckoutOpen(true)
              }
              disabled={
                orderState === 'loading'
              }
            >
              Continuar compra
            </button>
          </div>
        )}
      </aside>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() =>
          setCheckoutOpen(false)
        }
        onConfirm={async (
          checkoutData
        ) => {
          setCheckoutOpen(false)

          await handleConfirm(
            checkoutData
          )
        }}
      />

      <OrderSuccessModal
        isOpen={successOpen}
        onClose={() =>
          setSuccessOpen(false)
        }
        orderData={successData}
      />
    </>
  )
}