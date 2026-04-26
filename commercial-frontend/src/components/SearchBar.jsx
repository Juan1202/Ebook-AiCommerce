import { useState, useEffect } from 'react'

const DEBOUNCE_MS = 350

export default function SearchBar({ value, onChange, placeholder = 'Buscar título, autor o ISBN...' }) {
  const [local, setLocal] = useState(value)

  // Sync if parent resets value (e.g. on category click)
  useEffect(() => { setLocal(value) }, [value])

  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local)
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [local]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="search-wrap">
      <span className="search-icon">🔍</span>
      <input
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={local}
        onChange={e => setLocal(e.target.value)}
      />
      {local && (
        <button
          className="search-clear"
          onClick={() => { setLocal(''); onChange('') }}
          aria-label="Limpiar búsqueda"
        >
          ✕
        </button>
      )}
    </div>
  )
}
