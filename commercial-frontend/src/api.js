import axios from 'axios'

const BFF = import.meta.env.VITE_BFF_URL || 'http://localhost:8000'

const http = axios.create({
  baseURL: BFF,
  timeout: 15000
})

const FETCH_LIMIT = 500

export async function getBooks(params = {}) {
  try {
    const r = await http.get('/api/catalog/books', {
      params: {
        ...params,
        limit: FETCH_LIMIT
      }
    })

    const raw = r.data

    if (Array.isArray(raw)) return { items: raw, total: raw.length }
    if (raw.items) return raw

    return { items: [], total: 0 }
  } catch (error) {
    console.error('Error cargando libros desde BFF:', error)
    return { items: [], total: 0, _error: true }
  }
}

export async function searchBooks(q, params = {}) {
  try {
    const r = await http.get('/api/catalog/books', {
      params: {
        ...params,
        q,
        limit: FETCH_LIMIT
      }
    })

    const raw = r.data

    if (Array.isArray(raw)) return { items: raw, total: raw.length }
    if (raw.items) return raw

    return { items: [], total: 0 }
  } catch (error) {
    console.error('Error buscando libros:', error)
    return { items: [], total: 0 }
  }
}

export async function getBook(id) {
  try {
    const r = await http.get(`/api/catalog/books/${id}`)
    const data = r.data
    return Array.isArray(data) ? data[0] : data
  } catch (error) {
    console.error('Error consultando detalle:', error)
    return null
  }
}

export async function getCategories() {
  try {
    const r = await http.get('/api/catalog/categories')
    return Array.isArray(r.data) ? r.data : []
  } catch (error) {
    console.error('Error cargando categorías:', error)
    return []
  }
}

export const getPlaceholderUrl = (title, hexColor = '2F6F52', size = '300x450') => {
  const cleanText = (title || 'Libro')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .slice(0, 3)
    .join('+')

  return `https://placehold.co/${size}/${hexColor}/FFFFFF?text=${cleanText}&font=roboto`
}