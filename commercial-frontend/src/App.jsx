import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Catalogo from './pages/Catalogo'
import BookDetail from './components/BookDetail'
import Cart from './components/Cart'
import { getCartCount } from './cart'
import './index.css'

function Header({ searchQuery, onSearchChange }) {
  const [count, setCount] = useState(getCartCount())

  useEffect(() => {
    const update = () => setCount(getCartCount())
    globalThis.addEventListener('cart-updated', update)
    globalThis.addEventListener('storage', update)
    return () => {
      globalThis.removeEventListener('cart-updated', update)
      globalThis.removeEventListener('storage', update)
    }
  }, [])

  return (
    <header className="store-header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <div className="logo-icon">📚</div>
          <div>
            <div className="logo-text">BookFlow</div>
            <div className="logo-tagline">Tu librería</div>
          </div>
        </Link>

        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por título, autor, ISBN…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="header-admin-btn"
          >
            Panel Admin →
          </a>

          <Link to="/carrito" className="cart-btn">
            🛒
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <BrowserRouter>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <Routes>
        <Route path="/" element={<Catalogo searchQuery={searchQuery} />} />
        <Route path="/libro/:id" element={<BookDetail />} />
        <Route path="/carrito" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  )
}
