export default function PriceBadge({ book, size = 'md' }) {
  const price = book?.suggested_price || book?.price

  if (!price) {
    return (
      <p className={`price-badge ${size}`}>
        Precio a consultar
      </p>
    )
  }

  return (
    <p className={`price-badge ${size}`}>
      ${Number(price).toLocaleString('es-CO')}
    </p>
  )
}
