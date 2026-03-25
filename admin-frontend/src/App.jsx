import { useState } from 'react'
import InventoryPanel from './components/InventoryPanel'
import BatchPanel from './components/BatchPanel'
import QualityPanel from './components/QualityPanel'
import ServicesStatus from './components/ServicesStatus'

const NAV = [
  { id: 'inventory', icon: '📦', label: 'Inventario',    section: 'Principal' },
  { id: 'batches',   icon: '📂', label: 'Lotes',         section: 'Principal' },
  { id: 'quality',   icon: '📊', label: 'Calidad',       section: 'Análisis'  },
  { id: 'services',  icon: '⚡', label: 'Servicios',     section: 'Sistema'   },
]

const PAGE_META = {
  inventory: { title: 'Inventario',       desc: 'Gestiona el stock de libros disponibles' },
  batches:   { title: 'Lotes de carga',   desc: 'Importa y revisa archivos de inventario' },
  quality:   { title: 'Calidad de datos', desc: 'Métricas y tasas de error por lote' },
  services:  { title: 'Estado servicios', desc: 'Monitoreo de microservicios en tiempo real' },
}

export default function App() {
  const [tab, setTab] = useState('inventory')
  const meta = PAGE_META[tab]

  const sections = [...new Set(NAV.map(n => n.section))]

  return (
    <div className="app-shell">
      {/* ── Sidebar ──────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📚</div>
          <div>
            <div className="sidebar-logo-text">BookFlow</div>
            <div className="sidebar-logo-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section}>
              <div className="sidebar-nav-label">{section}</div>
              {NAV.filter(n => n.section === section).map(item => (
                <button
                  key={item.id}
                  className={`nav-item${tab === item.id ? ' active' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">BookFlow v1.0 · Sprint 1</div>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────── */}
      <div className="main-area">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <span className="topbar-title">{meta.title}</span>
            <span className="topbar-sub">— {meta.desc}</span>
          </div>
          <div className="topbar-actions">
            <span className="status-dot">Sistema activo</span>
          </div>
        </div>

        {/* Content */}
        <div className="page-content">
          {tab === 'inventory' && <InventoryPanel />}
          {tab === 'batches'   && <BatchPanel />}
          {tab === 'quality'   && <QualityPanel />}
          {tab === 'services'  && <ServicesStatus />}
        </div>
      </div>
    </div>
  )
}
