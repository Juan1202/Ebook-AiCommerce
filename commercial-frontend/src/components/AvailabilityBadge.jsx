export default function AvailabilityBadge({ stock }) {
  if (stock === undefined || stock === null) return null

  const inStock = Number(stock) > 0

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '12px',
      fontWeight: '600',
      padding: '3px 10px',
      borderRadius: '20px',
      background: inStock ? '#D8F3DC' : '#FEE2E2',
      color: inStock ? '#1B4332' : '#991B1B',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: inStock ? '#22c55e' : '#ef4444',
        display: 'inline-block',
      }} />
      {inStock ? `${stock} disponible${stock !== 1 ? 's' : ''}` : 'Sin stock'}
    </span>
  )
}
