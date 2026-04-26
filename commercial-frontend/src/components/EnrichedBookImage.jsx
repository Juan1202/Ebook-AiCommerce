import { useState } from 'react'

function getInitials(title) {
  return (title || 'Libro')
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'LB'
}

const COVER_COLORS = [
  '1B4332', '2D6A4F', '1a1a2e', '16213e', '0f3460',
  '4a1942', '6b2d8b', '7b3f00', '2c3e50',
]

function colorForTitle(title) {
  const idx = (title || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return COVER_COLORS[idx % COVER_COLORS.length]
}

export default function EnrichedBookImage({ book, height = 220, borderRadius = '8px' }) {
  const [failed, setFailed] = useState(false)

  const hasCover = book.cover_url && book.cover_url.startsWith('http') && !failed
  const initials = getInitials(book.title)
  const bg = colorForTitle(book.title)

  const imgStyle = {
    width: '100%',
    height,
    objectFit: 'cover',
    borderRadius,
    background: '#f0f0f0',
    display: 'block',
  }

  if (hasCover) {
    return (
      <img
        src={book.cover_url}
        alt={book.title}
        style={imgStyle}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div style={{
      ...imgStyle,
      background: `#${bg}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }}>
      <span style={{ fontSize: '36px', opacity: 0.6 }}>📚</span>
      <span style={{
        fontSize: '22px',
        fontWeight: '800',
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: '2px',
      }}>
        {initials}
      </span>
    </div>
  )
}
