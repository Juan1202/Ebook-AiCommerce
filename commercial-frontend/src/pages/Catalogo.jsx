import { useEffect, useMemo, useState } from 'react'
import { getBooks, getCategories } from '../api'
import BookCard from '../components/BookCard'
import CatalogFilters from '../components/CatalogFilters'
import SearchBar from '../components/SearchBar'

function getStock(book) {
  return book.stock ?? book.available_units ?? book.unidades_disponibles ?? book.units_available ?? null
}

function getCondition(book) {
  return book.condition ?? book.estado ?? book.estado_libro ?? book.book_condition ?? ''
}

export default function Catalogo() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    category_id: '',
    condition: '',
    publisher: '',
    publication_year: '',
    min_price: '',
    max_price: ''
  })

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [booksData, categoriesData] = await Promise.all([
        getBooks(),
        getCategories()
      ])

      setBooks(booksData.items || [])
      setCategories(categoriesData || [])
      setLoading(false)
    }

    load()
  }, [])

  const filteredBooks = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase()

    return books.filter(book => {
      const price = Number(book.price || book.suggested_price || 0)
      const condition = String(getCondition(book)).toLowerCase()
      const stock = getStock(book)

      if (cleanQuery) {
        const text = `
          ${book.title || ''}
          ${book.author || ''}
          ${book.isbn || ''}
          ${book.publisher || ''}
        `.toLowerCase()

        if (!text.includes(cleanQuery)) return false
      }

      if (filters.category_id && Number(book.category_id) !== Number(filters.category_id)) {
        return false
      }

      if (filters.condition) {
        if (!condition.includes(filters.condition.toLowerCase())) {
          return false
        }
      }

      if (filters.publisher && !String(book.publisher || '').toLowerCase().includes(filters.publisher.toLowerCase())) {
        return false
      }

      if (filters.publication_year && String(book.publication_year || '') !== String(filters.publication_year)) {
        return false
      }

      if (filters.min_price && price < Number(filters.min_price)) {
        return false
      }

      if (filters.max_price && price > Number(filters.max_price)) {
        return false
      }

      return true
    })
  }, [books, query, filters])

  return (
    <main className="catalog-page">
      <section className="catalog-toolbar">
        <SearchBar value={query} onChange={setQuery} />
        <span className="total-books">{filteredBooks.length} libros</span>
      </section>

      <CatalogFilters
        categories={categories}
        filters={filters}
        setFilters={setFilters}
      />

      <section className="catalog-content">
        <div className="catalog-header">
          <h1>Catálogo completo</h1>
          <span>{filteredBooks.length} títulos</span>
        </div>

        {loading && <p className="loading">Cargando catálogo...</p>}

        {!loading && filteredBooks.length === 0 && (
          <p className="empty">No se encontraron libros con los filtros seleccionados.</p>
        )}

        <div className="books-grid">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              categories={categories}
            />
          ))}
        </div>
      </section>
    </main>
  )
}