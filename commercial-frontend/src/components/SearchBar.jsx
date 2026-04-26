import { useEffect, useState } from 'react'

export default function SearchBar({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [localValue, onChange])

  return (
    <div className="search-wrapper">
      <span>🔍</span>
      <input
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        placeholder="Buscar título, autor o ISBN..."
      />
    </div>
  )
}