import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Catalogo from './pages/Catalogo'
import BookDetail from './components/BookDetail'
import Cart from './components/Cart'
import { getCartCount } from './cart'
import './index.css'

function Header() {
  const [count, setCount] = useState(getCartCount())

  useEffect(() => {
    const update = () => setCount(getCartCount())
    window.addEventListener('cart-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('cart-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return (
    <header className="app-header">
      <Link to="/" className="brand">
        <div className="brand-icon">📚</div>
        <div>
          <strong>BookFlow</strong>
          <span>TU LIBRERÍA</span>
        </div>
      </Link>

      <Link to="/carrito" className="cart-link">
        🛒 Carrito
        {count > 0 && <span>{count}</span>}
      </Link>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/libro/:id" element={<BookDetail />} />
        <Route path="/carrito" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  )
}