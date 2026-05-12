import { useEffect, useState } from 'react'
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getBooks, getCategories } from '../api'
import { getRecommendations } from '../services/recommendationService'
import BookCard from '../components/BookCard'

const SEED_COUNT = 6

export default function IAPicks() {
  const [picks, setPicks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [booksData, cats] = await Promise.all([getBooks(), getCategories()])
        setCategories(cats || [])

        const allBooks = booksData.items || []
        const seeds = allBooks.slice(0, SEED_COUNT)
        const recommendedIds = new Set()
        const recBooks = []

        const recResults = await Promise.allSettled(
          seeds.map(b => getRecommendations(b.id))
        )

        for (const result of recResults) {
          if (result.status !== 'fulfilled') continue
          for (const rec of result.value || []) {
            const id = rec.book_id ?? rec.id
            if (id && !recommendedIds.has(id)) {
              recommendedIds.add(id)
              const full = allBooks.find(b => String(b.id) === String(id))
              if (full) recBooks.push(full)
            }
          }
        }

        if (recBooks.length === 0) {
          const shuffled = [...allBooks].sort(() => Math.random() - 0.5)
          setPicks(shuffled.slice(0, 12))
        } else {
          setPicks(recBooks.slice(0, 24))
        }
      } catch (err) {
        setError('No se pudieron cargar las recomendaciones.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="ia-picks-page">
      <div className="ia-picks-hero">
        <div className="ia-picks-hero-inner">
          <div className="ia-picks-badge">
            <Sparkles size={14} />
            Inteligencia Artificial
          </div>
          <h1 className="ia-picks-title">IA Picks</h1>
          <p className="ia-picks-subtitle">
            Libros seleccionados por nuestra IA basándose en tendencias de lectura y popularidad del catálogo.
          </p>
          <Link to="/" className="ia-picks-back">
            <ArrowLeft size={14} />
            Volver al catálogo
          </Link>
        </div>
      </div>

      <div className="ia-picks-content">
        {loading && (
          <div className="ia-picks-loading">
            <Loader2 size={28} className="spin" />
            <span>Analizando catálogo con IA…</span>
          </div>
        )}

        {!loading && error && (
          <div className="ia-picks-error">{error}</div>
        )}

        {!loading && !error && (
          <>
            <p className="ia-picks-count">{picks.length} recomendaciones</p>
            <div className="books-grid">
              {picks.map(book => (
                <BookCard key={book.id} book={book} categories={categories} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
