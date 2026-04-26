import { useState, useEffect } from 'react'
import { getBooks, searchBooks, getCategories } from './api'
import BookCard from './components/BookCard'

export default function Catalogo() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCategories().then(setCategories)
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
        setError("Error al cargar el catálogo")
        setLoading(false)
      })
  }, [searchQuery, selectedCategory])

  const filtered = selectedCategory && !searchQuery.trim()
    ? books.filter(b => b.category_id === selectedCategory)
    : books

  const activeCatName = categories.find(c => c.id === selectedCategory)?.name

  if (error) {
    return <p>{error}</p>
  }

  return (
    <>
      <header className="store-header">
        <h1>BookFlow</h1>
        <input
          type="text"
          placeholder="Buscar libro..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
            setSelectedCategory(null)
          }}
        />
      </header>

      <div>
        <button onClick={() => setSelectedCategory(null)}>Todos</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => {
            setSelectedCategory(c.id)
            setSearchQuery('')
          }}>
            {c.name}
          </button>
        ))}
      </div>

      <h2>
        {searchQuery
          ? `Resultados para "${searchQuery}"`
          : activeCatName || 'Catálogo completo'}
      </h2>

      {loading ? (
        <p>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p>No hay libros</p>
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
    </>
  )
}