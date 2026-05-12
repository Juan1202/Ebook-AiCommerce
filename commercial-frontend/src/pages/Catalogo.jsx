import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, PackageOpen, SlidersHorizontal, Sparkles } from 'lucide-react'
import { getBooks, getCategories } from '../api'
import BookCard from '../components/BookCard'
import { Checkbox } from '../components/ui'

const COND_OPTIONS = ['Nuevo', 'Bueno', 'Aceptable', 'Deteriorado']
const DISPLAY_PAGE_SIZE = 20

const SORT_OPTIONS = [
  { value: 'default', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio ↑' },
  { value: 'price_desc', label: 'Precio ↓' },
  { value: 'year_desc', label: 'Recientes' },
]

const SKELETON_IDS = ['s0','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11']

function getCondition(book) {
  return book.condition ?? book.estado ?? book.estado_libro ?? book.book_condition ?? ''
}

function SortPill({ value, label, active, onClick }) {
  return (
    <button
      className={`sort-pill${active ? ' active' : ''}`}
      onClick={() => onClick(value)}
    >
      {label}
    </button>
  )
}

function bookMatchesFilters(book, cleanQuery, cats, conds, maxPrice, publisher, year) {
  const price = Number(book.price || book.suggested_price || 0)
  const condition = String(getCondition(book)).toLowerCase()

  if (cleanQuery) {
    const text = `${book.title || ''} ${book.author || ''} ${book.isbn || ''} ${book.publisher || ''}`.toLowerCase()
    if (!text.includes(cleanQuery)) return false
  }

  const activeCats = Object.keys(cats).filter(id => cats[id])
  if (activeCats.length > 0 && !activeCats.some(id => Number(book.category_id) === Number(id))) return false

  const activeConds = Object.keys(conds).filter(k => conds[k])
  if (activeConds.length > 0 && !activeConds.some(c => condition.includes(c.toLowerCase()))) return false

  if (maxPrice && price > Number(maxPrice)) return false

  if (publisher) {
    const pub = (book.publisher || '').toLowerCase()
    if (!pub.includes(publisher.toLowerCase())) return false
  }

  if (year) {
    const bookYear = String(book.publication_year || book.year || '')
    if (!bookYear.startsWith(year)) return false
  }

  return true
}

function sortBooks(books, sort) {
  if (sort === 'price_asc') return [...books].sort((a, b) => Number(a.price || a.suggested_price || 0) - Number(b.price || b.suggested_price || 0))
  if (sort === 'price_desc') return [...books].sort((a, b) => Number(b.price || b.suggested_price || 0) - Number(a.price || a.suggested_price || 0))
  if (sort === 'year_desc') return [...books].sort((a, b) => Number(b.publication_year || b.year || 0) - Number(a.publication_year || a.year || 0))
  return books
}

function getSectionTitle(cats, categories, searchQuery) {
  const activeCats = Object.keys(cats).filter(id => cats[id])
  if (activeCats.length === 1) return categories.find(c => String(c.id) === activeCats[0])?.name ?? 'Categoría'
  if (activeCats.length > 1) return 'Varias categorías'
  if (searchQuery) return `Resultados para "${searchQuery}"`
  return 'Catálogo completo'
}

export default function Catalogo({ searchQuery = '' }) {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [cats, setCats] = useState({})
  const [conds, setConds] = useState({})
  const [maxPrice, setMaxPrice] = useState('')
  const [publisher, setPublisher] = useState('')
  const [year, setYear] = useState('')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [serviceError, setServiceError] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setServiceError(false)
      try {
        const [booksData, categoriesData] = await Promise.all([getBooks(), getCategories()])
        if (booksData.items?.length === 0 && booksData._error) setServiceError(true)
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
    const filtered = books.filter(book => bookMatchesFilters(book, cleanQuery, cats, conds, maxPrice, publisher, year))
    return sortBooks(filtered, sort)
  }, [books, searchQuery, cats, conds, maxPrice, publisher, year, sort])

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / DISPLAY_PAGE_SIZE))
  const pagedBooks = filteredBooks.slice((page - 1) * DISPLAY_PAGE_SIZE, page * DISPLAY_PAGE_SIZE)

  const sectionTitle = getSectionTitle(cats, categories, searchQuery)

  const allPrices = books.map(b => Number(b.price || b.suggested_price || 0)).filter(p => p > 0)
  const priceMax = allPrices.length ? Math.ceil(Math.max(...allPrices)) : 200

  function toggleCat(id) {
    setPage(1)
    setCats(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleCond(label) {
    setPage(1)
    setConds(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <>
      {!searchQuery && (
        <section className="hero">
          <h1 className="hero-title">Descubre tu próxima lectura</h1>
          <p className="hero-sub">Más de {books.length || '…'} títulos disponibles · Envío a todo el país</p>
        </section>
      )}

      <div className="catalog-wrap">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">
              <SlidersHorizontal size={14} />
              Categorías
            </div>
            <ul className="sidebar-filter-list">
              {categories.map(cat => (
                <li key={cat.id} className="sidebar-filter-item">
                  <label className="sidebar-filter-label">
                    <Checkbox
                      checked={!!cats[cat.id]}
                      onChange={() => toggleCat(String(cat.id))}
                    />
                    {cat.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Condición</div>
            <ul className="sidebar-filter-list">
              {COND_OPTIONS.map(label => (
                <li key={label} className="sidebar-filter-item">
                  <label className="sidebar-filter-label">
                    <Checkbox
                      checked={!!conds[label]}
                      onChange={() => toggleCond(label)}
                    />
                    {label}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Editorial</div>
            <input
              className="sidebar-text-input"
              type="text"
              placeholder="Filtrar por editorial…"
              value={publisher}
              onChange={e => { setPublisher(e.target.value); setPage(1) }}
            />
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Año de publicación</div>
            <input
              className="sidebar-text-input"
              type="number"
              placeholder="Ej: 2020"
              value={year}
              onChange={e => { setYear(e.target.value); setPage(1) }}
            />
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Precio máximo</div>
            <div className="sidebar-price-row">
              <span className="sidebar-price-label">hasta</span>
              <span className="sidebar-price-value">
                {maxPrice ? `$${Number(maxPrice).toFixed(0)}` : 'cualquiera'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={priceMax}
              step={1}
              value={maxPrice || priceMax}
              onChange={e => setMaxPrice(e.target.value === String(priceMax) ? '' : e.target.value)}
              className="sidebar-price-range"
            />
          </div>

          <div className="sidebar-ai-card">
            <div className="sidebar-ai-title">
              <Sparkles size={14} />
              Recomendaciones IA
            </div>
            <p className="sidebar-ai-desc">Descubre libros seleccionados para ti según tus preferencias.</p>
            <button className="sidebar-ai-btn" onClick={() => navigate('/ia-picks')}>Explorar</button>
          </div>
        </aside>

        <main className="store-main">
          <div className="section-header">
            <h2 className="section-title">{sectionTitle}</h2>
            <span className="section-count">{filteredBooks.length} títulos</span>
          </div>

          <div className="sort-pills">
            {SORT_OPTIONS.map(opt => (
              <SortPill
                key={opt.value}
                value={opt.value}
                label={opt.label}
                active={sort === opt.value}
                onClick={setSort}
              />
            ))}
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
              <div className="empty-icon"><AlertTriangle size={40} /></div>
              <p className="empty-text">El catálogo no está disponible</p>
              <p className="empty-sub">No se pudo conectar con el servicio. Intenta recargar la página.</p>
            </div>
          )}

          {!loading && !serviceError && filteredBooks.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon"><PackageOpen size={40} /></div>
              <p className="empty-text">No se encontraron libros</p>
              <p className="empty-sub">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          )}

          {!loading && !serviceError && filteredBooks.length > 0 && (
            <>
              <div className="book-grid">
                {pagedBooks.map(book => (
                  <BookCard key={book.id} book={book} categories={categories} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Anterior
                  </button>
                  <span className="page-info">Página {page} de {totalPages}</span>
                  <button
                    className="page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  )
}
