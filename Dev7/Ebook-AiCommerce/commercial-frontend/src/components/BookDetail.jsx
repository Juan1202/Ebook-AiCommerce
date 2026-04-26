import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getBook } from '../api'
import { addToCart } from '../cart' 

const CATEGORY_NAMES = {
  1: 'Ficción',
  2: 'No Ficción',
  3: 'Ciencia',
  4: 'Historia',
  5: 'Filosofía',
  6: 'Tecnología',
  7: 'Arte',
  8: 'Economía',
}

// 🔹 Función para formatear precio
const formatPrice = (price) => {
  return `$${price?.toLocaleString('es-CO') || 0}`
}

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchase, setPurchase] = useState(null) // 🔹 Estado para la compra

  useEffect(() => {
    getBook(id)
      .then(data => {
        const result = Array.isArray(data) ? data[0] : data
        setBook(result)
        setLoading(false)
      })
      .catch(() => {
        setBook(null)
        setLoading(false)
      })
  }, [id])

  const getCoverUrl = () => {
    const title = book?.title?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || ''

    if (title.includes('cien anos') || title.includes('cien a'))
      return 'https://images.cdn3.buscalibre.com/fit-in/360x360/61/8d/618d227e8967274cd9589a549adff52d.jpg'
    if (title.includes('quijote'))
      return 'https://images.cdn2.buscalibre.com/fit-in/360x360/73/b6/73b6fd96c31d26e2b6a3531808c1188c.jpg'
    if (title.includes('1984'))
      return 'https://http2.mlstatic.com/D_NQ_NP_878597-MLA73472699954_122023-O.webp'
    if (title.includes('breve historia'))
      return 'https://images.cdn2.buscalibre.com/fit-in/360x360/dc/b9/dcb9fcb5d04edddf0465a29ed4c6be6f.jpg'
    if (title.includes('arte de la guerra'))
      return 'https://www.planetadelibros.com.co/usuaris/libros/fotos/375/original/374706_portada_el-arte-de-la-guerra_antonio-francisco-rodriguez-esteban_202310231102.jpg'
    if (title.includes('aleph'))
      return 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTdWlrb6eO4SKW-iXbqQ4s2oL8vdnqTDoib6jygamOu0cP10emTKRpjVVf5f6VJMYeVLtqhOfb6hzUvgr3GYnYD0gEM6ORfdef4d6hDezg1r_HUOxJRe_0M'
    if (title.includes('hombre en busca de sentido'))
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR46B5rvqerPLjiRoCDJyqL1q516wFhZ-5s2dqjsI0JybFyJ0jpCmLXDUdkRQz0JIJLm0OGF9EC5DXrBJspvboYsJ0sy68RmdOcKE_tLsc&s=10'
    if (title.includes('habitos atomicos'))
      return 'https://images.cdn1.buscalibre.com/fit-in/360x360/92/19/9219f95b47e9354ec97aa899104f705a.jpg'
    if (title.includes('cosmos'))
      return 'https://images.cdn2.buscalibre.com/fit-in/520x520/b6/43/b64396bfa3dff8754439f8127768507c.jpg'
    if (title.includes('historia del arte'))
      return 'https://0.academia-photos.com/attachment_thumbnails/104392808/mini_magick20230720-1-qdg1s.png?1689830775'
    if (title.includes('sapiens'))
      return 'https://imagessl8.casadellibro.com/a/l/t5/18/9788466347518.jpg'
    if (title.includes('armas') && title.includes('germenes'))
      return 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRo_xiZFMV2acc143aJoICIi8DDr3GWHEL2DZt1crHqVfaRXmKJ1kU6EZwe-jyHfQRn-slXYU0o48C7tvilOeZckMSeUfCdHTUGEg2-izc'
    if (title.includes('mundo de sofia'))
      return 'https://images.cdn3.buscalibre.com/fit-in/360x360/41/a6/41a665cae10e456979c5475375eb9f2d.jpg'
    if (title.includes('meditaciones'))
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf2YSCiSlNKR1OHyls1eh8_m168VGNlTxhYJJB1I6hqmiUBf3b6VgY5lhzZgMK0VkxtFLZUbFiPIUXaoqBAMxpNXEo6RFPnL4jv-BxKQ&s=10'
    if (title.includes('los innovadores'))
      return 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQtxzHS7sf9olbDpPFdNwMa1tozSp48ted6kEVWCH0ReUceyoX3'
    if (title.includes('capitalismo') && title.includes('vigilancia'))
      return 'https://www.planetadelibros.com.mx/usuaris/libros/fotos/342/original/portada_la-era-del-capitalismo-de-la-vigilancia_shoshana-zuboff_202109032036.jpg'
    if (title.includes('padre rico'))
      return 'https://m.media-amazon.com/images/I/81h9BBn4B4L._AC_UF1000,1000_QL80_.jpg'
    if (title.includes('pensar rapido'))
      return 'https://images.cdn1.buscalibre.com/fit-in/360x360/ac/43/ac43444704b60dea17e32e70b454b102.jpg'

    return 'https://via.placeholder.com/200x300/1a1a2e/ffffff?text=📚'
  }

  if (loading) return <p style={{ padding: '20px' }}>Cargando...</p>
  if (!book) return <p style={{ padding: '20px' }}>No se encontró el libro</p>

  const category = CATEGORY_NAMES[book.category_id]

  return (
    <div className="detail-page">

      <header className="store-header">
        <div className="header-inner">
          <div
            className="header-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <div className="logo-icon">📚</div>
            <div>
              <div className="logo-text">BookFlow</div>
              <div className="logo-tagline">Tu librería</div>
            </div>
          </div>
        </div>
      </header>

      <div className="detail-breadcrumb">
        <button
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← Volver al catálogo
        </button>
      </div>

      <div className="detail-body">

        <aside className="detail-cover-wrap">
          <img
            className="detail-cover"
            src={getCoverUrl()}
            alt={book.title}
            style={{
              width: '260px',
              borderRadius: '10px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}
          />
        </aside>

        <main className="detail-info">

          {category && (
            <span className="detail-category">
              {category}
            </span>
          )}

          <h1 className="detail-title">{book.title}</h1>

          {book.subtitle && (
            <p style={{
              fontSize: '1rem',
              color: '#777',
              fontStyle: 'italic'
            }}>
              {book.subtitle}
            </p>
          )}

          <p className="detail-author">
            por <strong>{book.author}</strong>
          </p>

          {/* 🔹 PRECIO */}
          <p style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#4caf50',
            marginTop: '10px'
          }}>
            {formatPrice(book.price)}
          </p>

          <div className="detail-divider" />

          <div className="detail-meta-grid">
            {book.publisher && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Editorial</span>
                <span className="detail-meta-value">{book.publisher}</span>
              </div>
            )}

            {book.publication_year && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Año</span>
                <span className="detail-meta-value">{book.publication_year}</span>
              </div>
            )}

            {book.isbn && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">ISBN</span>
                <span className="detail-meta-value">{book.isbn}</span>
              </div>
            )}
          </div>

          {book.description && (
            <>
              <div className="detail-divider" />
              <p className="detail-description">{book.description}</p>
            </>
          )}

          <div className="detail-available-badge">
            ✓ Disponible en tienda
          </div>

          {/* 🛒 BOTÓN COMPRA */}
          <button
            onClick={() => {
              addToCart(book)
              setPurchase({
                title: book.title,
                price: formatPrice(book.price),
                quantity: 1
              })
            }}
            style={{
              marginTop: '15px',
              padding: '12px 20px',
              background: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Comprar ahora 🛒
          </button>

          {/* 🔹 PANEL DE COMPRA */}
          {purchase && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              border: '2px solid #9c27b0',
              borderRadius: '10px',
              backgroundColor: '#f3e5f5',
              color: '#4a148c'
            }}>
              <h3>✅ Compra realizada</h3>
              <p><strong>Libro:</strong> {purchase.title}</p>
              <p><strong>Precio:</strong> {purchase.price}</p>
              <p><strong>Cantidad:</strong> {purchase.quantity}</p>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
