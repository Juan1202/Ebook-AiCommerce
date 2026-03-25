import { useEffect, useState, useRef } from 'react'
import { getBatches, getBatchErrors, uploadBatch } from '../api'

const STATUS_BADGE = {
  completed:  { label: 'Completado', cls: 'badge-success' },
  failed:     { label: 'Fallido',    cls: 'badge-danger'  },
  processing: { label: 'Procesando', cls: 'badge-warning' },
  pending:    { label: 'Pendiente',  cls: 'badge-neutral' },
}

function ErrorRate({ value }) {
  const pct = (value * 100).toFixed(1)
  const color = value > 0.2 ? 'var(--danger)' : value > 0.05 ? 'var(--warning)' : 'var(--success)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div className="progress-bar" style={{ width: 64, height: 6 }}>
        <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span style={{ fontSize: '0.78rem', color, fontWeight: 600 }}>{pct}%</span>
    </div>
  )
}

export default function BatchPanel() {
  const [batches, setBatches]         = useState([])
  const [selectedBatch, setSelected]  = useState(null)
  const [errors, setErrors]           = useState([])
  const [uploading, setUploading]     = useState(false)
  const [alert, setAlert]             = useState(null)
  const [dragOver, setDragOver]       = useState(false)
  const fileRef = useRef()

  useEffect(() => { getBatches().then(setBatches) }, [])

  async function handleViewErrors(batch) {
    setSelected(batch)
    const errs = await getBatchErrors(batch.id)
    setErrors(errs)
  }

  async function doUpload(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setAlert({ type: 'error', msg: `Formato no permitido: .${ext}. Usa CSV o XLSX.` })
      return
    }
    setUploading(true)
    setAlert(null)
    try {
      const result = await uploadBatch(file)
      setAlert({ type: 'success', msg: `Lote #${result.id} creado — ${result.valid_rows} filas válidas, ${result.invalid_rows} errores` })
      getBatches().then(setBatches)
    } catch (e) {
      setAlert({ type: 'error', msg: e.response?.data?.detail || 'Error al procesar el archivo' })
    } finally {
      setUploading(false)
    }
  }

  function handleFileInput(e) { doUpload(e.target.files[0]) }
  function handleDrop(e) { e.preventDefault(); setDragOver(false); doUpload(e.dataTransfer.files[0]) }

  const completedCount = batches.filter(b => b.status === 'completed').length
  const totalRows = batches.reduce((s, b) => s + (b.total_rows || 0), 0)
  const totalErrors = batches.reduce((s, b) => s + (b.error_rows || b.invalid_rows || 0), 0)

  return (
    <>
      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#EFF6FF' }}>📂</div>
          <div className="kpi-data">
            <div className="kpi-value">{batches.length}</div>
            <div className="kpi-label">Lotes totales</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#ECFDF5' }}>✅</div>
          <div className="kpi-data">
            <div className="kpi-value">{completedCount}</div>
            <div className="kpi-label">Completados</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#FEF3C7' }}>📋</div>
          <div className="kpi-data">
            <div className="kpi-value">{totalRows.toLocaleString()}</div>
            <div className="kpi-label">Filas procesadas</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#FEF2F2' }}>⚠️</div>
          <div className="kpi-data">
            <div className="kpi-value">{totalErrors}</div>
            <div className="kpi-label">Errores totales</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Upload card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Subir archivo</div>
              <div className="card-subtitle">CSV o XLSX · máx. 10 MB</div>
            </div>
          </div>
          <div className="card-body">
            {alert && (
              <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {alert.type === 'success' ? '✅' : '❌'} {alert.msg}
              </div>
            )}

            <div
              className={`upload-zone${dragOver ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <span className="upload-icon">📤</span>
              <div className="upload-title">Arrastra tu archivo aquí</div>
              <div className="upload-sub">o haz clic para seleccionar</div>
              <div className="upload-btn-wrap">
                <span className="btn btn-secondary btn-sm">Examinar archivos</span>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />

            {uploading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span className="spinner" />
                Procesando archivo...
              </div>
            )}
          </div>
        </div>

        {/* Batch list */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Historial de lotes</div>
              <div className="card-subtitle">{batches.length} archivos importados</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Archivo</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Válidos</th>
                  <th>Tasa error</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => {
                  const st = STATUS_BADGE[b.status] || { label: b.status, cls: 'badge-neutral' }
                  const errorRows = b.error_rows ?? b.invalid_rows ?? 0
                  const total = b.total_rows ?? b.processed_rows ?? 0
                  const rate = total > 0 ? errorRows / total : 0
                  return (
                    <tr key={b.id}>
                      <td style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>#{b.id}</td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{b.filename || b.file_name}</div>
                        {b.upload_date && <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{new Date(b.upload_date).toLocaleDateString('es-CO')}</div>}
                      </td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td style={{ fontWeight: 500 }}>{total}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 500 }}>{b.valid_rows ?? (total - errorRows)}</td>
                      <td><ErrorRate value={rate} /></td>
                      <td>
                        {errorRows > 0 && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewErrors(b)}
                            style={{ borderColor: selectedBatch?.id === b.id ? 'var(--primary)' : undefined }}
                          >
                            {errorRows} errores
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {batches.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p className="empty-title">Sin lotes aún</p>
                <p className="empty-sub">Sube un archivo CSV o XLSX para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Errors panel */}
      {selectedBatch && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Errores — Lote #{selectedBatch.id}</div>
              <div className="card-subtitle">{selectedBatch.filename || selectedBatch.file_name} · {errors.length} errores encontrados</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>✕ Cerrar</button>
          </div>
          {errors.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎉</span>
              <p className="empty-title">Sin errores registrados</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Fila</th><th>Campo</th><th>Mensaje</th><th>Valor recibido</th></tr>
                </thead>
                <tbody>
                  {errors.map((e, i) => (
                    <tr key={i} className="error-row">
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{e.row_number}</td>
                      <td><span className="error-field">{e.field || e.error_type}</span></td>
                      <td>{e.message}</td>
                      <td><span className="raw-value">{e.raw_value || e.raw_data || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  )
}
