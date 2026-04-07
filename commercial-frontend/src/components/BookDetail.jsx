import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getBook } from '../api'
import { addToCart } from '../cart' 

const CATEGORY_NAMES = {
  1: 'Ficción',
  2: 'No Ficción',
  3: 'Ciencia',
  4: 'Historia',
  5: 'Filosofía',
  6: 'Tecnología',
  7: 'Arte',
  8: 'Economía',
}

// 🔹 Función para formatear precio
const formatPrice = (price) => {
  return `$${price?.toLocaleString('es-CO') || 0}`
}

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchase, setPurchase] = useState(null) // 🔹 Estado para la compra

  useEffect(() => {
    getBook(id)
      .then(data => {
        const result = Array.isArray(data) ? data[0] : data
        setBook(result)
        setLoading(false)
      })
      .catch(() => {
        setBook(null)
        setLoading(false)
      })
  }, [id])

  const getCoverUrl = () => {
    if (book?.cover_url) return book.cover_url;
    return 'https://placehold.co/400x600/1e293b/ffffff?text=Libro'
  }

  if (loading) return <p style={{ padding: '20px' }}>Cargando...</p>
  if (!book) return <p style={{ padding: '20px' }}>No se encontró el libro</p>

  const displayPrice = book.price || (book.title.length * 1200 + 15000);
  const category = CATEGORY_NAMES[book.category_id]

  return (
    <div className="detail-page">

      <header className="store-header">
        <div className="header-inner">
          <div
            className="header-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <div className="logo-icon">📚</div>
            <div>
              <div className="logo-text">BookFlow</div>
              <div className="logo-tagline">Tu librería</div>
            </div>
          </div>
        </div>
      </header>

      <div className="detail-breadcrumb">
        <button
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← Volver al catálogo
        </button>
      </div>

      <div className="detail-body">

        <aside className="detail-cover-wrap">
          <img
            className="detail-cover"
            src={getCoverUrl()}
            alt={book.title}
            style={{
              width: '260px',
              borderRadius: '10px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}
          />
        </aside>

        <main className="detail-info">

          {category && (
            <span className="detail-category">
              {category}
            </span>
          )}

          <h1 className="detail-title">{book.title}</h1>

          {book.subtitle && (
            <p style={{
              fontSize: '1rem',
              color: '#777',
              fontStyle: 'italic'
            }}>
              {book.subtitle}
            </p>
          )}

          <p className="detail-author">
            por <strong>{book.author}</strong>
          </p>

          {/* 🔹 PRECIO */}
          <p style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#4caf50',
            marginTop: '10px'
          }}>
            {formatPrice(displayPrice)}
          </p>

          <div className="detail-divider" />

          <div className="detail-meta-grid">
            {book.publisher && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Editorial</span>
                <span className="detail-meta-value">{book.publisher}</span>
              </div>
            )}

            {book.publication_year && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Año</span>
                <span className="detail-meta-value">{book.publication_year}</span>
              </div>
            )}

            {book.isbn && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">ISBN</span>
                <span className="detail-meta-value">{book.isbn}</span>
              </div>
            )}
          </div>

          {book.description && (
            <>
              <div className="detail-divider" />
              <p className="detail-description">{book.description}</p>
            </>
          )}

          <div className="detail-available-badge">
            ✓ Disponible en tienda
          </div>

          {/* 🛒 BOTÓN COMPRA */}
          <button
            onClick={() => {
              addToCart(book)
              setPurchase({
                title: book.title,
                price: formatPrice(book.price),
                quantity: 1
              })
            }}
            style={{
              marginTop: '15px',
              padding: '12px 20px',
              background: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Comprar ahora 🛒
          </button>

          {/* 🔹 PANEL DE COMPRA */}
          {purchase && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              border: '2px solid #9c27b0',
              borderRadius: '10px',
              backgroundColor: '#f3e5f5',
              color: '#4a148c'
            }}>
              <h3>✅ Compra realizada</h3>
              <p><strong>Libro:</strong> {purchase.title}</p>
              <p><strong>Precio:</strong> {purchase.price}</p>
              <p><strong>Cantidad:</strong> {purchase.quantity}</p>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
