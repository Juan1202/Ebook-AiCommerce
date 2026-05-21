import { useState } from 'react'
import { useCartStore } from './cart.store'
import EnrichedBookImage from '../components/EnrichedBookImage'

export default function CartLine({ item, stockError }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  const lineTotal = (item.unitPrice * item.quantity).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

  const unitFormatted = item.unitPrice.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

  return (
    <div style={{
      ...styles.row,
      borderBottom: stockError ? '1px solid #fca5a5' : '1px solid var(--border)',
      backgroundColor: stockError ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
      padding: stockError ? '12px 8px' : '12px 0',
      borderRadius: stockError ? '8px' : '0',
      transition: 'all 0.2s ease',
    }}>
      <div style={styles.cover}>
        <EnrichedBookImage book={{ title: item.title, cover_url: item.cover_url || item.coverUrl }} height="100%" borderRadius="4px" />
      </div>

      <div style={styles.info}>
        <p style={styles.title}>{item.title}</p>
        <div style={styles.priceRow}>
          <span style={styles.unitPrice}>{unitFormatted} c/u</span>
          {item.isPriceFallback && (
            <span style={styles.estimadoBadge}>Estimado</span>
          )}
        </div>
        {stockError && (
          <div style={{
            fontSize: '10px',
            color: '#b91c1c',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '4px',
            padding: '2px 6px',
            marginTop: '6px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            width: 'fit-content'
          }}>
            <span>⚠️ Disp: {stockError.available}</span>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <button
          style={styles.stepBtn}
          aria-label="Disminuir cantidad"
          onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
        >
          −
        </button>
        <span style={styles.qty}>{item.quantity}</span>
        <button
          style={styles.stepBtn}
          aria-label="Aumentar cantidad"
          onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
        >
          +
        </button>
      </div>

      <div style={styles.lineTotalWrap}>
        <span style={styles.lineTotal}>{lineTotal}</span>
        <button
          style={styles.removeBtn}
          aria-label="Eliminar del carrito"
          onClick={() => removeItem(item.bookId)}
        >
          ×
        </button>
      </div>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid var(--border)',
  },
  cover: {
    flexShrink: 0,
    width: 52,
    height: 68,
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  unitPrice: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  estimadoBadge: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#92400E',
    background: '#FEF3C7',
    border: '1px solid #F59E0B',
    borderRadius: '4px',
    padding: '1px 5px',
    letterSpacing: '0.02em',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  stepBtn: {
    width: 28,
    height: 28,
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '16px',
    lineHeight: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition)',
  },
  qty: {
    minWidth: '20px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text)',
  },
  lineTotalWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    flexShrink: 0,
  },
  lineTotal: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--primary)',
    whiteSpace: 'nowrap',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontSize: '18px',
    lineHeight: 1,
    padding: '0 2px',
    transition: 'var(--transition)',
  },
}
