import axios from 'axios'

const BFF = import.meta.env.VITE_BFF_URL || 'http://localhost:8009'

const http = axios.create({
  baseURL: BFF,
  timeout: 5000
})

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
    const r = await http.get('/api/catalog/books/search', {
      params: { q }
    })
    return r.data
  } catch {
    // 🔥 FIX: ahora también busca por ISBN correctamente
    const cleanQuery = q.toLowerCase().replace(/[-\s]/g, '')

    return MOCK_BOOKS.filter(b => {
      const isbn = (b.isbn || '').toLowerCase().replace(/[-\s]/g, '')

      return (
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        b.author.toLowerCase().includes(q.toLowerCase()) ||
        isbn.includes(cleanQuery)
      )
    })
  }
}


export async function getBook(id) {
  try {
    const r = await http.get(`/api/catalog/books/${id}`)
    return r.data
  } catch {
    return MOCK_BOOKS.find(b => b.id === Number(id)) || null
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
    cover_url: 'https://via.placeholder.com/200x300/4A90E2/FFFFFF?text=Cien+A%C3%B1os',
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
    cover_url: 'https://via.placeholder.com/200x300/E2904A/FFFFFF?text=El+Quijote',
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
    cover_url: 'https://via.placeholder.com/200x300/4AE290/FFFFFF?text=1984',
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
    cover_url: 'https://via.placeholder.com/200x300/904AE2/FFFFFF?text=Hawking',
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
    cover_url: 'https://via.placeholder.com/200x300/E24A4A/FFFFFF?text=Sun+Tzu',
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
    cover_url: 'https://via.placeholder.com/200x300/4AE2E2/FFFFFF?text=El+Aleph',
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
    cover_url: 'https://via.placeholder.com/200x300/E67E22/FFFFFF?text=El+hombre+en+busca+de+sentido',
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
    cover_url: 'https://via.placeholder.com/200x300/D35400/FFFFFF?text=Habitos+Atomicos',
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
    cover_url: 'https://via.placeholder.com/200x300/4AE2E2/FFFFFF?text=Cosmos',
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
    cover_url: 'https://via.placeholder.com/200x300/4AE2E2/FFFFFF?text=historia+del+arte',
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
    cover_url: 'https://via.placeholder.com/200x300/4AE2E2/FFFFFF?text=sapiens',
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
    cover_url: 'https://via.placeholder.com/200x300/4AE2E2/FFFFFF?text=armas+germenes+acero',
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
    cover_url: 'https://via.placeholder.com/200x300/9B59B6/FFFFFF?text=El+mundo+de+Sofia',
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
    cover_url: 'https://via.placeholder.com/200x300/8E44AD/FFFFFF?text=Meditaciones',
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
    cover_url: 'https://via.placeholder.com/200x300/3498DB/FFFFFF?text=Los+Innovadores',
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
    cover_url: 'https://via.placeholder.com/200x300/2980B9/FFFFFF?text=Capitalismo+Vigilancia',
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
    cover_url: 'https://via.placeholder.com/200x300/27AE60/FFFFFF?text=Padre+Rico+Padre+Pobre',
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
    cover_url: 'https://via.placeholder.com/200x300/229954/FFFFFF?text=Pensar+Rapido+Despacio',
    category_id: 8,
    published: true,
    price: 85000
  }
]