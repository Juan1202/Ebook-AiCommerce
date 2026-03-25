import { useEffect, useState } from 'react'
import { getServicesStatus } from '../api'

const SERVICE_META = {
  'auth-service':       { icon: '🔐', desc: 'Autenticación JWT',          port: 8001 },
  'inventory-service':  { icon: '📦', desc: 'Gestión de inventario',       port: 8002 },
  'catalog-service':    { icon: '📚', desc: 'Catálogo bibliográfico',       port: 8003 },
  'ai-enrichment-mock': { icon: '🤖', desc: 'Enriquecimiento IA (Mock)',   port: 8006 },
  'data-quality-module':{ icon: '📊', desc: 'Calidad de datos',            port: 8007 },
  'config-module':      { icon: '⚙️', desc: 'Configuración del sistema',   port: 8008 },
}

export default function ServicesStatus() {
  const [services, setServices]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  async function load(silent = false) {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    const data = await getServicesStatus()
    setServices(data)
    setLastRefresh(new Date())
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  const upCount   = services.filter(s => s.status === 'up').length
  const downCount = services.filter(s => s.status === 'down').length
  const allUp = downCount === 0 && services.length > 0

  return (
    <>
      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#ECFDF5' }}>🟢</div>
          <div className="kpi-data">
            <div className="kpi-value">{loading ? '—' : upCount}</div>
            <div className="kpi-label">Servicios activos</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: downCount > 0 ? '#FEF2F2' : '#F1F5F9' }}>🔴</div>
          <div className="kpi-data">
            <div className="kpi-value" style={{ color: downCount > 0 ? 'var(--danger)' : 'var(--text-light)' }}>
              {loading ? '—' : downCount}
            </div>
            <div className="kpi-label">Servicios caídos</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#F1F5F9' }}>🌐</div>
          <div className="kpi-data">
            <div className="kpi-value">{services.length}</div>
            <div className="kpi-label">Total monitoreados</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Estado de microservicios</div>
            <div className="card-subtitle">
              {lastRefresh
                ? `Última actualización: ${lastRefresh.toLocaleTimeString('es-CO')}`
                : 'Verificando...'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
            {!loading && (
              <span className={`badge ${allUp ? 'badge-success' : downCount > 0 ? 'badge-danger' : 'badge-neutral'}`}>
                {allUp ? '✅ Todo operativo' : `⚠️ ${downCount} servicio${downCount > 1 ? 's' : ''} caído${downCount > 1 ? 's' : ''}`}
              </span>
            )}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => load(true)}
              disabled={refreshing}
            >
              {refreshing ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '🔄'} Actualizar
            </button>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="empty-state">
              <span className="empty-icon">⏳</span>
              <p className="empty-title">Verificando servicios...</p>
            </div>
          ) : (
            <div className="service-grid">
              {services.map(s => {
                const meta = SERVICE_META[s.name] || { icon: '🔌', desc: s.name, port: '—' }
                const isUp = s.status === 'up'
                return (
                  <div className="service-card" key={s.name}
                    style={{ borderLeft: `3px solid ${isUp ? 'var(--success)' : 'var(--danger)'}` }}>
                    <div style={{ fontSize: '1.5rem' }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="service-name">{s.name}</div>
                      <div className="service-port">{meta.desc} · :{meta.port}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={`service-led ${isUp ? 'up' : 'down'}`} style={{ float: 'right', marginBottom: 4 }} />
                      <div className={`service-status-label ${isUp ? 'up' : 'down'}`}>
                        {isUp ? 'UP' : 'DOWN'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="alert alert-info" style={{ marginTop: '1.25rem' }}>
        ℹ️ Los servicios caídos retornan datos mock en los paneles. El sistema nunca falla por dependencias externas.
      </div>
    </>
  )
}
