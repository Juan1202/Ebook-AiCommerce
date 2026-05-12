import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBook, getCategories } from '../api'
import EnrichedBookImage from './EnrichedBookImage'
import PriceBadge from './PriceBadge'
import AvailabilityBadge from './AvailabilityBadge'
import { useCartStore } from '../cart/cart.store'
import RecommendedBooks from './RecommendedBooks'

function getStock(book) {
  return book.stock ?? book.available_units ?? book.unidades_disponibles ?? book.units_available ?? null
}

function getCondition(book) {
  return book.condition ?? book.estado ?? book.estado_libro ?? book.book_condition ?? null
}

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const addItem = useCartStore(s => s.addItem)
  const cartItem = useCartStore(s => s.items.find(i => i.bookId === String(id)))
  const cartQuantity = cartItem?.quantity || 0

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [bookData, categoriesData] = await Promise.all([
        getBook(id),
        getCategories()
      ])

      setBook(bookData)
      setCategories(categoriesData || [])
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) {
    return <main className="book-detail-page"><p>Cargando libro...</p></main>
  }

  if (!book) {
    return <main className="book-detail-page"><p>Libro no encontrado.</p></main>
  }

  const category = categories.find(c => Number(c.id) === Number(book.category_id))
  const stock = getStock(book)
  const condition = getCondition(book)

  const numericStock =
    stock === null || stock === undefined || stock === '' ? null : Number(stock)

  const isAvailable =
    numericStock === null || numericStock > 0

  const reachedStock =
    numericStock !== null && cartQuantity >= numericStock

  const handleAdd = () => {
    addItem({
      bookId: String(book.id),
      title: book.title,
      quantity: 1,
      unitPrice: book.suggested_price ?? book.price ?? 0,
      coverUrl: book.cover_url,
      isPriceFallback: book.is_fallback ?? false,
    })
  }

  return (
    <main className="book-detail-page">
      <button className="book-detail-back" onClick={() => navigate('/')}>
        ← Volver al catálogo
      </button>

      <section className="book-detail-grid">
        <div className="book-detail-cover">
          <EnrichedBookImage book={book} height="100%" />
        </div>

        <div className="book-detail-info">
          <span className="book-detail-category">
            {category?.name || 'Sin categoría'}
          </span>

          <h1 className="book-detail-title">{book.title}</h1>

          <p className="book-detail-author">
            por <strong>{book.author || 'Autor no disponible'}</strong>
          </p>

          <PriceBadge book={book} size="lg" />

          <div className="detail-meta">
            {book.publisher && (
              <div className="detail-meta__row">
                <span className="detail-meta__label">Editorial</span>
                <strong className="detail-meta__value">{book.publisher}</strong>
              </div>
            )}

            {book.publication_year && (
              <div className="detail-meta__row">
                <span className="detail-meta__label">Año</span>
                <strong className="detail-meta__value">{book.publication_year}</strong>
              </div>
            )}

            {book.isbn && (
              <div className="detail-meta__row">
                <span className="detail-meta__label">ISBN</span>
                <strong className="detail-meta__value">{book.isbn}</strong>
              </div>
            )}

            {condition && (
              <div className="detail-meta__row">
                <span className="detail-meta__label">Estado</span>
                <strong className="detail-meta__value">{condition}</strong>
              </div>
            )}

            <div className="detail-meta__row">
              <span className="detail-meta__label">Disponibilidad</span>
              <AvailabilityBadge stock={stock} />
            </div>

            {cartQuantity > 0 && (
              <div className="detail-meta__row">
                <span className="detail-meta__label">En carrito</span>
                <strong className="detail-meta__value">{cartQuantity} unidad(es)</strong>
              </div>
            )}
          </div>

          <p className="book-detail-description">
            {book.description || 'Libro enriquecido automáticamente desde fuentes bibliográficas externas.'}
          </p>

          <button
            className="book-detail-buy-btn"
            disabled={!isAvailable || reachedStock}
            onClick={handleAdd}
          >
            {!isAvailable
              ? 'Agotado'
              : reachedStock
                ? 'Stock máximo en carrito'
                : 'Agregar al carrito 🛒'}
          </button>
        </div>
      </section>

      <RecommendedBooks
        bookId={book.id}
        onBookClick={(bookId) => navigate('/libro/' + bookId)}
      />
    </main>
  )
}
