import { useEffect, useState } from 'react'
import { getInventory, checkAvailability } from '../api'

const CONDITION_BADGE = {
  new:       { label: 'Nuevo',     cls: 'badge-success' },
  like_new:  { label: 'Como nuevo',cls: 'badge-info'    },
  good:      { label: 'Bueno',     cls: 'badge-info'    },
  acceptable:{ label: 'Aceptable', cls: 'badge-warning' },
  poor:      { label: 'Deteriorado',cls: 'badge-danger' },
}

export default function InventoryPanel() {
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [refInput, setRefInput]     = useState('')
  const [availability, setAvailability] = useState(null)
  const [checking, setChecking]     = useState(false)
  const [search, setSearch]         = useState('')

  useEffect(() => {
    getInventory().then(data => { setItems(data); setLoading(false) })
  }, [])

  async function handleCheck() {
    if (!refInput.trim()) return
    setChecking(true)
    const result = await checkAvailability(refInput.trim())
    setAvailability(result)
    setChecking(false)
  }

  const filtered = items.filter(i =>
    !search ||
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.author?.toLowerCase().includes(search.toLowerCase()) ||
    i.book_reference?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#EFF6FF' }}>📦</div>
          <div className="kpi-data">
            <div className="kpi-value">{items.length}</div>
            <div className="kpi-label">Títulos en stock</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#ECFDF5' }}>✅</div>
          <div className="kpi-data">
            <div className="kpi-value">{items.filter(i => i.condition === 'new' || i.condition === 'like_new').length}</div>
            <div className="kpi-label">En buen estado</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#FEF3C7' }}>🔢</div>
          <div className="kpi-data">
            <div className="kpi-value">{items.reduce((s, i) => s + (i.quantity || i.quantity_available || 0), 0)}</div>
            <div className="kpi-label">Unidades totales</div>
          </div>
        </div>
      </div>

      {/* Verificar disponibilidad */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Verificar disponibilidad</div>
            <div className="card-subtitle">Ingresa la referencia del libro</div>
          </div>
        </div>
        <div className="card-body">
          <div className="input-group">
            <div style={{ flex: 1 }}>
              <label className="input-label">Referencia</label>
              <input
                className="input"
                placeholder="Ej. REF-001"
                value={refInput}
                onChange={e => setRefInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
              />
            </div>
            <button className="btn btn-primary" onClick={handleCheck} disabled={checking || !refInput.trim()}>
              {checking ? <span className="spinner" /> : '🔍 Verificar'}
            </button>
          </div>

          {availability && (
            <div className="avail-result">
              <span style={{ fontSize: '1.25rem' }}>{(availability.quantity_available ?? availability.available_quantity ?? 0) > 0 ? '✅' : '❌'}</span>
              <div>
                <span className="avail-ref">{availability.book_reference}</span>
                {availability.mock && <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>Mock</span>}
              </div>
              <span className="avail-qty">{availability.quantity_available ?? availability.available_quantity ?? 0}</span>
              <span className="avail-label">unidades disponibles</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Listado de inventario</div>
            <div className="card-subtitle">{filtered.length} ítems</div>
          </div>
          <input
            className="input"
            style={{ width: 220 }}
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="empty-icon">⏳</span>
            <p className="empty-title">Cargando inventario...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p className="empty-title">Sin resultados</p>
            <p className="empty-sub">Prueba con otro término de búsqueda</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>ISBN</th>
                  <th>Cantidad</th>
                  <th>Condición</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const cond = CONDITION_BADGE[item.condition] || { label: item.condition, cls: 'badge-neutral' }
                  return (
                    <tr key={item.id}>
                      <td><code style={{ fontSize: '0.78rem', background: 'var(--border-light)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{item.book_reference}</code></td>
                      <td style={{ fontWeight: 500 }}>{item.title}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.author}</td>
                      <td style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{item.isbn || '—'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.quantity || item.quantity_available || 0}</td>
                      <td><span className={`badge ${cond.cls}`}>{cond.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
