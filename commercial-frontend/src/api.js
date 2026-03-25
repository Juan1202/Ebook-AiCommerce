import axios from 'axios'

const BFF = import.meta.env.VITE_BFF_URL || 'http://localhost:8009'
const http = axios.create({ baseURL: BFF, timeout: 5000 })

export async function getBooks(params = {}) {
  try {
    const r = await http.get('/api/catalog/books/', { params })
    return r.data
  } catch {
    return MOCK_BOOKS
  }
}

export async function searchBooks(q) {
  try {
    const r = await http.get('/api/catalog/books/search', { params: { q } })
    return r.data
  } catch {
    return MOCK_BOOKS.filter(b =>
      b.title.toLowerCase().includes(q.toLowerCase()) ||
      b.author.toLowerCase().includes(q.toLowerCase())
    )
  }
}

export async function getBook(id) {
  try {
    const r = await http.get(`/api/catalog/books/${id}`)
    return r.data
  } catch {
    return MOCK_BOOKS.find(b => b.id === id) || null
  }
}

export async function getCategories() {
  try {
    const r = await http.get('/api/catalog/categories/')
    return r.data
  } catch {
    return MOCK_CATEGORIES
  }
}

const MOCK_BOOKS = [
  { id: 1, book_reference: 'REF-001', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', isbn: '978-0-06-088328-7', publisher: 'Editorial Sudamericana', description: 'La obra maestra del realismo mágico latinoamericano.', cover_url: 'https://via.placeholder.com/200x300/4A90E2/FFFFFF?text=Cien+A%C3%B1os', category_id: 1, published: true },
  { id: 2, book_reference: 'REF-002', title: 'El Quijote', author: 'Miguel de Cervantes', isbn: '978-84-376-0494-7', publisher: 'Cátedra', description: 'La primera novela moderna de la literatura occidental.', cover_url: 'https://via.placeholder.com/200x300/E2904A/FFFFFF?text=El+Quijote', category_id: 1, published: true },
  { id: 3, book_reference: 'REF-003', title: '1984', author: 'George Orwell', isbn: '978-0-452-28423-4', publisher: 'Secker & Warburg', description: 'Una distopía sobre el totalitarismo y la vigilancia.', cover_url: 'https://via.placeholder.com/200x300/4AE290/FFFFFF?text=1984', category_id: 1, published: true },
  { id: 4, book_reference: 'REF-004', title: 'Breve Historia del Tiempo', author: 'Stephen Hawking', isbn: '978-0-553-38016-3', publisher: 'Bantam Books', description: 'Cosmología para el gran público.', cover_url: 'https://via.placeholder.com/200x300/904AE2/FFFFFF?text=Hawking', category_id: 3, published: true },
  { id: 5, book_reference: 'REF-005', title: 'El Arte de la Guerra', author: 'Sun Tzu', isbn: '978-0-14-044501-3', publisher: 'Penguin', description: 'Tratado militar clásico de la China antigua.', cover_url: 'https://via.placeholder.com/200x300/E24A4A/FFFFFF?text=Sun+Tzu', category_id: 7, published: true },
  { id: 6, book_reference: 'REF-006', title: 'El Aleph', author: 'Jorge Luis Borges', isbn: '978-84-206-3001-2', publisher: 'Alianza', description: 'Cuentos fantásticos y filosóficos del maestro argentino.', cover_url: 'https://via.placeholder.com/200x300/4AE2E2/FFFFFF?text=El+Aleph', category_id: 1, published: true },
]

const MOCK_CATEGORIES = [
  { id: 1, name: 'Ficción' },
  { id: 2, name: 'No Ficción' },
  { id: 3, name: 'Ciencia' },
  { id: 4, name: 'Historia' },
  { id: 5, name: 'Filosofía' },
  { id: 6, name: 'Tecnología' },
  { id: 7, name: 'Arte' },
  { id: 8, name: 'Economía' },
]
