import { useNavigate } from 'react-router-dom'
import EnrichedBookImage from './EnrichedBookImage'
import PriceBadge from './PriceBadge'
import AvailabilityBadge from './AvailabilityBadge'

export default function BookCard({ book, categories }) {
  const navigate = useNavigate()

  const category = categories?.find(
    c => Number(c.id) === Number(book.category_id)
  )

  const categoryName = category?.name || 'Sin categoría'

  const inStock =
    book.stock === undefined ||
    book.stock === null ||
    Number(book.stock) > 0

  return (
    <div
      className="book-card"
      onClick={() => inStock && navigate(`/libro/${book.id}`)}
      style={{
        cursor: inStock ? 'pointer' : 'default',
        opacity: inStock ? 1 : 0.7
      }}
      onMouseEnter={e => {
        if (inStock) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      <div className="book-card-cover">
        <EnrichedBookImage book={book} height={220} borderRadius="0" />

        {categoryName && (
          <span className="book-card-cat">{categoryName}</span>
        )}
      </div>

      <div className="book-card-body">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">
          {book.author || 'Autor no disponible'}
        </p>

        <PriceBadge book={book} size="md" />

        {book.stock !== undefined && book.stock !== null && (
          <div style={{ marginTop: '6px' }}>
            <AvailabilityBadge stock={book.stock} />
          </div>
        )}
      </div>
    </div>
  )
}