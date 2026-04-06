import { useNavigate } from 'react-router-dom'

export default function BookCard({ book, categories }) {
  const navigate = useNavigate()

  // 🔥 AGREGADO
  const formatPrice = (price) => {
    return `$${price.toLocaleString('es-CO')}`
  }

  const categoryName = categories?.find(
    c => c.id === book.category_id
  )?.name

  const getCoverUrl = () => {
    const title = book.title?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || ''

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

    if (title.includes('pensar rapido') || title.includes('pensar r'))
      return 'https://images.cdn1.buscalibre.com/fit-in/360x360/ac/43/ac43444704b60dea17e32e70b454b102.jpg'

    return 'https://via.placeholder.com/200x300/1a1a2e/ffffff?text=📚'
  }

  return (
    <div
      onClick={() => navigate(`/libro/${book.id}`)}
      style={{
        borderRadius: '15px',
        overflow: 'hidden',
        background: 'white',
        boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.1)'
      }}
    >
      <img
        src={getCoverUrl()}
        alt={book.title}
        style={{
          width: '100%',
          height: '220px',
          objectFit: 'cover',
          background: '#f0f0f0'
        }}
      />

      <div style={{ padding: '15px' }}>
        <h3 style={{
          margin: '0 0 6px',
          fontSize: '15px',
          lineHeight: '1.3',
          color: '#2d2d2d'
        }}>
          {book.title}
        </h3>

        <p style={{
          color: '#555',
          margin: '0 0 5px',
          fontSize: '13px'
        }}>
          {book.author}
        </p>

        {/* 🔥 PRECIO AGREGADO */}
        <p style={{
          color: '#4caf50',
          fontWeight: 'bold',
          margin: '0 0 5px'
        }}>
          {formatPrice(book.price || 0)}
        </p>

        <p style={{
          color: '#9c27b0',
          margin: '0',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {categoryName || 'Sin categoría'}
        </p>
      </div>
    </div>
  )
}