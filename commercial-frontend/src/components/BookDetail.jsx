import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBook, getCategories } from '../api'
import EnrichedBookImage from './EnrichedBookImage'
import PriceBadge from './PriceBadge'
import AvailabilityBadge from './AvailabilityBadge'
import { addToCart, getCart } from '../cart'

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
  const [cartQuantity, setCartQuantity] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [bookData, categoriesData] = await Promise.all([
        getBook(id),
        getCategories()
      ])

      setBook(bookData)
      setCategories(categoriesData || [])

      const currentCart = getCart()
      const existing = currentCart.find(item => Number(item.id) === Number(id))
      setCartQuantity(existing?.quantity || 0)

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
    addToCart({ ...book, stock: numericStock })

    const currentCart = getCart()
    const existing = currentCart.find(item => Number(item.id) === Number(book.id))
    setCartQuantity(existing?.quantity || 0)
  }

  return (
    <main className="book-detail-page">
      <button className="back-link" onClick={() => navigate('/')}>
        ← Volver al catálogo
      </button>

      <section className="book-detail">
        <div className="book-detail-cover">
          <EnrichedBookImage book={book} height={390} borderRadius="12px" />
        </div>

        <div className="book-detail-info">
          <span className="book-detail-category">
            {category?.name || 'Sin categoría'}
          </span>

          <h1>{book.title}</h1>

          <p className="detail-author">
            por <strong>{book.author || 'Autor no disponible'}</strong>
          </p>

          <PriceBadge book={book} size="lg" />

          <div className="detail-meta">
            {book.publisher && (
              <div>
                <span>Editorial</span>
                <strong>{book.publisher}</strong>
              </div>
            )}

            {book.publication_year && (
              <div>
                <span>Año</span>
                <strong>{book.publication_year}</strong>
              </div>
            )}

            {book.isbn && (
              <div>
                <span>ISBN</span>
                <strong>{book.isbn}</strong>
              </div>
            )}

            {condition && (
              <div>
                <span>Estado</span>
                <strong>{condition}</strong>
              </div>
            )}

            <div>
              <span>Disponibilidad</span>
              <AvailabilityBadge stock={stock} />
            </div>

            {cartQuantity > 0 && (
              <div>
                <span>En carrito</span>
                <strong>{cartQuantity} unidad(es)</strong>
              </div>
            )}
          </div>

          <p className="book-description">
            {book.description || 'Libro enriquecido automáticamente desde fuentes bibliográficas externas.'}
          </p>

          <button
            className="buy-button"
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
    </main>
  )
}