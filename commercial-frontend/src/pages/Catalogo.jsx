import PropTypes from 'prop-types'
import { useEffect, useMemo, useState } from 'react'
import { getBooks, getCategories } from '../api'
import BookCard from '../components/BookCard'

const DEFAULT_FILTERS = { condition: '', min_price: '', max_price: '' }

const SKELETON_IDS = ['s0','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11']

function getCondition(book) {
  return book.condition ?? book.estado ?? book.estado_libro ?? book.book_condition ?? ''
}

function bookMatchesFilters(book, cleanQuery, activeCat, filters) {
  const price = Number(book.price || book.suggested_price || 0)
  const condition = String(getCondition(book)).toLowerCase()

  if (cleanQuery) {
    const text = `${book.title || ''} ${book.author || ''} ${book.isbn || ''} ${book.publisher || ''}`.toLowerCase()
    if (!text.includes(cleanQuery)) return false
  }

  if (activeCat && Number(book.category_id) !== Number(activeCat)) return false
  if (filters.condition && !condition.includes(filters.condition.toLowerCase())) return false
  if (filters.min_price && price < Number(filters.min_price)) return false
  if (filters.max_price && price > Number(filters.max_price)) return false

  return true
}

function getSectionTitle(activeCat, categories, searchQuery) {
  if (activeCat) return categories.find(c => String(c.id) === activeCat)?.name ?? 'Categoría'
  if (searchQuery) return `Resultados para "${searchQuery}"`
  return 'Catálogo completo'
}

export default function Catalogo({ searchQuery }) {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCat, setActiveCat] = useState('')
  const [loading, setLoading] = useState(true)
  const [serviceError, setServiceError] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setServiceError(false)
      try {
        const [booksData, categoriesData] = await Promise.all([
          getBooks(),
          getCategories()
        ])
        if (booksData.items?.length === 0 && booksData._error) {
          setServiceError(true)
        }
        setBooks(booksData.items || [])
        setCategories(categoriesData || [])
      } catch {
        setServiceError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredBooks = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase()
    return books.filter(book => bookMatchesFilters(book, cleanQuery, activeCat, DEFAULT_FILTERS))
  }, [books, searchQuery, activeCat])

  const sectionTitle = getSectionTitle(activeCat, categories, searchQuery)

  return (
    <>
      {!searchQuery && (
        <section className="hero">
          <h1 className="hero-title">Descubre tu próxima lectura</h1>
          <p className="hero-sub">Más de {books.length || '…'} títulos disponibles · Envío a todo el país</p>
        </section>
      )}

      <div className="cat-bar">
        <div className="cat-bar-inner">
          <button
            className={`cat-chip${activeCat === '' ? ' active' : ''}`}
            onClick={() => setActiveCat('')}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`cat-chip${activeCat === String(cat.id) ? ' active' : ''}`}
              onClick={() => setActiveCat(activeCat === String(cat.id) ? '' : String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <main className="store-main">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle}</h2>
          <span className="section-count">{filteredBooks.length} títulos</span>
        </div>

        {loading && (
          <div className="book-grid">
            {SKELETON_IDS.map(id => (
              <div key={id} className="book-skeleton" />
            ))}
          </div>
        )}

        {!loading && serviceError && (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <p className="empty-text">El catálogo no está disponible</p>
            <p className="empty-sub">No se pudo conectar con el servicio. Intenta recargar la página.</p>
          </div>
        )}

        {!loading && !serviceError && filteredBooks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p className="empty-text">No se encontraron libros</p>
            <p className="empty-sub">Intenta con otros filtros o términos de búsqueda</p>
          </div>
        )}

        {!loading && !serviceError && filteredBooks.length > 0 && (
          <div className="book-grid">
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} categories={categories} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}

Catalogo.propTypes = {
  searchQuery: PropTypes.string
}

Catalogo.defaultProps = {
  searchQuery: ''
}
