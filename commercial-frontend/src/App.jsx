import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getBooks, searchBooks, getCategories } from './api'
import BookCard from './components/BookCard'
import BookDetail from './components/BookDetail'
import Cart from './components/Cart'

function Catalogo() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
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

    const load = searchQuery.trim()
      ? searchBooks(searchQuery)
      : getBooks(selectedCategory ? { category_id: selectedCategory } : {})

    load
      .then(data => {
        setBooks(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Error cargando libros")
        setLoading(false)
      })
  }, [searchQuery, selectedCategory])

  const filtered = selectedCategory && !searchQuery.trim()
    ? books.filter(b => b.category_id === selectedCategory)
    : books

  const activeCatName = categories?.find(
    c => c.id === selectedCategory
  )?.name

  if (error) {
    return <p>{error}</p>
  }

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

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Buscar título, autor o ISBN..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setSelectedCategory(null)
              }}
            />
          </div>

          {!loading && (
            <span className="header-count">
              {filtered.length} libro{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      {/* CATEGORÍAS */}
      <nav className="cat-bar">
        <div className="cat-bar-inner">
          <button
            className={`cat-chip${selectedCategory === null ? ' active' : ''}`}
            onClick={() => {
              setSelectedCategory(null)
              setSearchQuery('')
            }}
          >
            Todos
          </button>

          {categories.map(c => (
            <button
              key={c.id}
              className={`cat-chip${selectedCategory === c.id ? ' active' : ''}`}
              onClick={() => {
                setSelectedCategory(c.id)
                setSearchQuery('')
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

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
            <span className="section-count">
              {filtered.length} títulos
            </span>
          )}
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
            <p className="state-sub">
              Intenta con otro término o navega por categorías
            </p>
          </div>
        ) : (
          <div className="book-grid">
            {filtered.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                categories={categories}
              />
            ))}
          </div>
        )}
      </main>

      {/* 🛒 CARRITO AGREGADO */}
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