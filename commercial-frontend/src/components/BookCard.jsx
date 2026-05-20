import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Check } from 'lucide-react'
import EnrichedBookImage from './EnrichedBookImage'
import { useCartStore } from '../cart/cart.store'

const CONDITION_CLASSES = {
  nuevo: 'book-condition-nuevo',
  bueno: 'book-condition-bueno',
  aceptable: 'book-condition-aceptable',
  deteriorado: 'book-condition-deteriorado',
}

function getStock(book) {
  return book.stock ?? book.quantity_available ?? book.available_units ?? book.unidades_disponibles ?? book.units_available ?? null
}

function getCondition(book) {
  return book.condition ?? book.estado ?? book.estado_libro ?? book.book_condition ?? null
}

function formatPrice(price) {
  if (price === null || price === undefined) return 'Precio a consultar'
  const val = Math.round(Number(price))
  return '$ ' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function BookCard({ book, categories }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [addedSuccessfully, setAddedSuccessfully] = useState(false)

  const items = useCartStore(s => s.items) || []
  const addItem = useCartStore(s => s.addItem)
  const removeItem = useCartStore(s => s.removeItem)

  const bookIdStr = String(book.id)
  const inCart = items.some(i => i.bookId === bookIdStr)

  const stock = getStock(book)
  const conditionRaw = getCondition(book)
  const conditionKey = conditionRaw ? String(conditionRaw).toLowerCase() : null
  const conditionClass = conditionKey ? (CONDITION_CLASSES[conditionKey] ?? 'book-condition-default') : null

  const price = book.price ?? book.suggested_price ?? null
  const year = book.publication_year ?? book.year ?? book.año ?? null

  const category = categories?.find(c => Number(c.id) === Number(book.category_id))

  const inStock =
    (stock === null ||
      stock === undefined ||
      stock === '' ||
      Number(stock) > 0) &&
    Number(price) > 0

  function handleCart(e) {
    e.stopPropagation()
    if (!inStock) return
    if (inCart) {
      removeItem(bookIdStr)
    } else {
      addItem({
        bookId: bookIdStr,
        ...book,
        unitPrice: book.price ?? book.suggested_price ?? 0,
        quantity: 1,
        coverUrl: book.cover_url,
      })
      setAddedSuccessfully(true)

      setTimeout(() => {
        window.dispatchEvent(new Event('open-cart'))
      }, 300)

      setTimeout(() => {
        setAddedSuccessfully(false)
      }, 2000)
    }
  }

  function handleHeart(e) {
    e.stopPropagation()
    setLiked(v => !v)
  }

  return (
    <div
      className="book-card"
      onClick={() => inStock && navigate(`/libro/${book.id}`)}
      style={{ cursor: inStock ? 'pointer' : 'default', opacity: inStock ? 1 : 0.6 }}
    >
      <div className="book-card-cover">
        <EnrichedBookImage book={book} height="100%" borderRadius="16px 16px 0 0" />

        {category && (
          <span className="book-card-cat">{category.name}</span>
        )}

        {!inStock && (
          <span className="book-card-soldout">Agotado</span>
        )}

        <button
          className="book-card-heart"
          onClick={handleHeart}
          aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          style={{ color: liked ? '#ef4444' : undefined }}
        >
          <Heart size={16} fill={liked ? '#ef4444' : 'none'} />
        </button>
      </div>

      <div className="book-card-body">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author || 'Autor no disponible'}</p>

        {conditionClass && (
          <span className={`book-condition-badge ${conditionClass}`}>
            {conditionRaw}
          </span>
        )}

        {year && (
          <div className="book-card-meta">
            <span>{year}</span>
          </div>
        )}
      </div>

      <div className="book-card-footer">
        <div className="book-card-price-wrap">
          {price !== null && price !== undefined ? (
            <span className="book-card-price">
              {formatPrice(price)}
            </span>
          ) : (
            <span className="book-card-price-na">Precio a consultar</span>
          )}
          {price !== null && price !== undefined && (
            <span className={`price-source-badge ${book.is_fallback ? 'badge-estimado' : 'badge-verificado'}`}>
              {book.is_fallback ? 'Estimado' : 'Verificado'}
            </span>
          )}
        </div>

        <button
          className={`book-card-add${inCart ? ' remove' : ''}`}
          onClick={handleCart}
          disabled={!inStock}
          aria-label={inCart ? 'Quitar del carrito' : 'Agregar al carrito'}
          style={{
            backgroundColor: addedSuccessfully ? '#10b981' : undefined,
            borderColor: addedSuccessfully ? '#10b981' : undefined,
            transform: addedSuccessfully ? 'scale(1.2)' : undefined,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {addedSuccessfully || inCart ? <Check size={16} style={{ color: '#fff' }} /> : <ShoppingCart size={16} />}
        </button>
      </div>
    </div>
  )
}
