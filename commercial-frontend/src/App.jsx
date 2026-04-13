import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getBooks, searchBooks, getCategories, PAGE_SIZE } from './api'
import BookCard from './components/BookCard'
import BookDetail from './components/BookDetail'
import Cart from './components/Cart'
import SearchBar from './components/SearchBar'
import CatalogFilters from './components/CatalogFilters'

const SKELETON_COUNT = PAGE_SIZE

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-cover skeleton-pulse" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-pulse" style={{ width: '85%' }} />
        <div className="skeleton-line skeleton-pulse" style={{ width: '60%', marginTop: '6px' }} />
        <div className="skeleton-line skeleton-pulse" style={{ width: '40%', marginTop: '10px' }} />
      </div>
    </div>
  )
}

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Anterior
      </button>

      <span className="page-info">
        Página {page} de {totalPages}
      </span>

      <button
        className="page-btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Siguiente →
      </button>
    </div>
  )
}

function Catalogo() {
  const [books, setBooks] = useState([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ condition: '', minPrice: '', maxPrice: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = {
      page,
      limit: PAGE_SIZE,
      ...(selectedCategory ? { category_id: selectedCategory } : {}),
      ...(filters.condition ? { condition: filters.condition } : {}),
      ...(filters.minPrice ? { min_price: filters.minPrice } : {}),
      ...(filters.maxPrice ? { max_price: filters.maxPrice } : {}),
    }

    const load = searchQuery.trim()
      ? searchBooks(searchQuery, params)
      : getBooks(params)

    load
      .then(({ items, total: t }) => {
        setBooks(items)
        setTotal(t)
        setLoading(false)
      })
      .catch(() => {
        setError('Error cargando libros')
        setLoading(false)
      })
  }, [searchQuery, selectedCategory, filters, page])

  const handleSearch = (q) => {
    setSearchQuery(q)
    setPage(1)
  }

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId)
    setSearchQuery('')
    setPage(1)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const activeCatName = categories?.find(c => c.id === selectedCategory)?.name
  const hasActiveFilters = filters.condition || filters.minPrice || filters.maxPrice

  if (error) return <p className="state-container">{error}</p>

  return (
    <>
      {/* HEADER */}
      <header className="store-header">
        <div className="header-inner">
          <div className="header-logo">
            <div className="logo-icon">📚</div>
            <div>
              <div className="logo-text">BookFlow</div>
              <div className="logo-tagline">Tu librería</div>
            </div>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
          />

          {!loading && (
            <span className="header-count">
              {total} libro{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      {/* CATEGORÍAS */}
      <nav className="cat-bar">
        <div className="cat-bar-inner">
          <button
            className={`cat-chip${selectedCategory === null ? ' active' : ''}`}
            onClick={() => handleCategorySelect(null)}
          >
            Todos
          </button>

          {categories.map(c => (
            <button
              key={c.id}
              className={`cat-chip${selectedCategory === c.id ? ' active' : ''}`}
              onClick={() => handleCategorySelect(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      {/* FILTROS */}
      <div className="filters-wrap">
        <div className="filters-inner">
          <CatalogFilters filters={filters} onChange={handleFiltersChange} />
        </div>
      </div>

      {/* CONTENIDO */}
      <main className="store-main">
        <div className="section-header">
          <h2 className="section-title">
            {searchQuery.trim()
              ? `Resultados para "${searchQuery}"`
              : activeCatName
                ? activeCatName
                : 'Catálogo completo'}
          </h2>

          {!loading && (
            <span className="section-count">{total} títulos</span>
          )}
        </div>

        {loading ? (
          <div className="book-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="state-container">
            <span className="state-icon">🔍</span>
            <p className="state-title">No se encontraron libros</p>
            <p className="state-sub">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros o limpiarlos'
                : 'Intenta con otro término o navega por categorías'}
            </p>
          </div>
        ) : (
          <>
            <div className="book-grid">
              {books.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  categories={categories}
                />
              ))}
            </div>

            <Pagination
              page={page}
              total={total}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </>
        )}
      </main>

      <Cart />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/libro/:id" element={<BookDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
