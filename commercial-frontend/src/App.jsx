import { useState, useEffect } from 'react'
import { getBooks, searchBooks, getCategories } from './api'
import BookCard from './components/BookCard'
import BookDetail from './components/BookDetail'

export default function App() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    const load = searchQuery.trim()
      ? searchBooks(searchQuery)
      : getBooks(selectedCategory ? { category_id: selectedCategory } : {})
    load.then(data => { setBooks(data); setLoading(false) })
  }, [searchQuery, selectedCategory])

  if (selectedBook) {
    return <BookDetail book={selectedBook} onBack={() => setSelectedBook(null)} />
  }

  const filtered = selectedCategory && !searchQuery.trim()
    ? books.filter(b => b.category_id === selectedCategory)
    : books

  const activeCatName = categories.find(c => c.id === selectedCategory)?.name

  return (
    <>
      {/* ── Header ──────────────────────────────── */}
      <header className="store-header">
        <div className="header-inner">
          <a className="header-logo" href="#">
            <div className="logo-icon">📚</div>
            <div>
              <div className="logo-text">BookFlow</div>
              <div className="logo-tagline">Tu librería</div>
            </div>
          </a>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Buscar título, autor o ISBN..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSelectedCategory(null) }}
            />
          </div>

          {!loading && (
            <span className="header-count">{filtered.length} libro{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </header>

      {/* ── Category chips ─────────────────────── */}
      <nav className="cat-bar">
        <div className="cat-bar-inner">
          <button
            className={`cat-chip${selectedCategory === null ? ' active' : ''}`}
            onClick={() => { setSelectedCategory(null); setSearchQuery('') }}
          >
            Todos
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`cat-chip${selectedCategory === c.id ? ' active' : ''}`}
              onClick={() => { setSelectedCategory(c.id); setSearchQuery('') }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main content ────────────────────────── */}
      <main className="store-main">
        <div className="section-header">
          <h2 className="section-title">
            {searchQuery.trim()
              ? `Resultados para "${searchQuery}"`
              : activeCatName
                ? activeCatName
                : 'Catálogo completo'}
          </h2>
          {!loading && <span className="section-count">{filtered.length} títulos</span>}
        </div>

        {loading ? (
          <div className="state-container">
            <span className="state-icon">⏳</span>
            <p className="state-title">Cargando catálogo...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="state-container">
            <span className="state-icon">🔍</span>
            <p className="state-title">No se encontraron libros</p>
            <p className="state-sub">Intenta con otro término o navega por categorías</p>
          </div>
        ) : (
          <div className="book-grid">
            {filtered.map(book => (
              <BookCard key={book.id} book={book} onClick={setSelectedBook} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
