import axios from 'axios'

const BFF = import.meta.env.VITE_BFF_URL || 'http://localhost:8009'

const http = axios.create({
  baseURL: BFF,
  timeout: 8000
})

export const PAGE_SIZE = 20

export async function getBooks(params = {}) {
  try {
    const r = await http.get('/api/catalog/books/', { params })
    // BFF may return { items, total } or plain array
    const raw = r.data
    if (Array.isArray(raw)) return { items: raw, total: raw.length }
    if (raw.items) return raw
    return { items: [], total: 0 }
  } catch {
    const filtered = applyMockFilters(MOCK_BOOKS, params)
    const page = params.page || 1
    const limit = params.limit || PAGE_SIZE
    const start = (page - 1) * limit
    return { items: filtered.slice(start, start + limit), total: filtered.length }
  }
}

export async function searchBooks(q, params = {}) {
  try {
    const r = await http.get('/api/catalog/books/', { params: { q, ...params } })
    const raw = r.data
    if (Array.isArray(raw)) return { items: raw, total: raw.length }
    if (raw.items) return raw
    return { items: [], total: 0 }
  } catch {
    const cleanQuery = q.toLowerCase().replace(/[-\s]/g, '')
    const matched = MOCK_BOOKS.filter(b => {
      const isbn = (b.isbn || '').toLowerCase().replace(/[-\s]/g, '')
      return (
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        b.author.toLowerCase().includes(q.toLowerCase()) ||
        isbn.includes(cleanQuery)
      )
    })
    const page = params.page || 1
    const limit = params.limit || PAGE_SIZE
    const start = (page - 1) * limit
    return { items: matched.slice(start, start + limit), total: matched.length }
  }
}

export async function getBook(id) {
  try {
    const r = await http.get(`/api/catalog/books/${id}`)
    const data = r.data
    return Array.isArray(data) ? data[0] : data
  } catch {
    return MOCK_BOOKS.find(b => b.id === Number(id)) || null
  }
}

export async function getCategories() {
  try {
    const r = await http.get('/api/catalog/categories/')
    return Array.isArray(r.data) ? r.data : MOCK_CATEGORIES
  } catch {
    return MOCK_CATEGORIES
  }
}

function applyMockFilters(books, params) {
  let result = [...books]
  if (params.category_id) result = result.filter(b => b.category_id === params.category_id)
  if (params.min_price) result = result.filter(b => (b.suggested_price || b.price || 0) >= Number(params.min_price))
  if (params.max_price) result = result.filter(b => (b.suggested_price || b.price || 0) <= Number(params.max_price))
  return result
}

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

export const getPlaceholderUrl = (title, hexColor, size = '200x300') => {
  const cleanText = title
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .slice(0, 3)
    .join('+');
  
  return `https://placehold.co/${size}/${hexColor}/FFFFFF?text=${cleanText}&font=roboto`;
};


const MOCK_BOOKS = [
  {
    id: 1,
    book_reference: 'REF-001',
    title: 'Cien Años de Soledad',
    author: 'Gabriel García Márquez',
    isbn: '978-0-06-088328-7',
    publisher: 'Editorial Sudamericana',
    description: 'La obra maestra del realismo mágico latinoamericano.',
    cover_url: 'https://images.cdn3.buscalibre.com/fit-in/360x360/61/8d/618d227e8967274cd9589a549adff52d.jpg',
    category_id: 1,
    published: true,
    price: 49000
  },
  {
    id: 2,
    book_reference: 'REF-002',
    title: 'El Quijote',
    author: 'Miguel de Cervantes',
    isbn: '978-84-376-0494-7',
    publisher: 'Cátedra',
    description: 'La primera novela moderna de la literatura occidental.',
    cover_url: 'https://images.cdn2.buscalibre.com/fit-in/360x360/73/b6/73b6fd96c31d26e2b6a3531808c1188c.jpg',
    category_id: 1,
    published: true,
    price: 41000
  },
  {
    id: 3,
    book_reference: 'REF-003',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0-452-28423-4',
    publisher: 'Secker & Warburg',
    description: 'Una distopía sobre el totalitarismo y la vigilancia.',
    cover_url: 'https://http2.mlstatic.com/D_NQ_NP_878597-MLA73472699954_122023-O.webp',
    category_id: 1,
    published: true,
    price: 49000
  },
  {
    id: 4,
    book_reference: 'REF-004',
    title: 'Breve Historia del Tiempo',
    author: 'Stephen Hawking',
    isbn: '978-0-553-38016-3',
    publisher: 'Bantam Books',
    description: 'Cosmología para el gran público.',
    cover_url: 'https://images.cdn2.buscalibre.com/fit-in/360x360/dc/b9/dcb9fcb5d04edddf0465a29ed4c6be6f.jpg',
    category_id: 3,
    published: true,
    price: 45000
  },
  {
    id: 5,
    book_reference: 'REF-005',
    title: 'El Arte de la Guerra',
    author: 'Sun Tzu',
    isbn: '978-0-14-044501-3',
    publisher: 'Penguin',
    description: 'Tratado militar clásico de la China antigua.',
    cover_url: 'https://www.planetadelibros.com.co/usuaris/libros/fotos/375/original/374706_portada_el-arte-de-la-guerra_antonio-francisco-rodriguez-esteban_202310231102.jpg',
    category_id: 7,
    published: true,
    price: 39900
  },
  {
    id: 6,
    book_reference: 'REF-006',
    title: 'El Aleph',
    author: 'Jorge Luis Borges',
    isbn: '978-84-206-3001-2',
    publisher: 'Alianza',
    description: 'Cuentos fantásticos y filosóficos del maestro argentino.',
    cover_url: 'https://images.cdn3.buscalibre.com/fit-in/360x360/41/a6/41a665cae10e456979c5475375eb9f2d.jpg',
    category_id: 1,
    published: true,
    price: 36190
  },
  {
    id: 7,
    book_reference: 'REF-007',
    title: 'El hombre en busca de sentido',
    author: 'Viktor E. Frankl',
    isbn: '978-84-254-5205-5',
    publisher: 'Herder Editorial',
    description: 'Hallar propósito en la adversidad extrema.',
    cover_url: 'https://images.cdn1.buscalibre.com/fit-in/360x360/92/19/9219f95b47e9354ec97aa899104f705a.jpg',
    category_id: 2,
    published: true,
    price: 61000
  },
  {
    id: 8,
    book_reference: 'REF-008',
    title: 'Habitos Atomicos',
    author: 'James Clear',
    isbn: '978-84-1119-115-7',
    publisher: 'Diana Editorial',
    description: 'Cómo crear buenos hábitos y romper los malos.',
    cover_url: 'https://images.cdn1.buscalibre.com/fit-in/360x360/92/19/9219f95b47e9354ec97aa899104f705a.jpg',
    category_id: 2,
    published: true,
    price: 33900
  },
  {
    id: 9,
    book_reference: 'REF-009',
    title: 'Cosmos',
    author: 'Carl Sagan',
    isbn: '978-84-08-05304-0',
    publisher: 'Editorial Planeta',
    description: 'Una exploración del universo y nuestra posición en él.',
    cover_url: 'https://images.cdn2.buscalibre.com/fit-in/520x520/b6/43/b64396bfa3dff8754439f8127768507c.jpg',
    category_id: 3,
    published: true,
    price: 199000
  },
  {
    id: 10,
    book_reference: 'REF-010',
    title: 'Historia del Arte',
    author: 'E.H. Gombrich',
    isbn: '978-84-206-7005-8',
    publisher: 'Alianza Editorial',
    description: 'Una exploración del universo y nuestra posición en él.',
    cover_url: 'https://0.academia-photos.com/attachment_thumbnails/104392808/mini_magick20230720-1-qdg1s.png?1689830775',
    category_id: 7,
    published: true,
    price: 44900
  },
  {
    id: 11,
    book_reference: 'REF-011',
    title: 'Sapiens: De animales a dioses',
    author: 'Yuval Noah Harari',
    isbn: '978-84-9992-421-2',
    publisher: 'Debate',
    description: 'Historia del Homo sapiens y su dominio global.',
    cover_url: 'https://imagessl8.casadellibro.com/a/l/t5/18/9788466347518.jpg',
    category_id: 4,
    published: true,
    price: 60000
  },
  {
    id: 12,
    book_reference: 'REF-012',
    title: 'Armas, gérmenes y acero',
    author: 'Jared Diamond',
    isbn: '978-84-8306-861-8',
    publisher: 'Debate',
    description: 'Por qué triunfan las civilizaciones.',
    cover_url: 'https://images.cdn2.buscalibre.com/fit-in/360x360/dc/b9/dcb9fcb5d04edddf0465a29ed4c6be6f.jpg',
    category_id: 4,
    published: true,
    price: 69000
  },
  {
    id: 13,
    book_reference: 'REF-013',
    title: 'El mundo de Sofía',
    author: 'Jostein Gaarder',
    isbn: '978-84-7844-815-9',
    publisher: 'Siruela',
    description: 'Historia de la filosofía como aventura.',
    cover_url: 'https://images.cdn3.buscalibre.com/fit-in/360x360/41/a6/41a665cae10e456979c5475375eb9f2d.jpg',
    category_id: 5,
    published: true,
    price: 56999
  },
  {
    id: 14,
    book_reference: 'REF-014',
    title: 'Meditaciones',
    author: 'Marco Aurelio',
    isbn: '978-84-1012-115-7',
    publisher: 'Editorial Reverté',
    description: 'Reflexiones estoicas.',
    cover_url: 'https://images.cdn1.buscalibre.com/fit-in/360x360/ac/43/ac43444704b60dea17e32e70b454b102.jpg',
    category_id: 5,
    published: true,
    price: 39000
  },
  {
    id: 15,
    book_reference: 'REF-015',
    title: 'Los Innovadores',
    author: 'Walter Isaacson',
    isbn: '978-84-663-5991-7',
    publisher: 'Debolsillo',
    description: 'Historia de la revolución digital.',
    cover_url: 'https://images.cdn3.buscalibre.com/fit-in/360x360/61/8d/618d227e8967274cd9589a549adff52d.jpg',
    category_id: 6,
    published: true,
    price: 54900
  },
  {
    id: 16,
    book_reference: 'REF-016',
    title: 'La era del capitalismo de la vigilancia',
    author: 'Shoshana Zuboff',
    isbn: '978-84-493-3693-5',
    publisher: 'Paidós',
    description: 'Análisis de las big tech.',
    cover_url: 'https://www.planetadelibros.com.mx/usuaris/libros/fotos/342/original/portada_la-era-del-capitalismo-de-la-vigilancia_shoshana-zuboff_202109032036.jpg',
    category_id: 6,
    published: true,
    price: 146150
  },
  {
    id: 17,
    book_reference: 'REF-017',
    title: 'Padre Rico, Padre Pobre',
    author: 'Robert T. Kiyosaki',
    isbn: '978-84-663-7300-5',
    publisher: 'Aguilar',
    description: 'Finanzas personales.',
    cover_url: 'https://m.media-amazon.com/images/I/81h9BBn4B4L._AC_UF1000,1000_QL80_.jpg',
    category_id: 8,
    published: true,
    price: 69000
  },
  {
    id: 18,
    book_reference: 'REF-018',
    title: 'Pensar rápido, pensar despacio',
    author: 'Daniel Kahneman',
    isbn: '978-84-8306-861-8',
    publisher: 'Debate',
    description: 'Psicología del pensamiento.',
    cover_url: 'https://images.cdn1.buscalibre.com/fit-in/360x360/ac/43/ac43444704b60dea17e32e70b454b102.jpg',
    category_id: 8,
    published: true,
    price: 85000
  }
]