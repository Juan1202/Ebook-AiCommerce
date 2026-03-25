import { useEffect, useState } from 'react'
import { getQualitySummary } from '../api'

function RateBar({ value, size = 'md' }) {
  const pct = Math.min((value * 100), 100)
  const color = value > 0.2 ? 'var(--danger)' : value > 0.05 ? 'var(--warning)' : 'var(--success)'
  const h = size === 'sm' ? 5 : 8
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <div className="progress-bar" style={{ flex: 1, height: h }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: '0.78rem', color, fontWeight: 700, minWidth: 40, textAlign: 'right' }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  )
}

export default function QualityPanel() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQualitySummary().then(data => { setSummary(data); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="empty-state">
      <span className="empty-icon">⏳</span>
      <p className="empty-title">Cargando métricas...</p>
    </div>
  )

  const overallPct = ((summary.overall_error_rate || 0) * 100).toFixed(1)
  const health = summary.overall_error_rate > 0.2 ? 'danger' : summary.overall_error_rate > 0.05 ? 'warning' : 'success'
  const healthLabel = { danger: 'Crítico', warning: 'Atención', success: 'Excelente' }
  const healthIcon  = { danger: '🔴', warning: '🟡', success: '🟢' }

  return (
    <>
      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: '📊', val: summary.total_batches,          label: 'Lotes totales',       bg: '#EFF6FF' },
          { icon: '✅', val: summary.completed_batches,       label: 'Completados',          bg: '#ECFDF5' },
          { icon: '❌', val: summary.failed_batches,          label: 'Fallidos',             bg: '#FEF2F2' },
          { icon: '📋', val: summary.total_items_processed,   label: 'Filas procesadas',     bg: '#FEF3C7' },
          { icon: '⚠️', val: summary.total_errors,            label: 'Errores totales',      bg: '#FEF2F2' },
          {
            icon: healthIcon[health],
            val: `${overallPct}%`,
            label: `Tasa de error · ${healthLabel[health]}`,
            bg: health === 'success' ? '#ECFDF5' : health === 'warning' ? '#FFFBEB' : '#FEF2F2',
          },
        ].map(({ icon, val, label, bg }) => (
          <div className="kpi-card" key={label}>
            <div className="kpi-icon-wrap" style={{ background: bg }}>{icon}</div>
            <div className="kpi-data">
              <div className="kpi-value">{typeof val === 'number' ? val.toLocaleString() : val}</div>
              <div className="kpi-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Overview card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Tasa de error global</div>
            <div className="card-subtitle">Sobre el total de filas procesadas</div>
          </div>
          <span className={`badge badge-${health === 'success' ? 'success' : health === 'warning' ? 'warning' : 'danger'}`}>
            {healthIcon[health]} {healthLabel[health]}
          </span>
        </div>
        <div className="card-body">
          <RateBar value={summary.overall_error_rate || 0} />
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span><strong style={{ color: 'var(--success)' }}>{summary.total_items_processed - summary.total_errors}</strong> filas válidas</span>
            <span><strong style={{ color: 'var(--danger)' }}>{summary.total_errors}</strong> errores</span>
            <span><strong>{summary.total_items_processed}</strong> total procesadas</span>
          </div>
        </div>
      </div>

      {/* Per-batch table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Detalle por lote</div>
            <div className="card-subtitle">{(summary.batches || []).length} lotes analizados</div>
          </div>
        </div>
        {(summary.batches || []).length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p className="empty-title">Sin datos de lotes</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Archivo</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Válidos</th>
                  <th>Errores</th>
                  <th style={{ minWidth: 180 }}>Tasa de error</th>
                </tr>
              </thead>
              <tbody>
                {(summary.batches || []).map(b => {
                  const rate = b.error_rate ?? (b.total_rows > 0 ? b.error_rows / b.total_rows : 0)
                  const statusCls = b.status === 'completed' ? 'badge-success' : b.status === 'failed' ? 'badge-danger' : 'badge-warning'
                  return (
                    <tr key={b.batch_id}>
                      <td style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>#{b.batch_id}</td>
                      <td style={{ fontWeight: 500 }}>{b.filename}</td>
                      <td><span className={`badge ${statusCls}`}>{b.status}</span></td>
                      <td>{b.total_rows}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 500 }}>{b.valid_rows}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 500 }}>{b.error_rows}</td>
                      <td><RateBar value={rate} size="sm" /></td>
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
