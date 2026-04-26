import { useNavigate } from 'react-router-dom'
import EnrichedBookImage from './EnrichedBookImage'
import PriceBadge from './PriceBadge'
import AvailabilityBadge from './AvailabilityBadge'

function getStock(book) {
  return book.stock ?? book.available_units ?? book.unidades_disponibles ?? book.units_available ?? null
}

function getCondition(book) {
  return book.condition ?? book.estado ?? book.estado_libro ?? book.book_condition ?? null
}

export default function BookCard({ book, categories }) {
  const navigate = useNavigate()

  const category = categories?.find(
    c => Number(c.id) === Number(book.category_id)
  )

  const stock = getStock(book)
  const condition = getCondition(book)

  const inStock =
    stock === null ||
    stock === undefined ||
    stock === '' ||
    Number(stock) > 0

  return (
    <div
      className="book-card"
      onClick={() => inStock && navigate(`/libro/${book.id}`)}
      style={{
        cursor: inStock ? 'pointer' : 'default',
        opacity: inStock ? 1 : 0.65
      }}
    >
      <div className="book-card-cover">
        <EnrichedBookImage book={book} height={220} borderRadius="0" />

        <span className="book-card-cat">
          {category?.name || 'Sin categoría'}
        </span>

        {!inStock && (
          <span className="book-card-soldout">Agotado</span>
        )}
      </div>

      <div className="book-card-body">
        <h3 className="book-card-title">{book.title}</h3>

        <p className="book-card-author">
          {book.author || 'Autor no disponible'}
        </p>

        {condition && (
          <p className="book-condition">
            Estado: {condition}
          </p>
        )}

        <PriceBadge book={book} size="md" />

        <div style={{ marginTop: '8px' }}>
          <AvailabilityBadge stock={stock} />
        </div>
      </div>
    </div>
  )
}