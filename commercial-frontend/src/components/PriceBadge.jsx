export default function PriceBadge({ book, size = 'md' }) {
  const price = book.suggested_price ?? book.price ?? null
  const isSuggested = book.suggested_price != null
  const isFallback = book.is_fallback === true || book.source === 'internal_rules'

  const sizes = {
    sm: { price: '15px', label: '10px', padding: '6px 0' },
    md: { price: '20px', label: '11px', padding: '8px 0' },
    lg: { price: '28px', label: '12px', padding: '10px 0' },
  }
  const s = sizes[size] || sizes.md

  if (price === null) {
    return (
      <p style={{ fontSize: s.price, color: 'var(--text-muted)', padding: s.padding }}>
        Precio a consultar
      </p>
    )
  }

  const formatted = `$${Number(price).toLocaleString('es-CO')}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: s.padding, flexWrap: 'wrap' }}>
      <span style={{ fontSize: s.price, fontWeight: '700', color: 'var(--accent)' }}>
        {formatted}
      </span>
      {isSuggested && (
        <span style={{
          fontSize: s.label,
          padding: '2px 7px',
          borderRadius: '20px',
          background: isFallback ? '#FEF3C7' : '#D8F3DC',
          color: isFallback ? '#92400E' : '#1B4332',
          fontWeight: '500',
        }}>
          {isFallback ? 'Estimado' : 'Verificado'}
        </span>
      )}
    </div>
  )
}
