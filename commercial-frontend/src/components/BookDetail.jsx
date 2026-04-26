import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getBook } from '../api'
import { addToCart } from '../cart'
import EnrichedBookImage from './EnrichedBookImage'
import PriceBadge from './PriceBadge'
import AvailabilityBadge from './AvailabilityBadge'

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

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

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

  if (loading) return <p style={{ padding: '20px' }}>Cargando...</p>
  if (!book) return <p style={{ padding: '20px' }}>No se encontró el libro</p>

  const category = CATEGORY_NAMES[book.category_id]
  const inStock = book.stock === undefined || book.stock === null || Number(book.stock) > 0
  const description = book.normalized_description || book.description
  const publisher = book.normalized_publisher || book.publisher

  const handleAddToCart = () => {
    addToCart(book)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

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
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Volver al catálogo
        </button>
      </div>

      <div className="detail-body">

        <aside className="detail-cover-wrap">
          <EnrichedBookImage
            book={book}
            height={390}
            borderRadius="var(--radius-md)"
          />
        </aside>

        <main className="detail-info">

          {category && (
            <span className="detail-category">{category}</span>
          )}

          <h1 className="detail-title">{book.title}</h1>

          {book.subtitle && (
            <p style={{ fontSize: '1rem', color: '#777', fontStyle: 'italic' }}>
              {book.subtitle}
            </p>
          )}

          <p className="detail-author">
            por <strong>{book.author}</strong>
          </p>

          <PriceBadge book={book} size="lg" />

          {book.stock !== undefined && book.stock !== null && (
            <div style={{ marginTop: '4px', marginBottom: '8px' }}>
              <AvailabilityBadge stock={book.stock} />
            </div>
          )}

          <div className="detail-divider" />

          <div className="detail-meta-grid">
            {publisher && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Editorial</span>
                <span className="detail-meta-value">{publisher}</span>
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

            {book.condition && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Condición</span>
                <span className="detail-meta-value">{book.condition}</span>
              </div>
            )}
          </div>

          {description && (
            <>
              <div className="detail-divider" />
              <p className="detail-description">{description}</p>
            </>
          )}

          <button
            className="detail-buy-btn"
            disabled={!inStock}
            onClick={handleAddToCart}
            style={{ opacity: inStock ? 1 : 0.45, cursor: inStock ? 'pointer' : 'not-allowed' }}
          >
            {added ? '✓ Agregado al carrito' : inStock ? 'Comprar ahora 🛒' : 'Sin stock'}
          </button>

        </main>
      </div>
    </div>
  )
}
