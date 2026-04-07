import { useNavigate } from 'react-router-dom'

export default function BookCard({ book, categories }) {
  const navigate = useNavigate()

  // 🔥 AGREGADO
  const formatPrice = (price) => {
    return `$${price.toLocaleString('es-CO')}`
  }

  const categoryName = categories?.find(
    c => c.id === book.category_id
  )?.name

  const getCoverUrl = () => {
    if (book.cover_url) return book.cover_url;
    
    return 'https://placehold.co/400x600/1a1a2e/ffffff?text=Libro'
  }

  // Generar un precio dinámico falso basado en el ID para no mostrar $0 (Sprint 1)
  const displayPrice = book.price || (book.title.length * 1200 + 15000);

  return (
    <div
      onClick={() => navigate(`/libro/${book.id}`)}
      style={{
        borderRadius: '15px',
        overflow: 'hidden',
        background: 'white',
        boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.1)'
      }}
    >
      <img
        src={getCoverUrl()}
        alt={book.title}
        style={{
          width: '100%',
          height: '220px',
          objectFit: 'cover',
          background: '#f0f0f0'
        }}
      />

      <div style={{ padding: '15px' }}>
        <h3 style={{
          margin: '0 0 6px',
          fontSize: '15px',
          lineHeight: '1.3',
          color: '#2d2d2d'
        }}>
          {book.title}
        </h3>

        <p style={{
          color: '#555',
          margin: '0 0 5px',
          fontSize: '13px'
        }}>
          {book.author}
        </p>

        {/* 🔥 PRECIO AGREGADO */}
        <p style={{
          color: '#4caf50',
          fontWeight: 'bold',
          margin: '0 0 5px'
        }}>
          {formatPrice(displayPrice)}
        </p>

        {/* Descripción añadida */}
        <p style={{
          color: '#666',
          fontSize: '12px',
          margin: '5px 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {book.description || 'Sin descripción disponible.'}
        </p>

        <p style={{
          color: '#9c27b0',
          margin: '5px 0 0',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {categoryName || 'Sin categoría'}
        </p>
      </div>
    </div>
  )
}