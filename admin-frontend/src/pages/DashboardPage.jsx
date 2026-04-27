import React, { useEffect, useState } from 'react';
import { getServicesHealth } from '../services/systemService';
import { getLotes } from '../services/inventoryService';

const DashboardPage = ({ onNavegar }) => {
  const [servicios, setServicios] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [cargandoLotes, setCargandoLotes] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const svcs = await getServicesHealth();
        if (activo) setServicios(svcs);
      } catch {
        if (activo) setServicios([]);
      } finally {
        if (activo) setCargandoServicios(false);
      }
    }

    async function cargarLotes() {
      try {
        const data = await getLotes();
        if (activo) setLotes(Array.isArray(data) ? data : []);
      } catch {
        if (activo) setLotes([]);
      } finally {
        if (activo) setCargandoLotes(false);
      }
    }

    cargar();
    cargarLotes();

    return () => { activo = false; };
  }, []);

  const totalValidos = lotes.reduce((s, l) => s + (l.valid_rows || 0), 0);
  const totalInvalidos = lotes.reduce((s, l) => s + (l.invalid_rows || 0), 0);
  const ultimosLotes = [...lotes].slice(-3).reverse();

  return (
    <div style={page}>
      <div style={headerWrap}>
        <h1 style={title}>Dashboard</h1>
        <p style={subtitle}>Vista general del sistema BookFlow</p>
      </div>

      {/* KPIs rápidos */}
      <div style={kpiGrid}>
        <KpiCard label="Total de Lotes" value={lotes.length} loading={cargandoLotes} color="#3b82f6" />
        <KpiCard label="Registros Válidos" value={totalValidos} loading={cargandoLotes} color="#22c55e" />
        <KpiCard label="Registros Inválidos" value={totalInvalidos} loading={cargandoLotes} color="#ef4444" />
        <KpiCard
          label="Servicios Activos"
          value={`${servicios.filter(s => s.status === 'online').length} / ${servicios.length}`}
          loading={cargandoServicios}
          color="#a78bfa"
        />
      </div>

      {/* Estado de servicios */}
      <section style={section}>
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Estado de Servicios</h2>
          {cargandoServicios && <span style={loadingBadge}>Verificando...</span>}
        </div>
        <div style={servicesGrid}>
          {cargandoServicios
            ? Array(7).fill(0).map((_, i) => <ServiceCardSkeleton key={i} />)
            : servicios.map((svc) => <ServiceCard key={svc.key} svc={svc} />)}
        </div>
      </section>

      {/* Lotes recientes */}
      <section style={section}>
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Lotes Recientes</h2>
          <button style={linkBtn} onClick={() => onNavegar('inventario')}>
            Ver todos →
          </button>
        </div>
        {cargandoLotes ? (
          <p style={emptyText}>Cargando lotes...</p>
        ) : ultimosLotes.length === 0 ? (
          <p style={emptyText}>No hay lotes registrados aún.</p>
        ) : (
          <div style={recentList}>
            {ultimosLotes.map((l) => (
              <div key={l.id} style={recentItem}>
                <div>
                  <span style={recentId}>Lote #{l.id}</span>
                  {l.file_name && <span style={recentFile}>{l.file_name}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={recentStat}>{l.valid_rows} válidos · {l.invalid_rows} inválidos</span>
                  <span style={badgeStyle(l.status)}>{l.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Accesos rápidos */}
      <section style={section}>
        <h2 style={sectionTitle}>Accesos Rápidos</h2>
        <div style={quickGrid}>
          <QuickCard
            icon="⊞"
            titulo="Gestionar Inventario"
            desc="Ver lotes, subir archivos y revisar errores"
            onClick={() => onNavegar('inventario')}
          />
          <QuickCard
            icon="◑"
            titulo="Ver Reportes"
            desc="Estadísticas y análisis de los datos cargados"
            onClick={() => onNavegar('reportes')}
          />
        </div>
      </section>
    </div>
  );
};

/* ── Sub-componentes ── */

const KpiCard = ({ label, value, loading, color }) => (
  <div style={kpiCard}>
    <p style={kpiLabel}>{label}</p>
    {loading
      ? <div style={skeleton(28)} />
      : <h2 style={{ ...kpiValue, color }}>{value}</h2>}
  </div>
);

const ServiceCard = ({ svc }) => (
  <div style={serviceCard}>
    <div style={serviceIndicator(svc.status)} />
    <div>
      <p style={serviceName}>{svc.name}</p>
      <p style={serviceStatus(svc.status)}>
        {svc.status === 'online' ? 'En línea' : svc.status === 'degraded' ? 'Degradado' : 'Fuera de línea'}
      </p>
    </div>
  </div>
);

const ServiceCardSkeleton = () => (
  <div style={serviceCard}>
    <div style={{ ...serviceIndicator('loading'), opacity: 0.3 }} />
    <div style={{ flex: 1 }}>
      <div style={skeleton(14)} />
      <div style={{ ...skeleton(12), marginTop: 6, width: '60%' }} />
    </div>
  </div>
);

const QuickCard = ({ icon, titulo, desc, onClick }) => (
  <button style={quickCard} onClick={onClick}>
    <span style={quickIcon}>{icon}</span>
    <div>
      <p style={quickTitle}>{titulo}</p>
      <p style={quickDesc}>{desc}</p>
    </div>
  </button>
);

export default DashboardPage;


/* ================= ESTILOS ================= */

const page = { padding: '30px', overflowY: 'auto', flex: 1 };

const headerWrap = { marginBottom: '28px' };
const title = { fontSize: '22px', margin: 0, color: '#e2e8f0' };
const subtitle = { color: '#64748b', marginTop: '5px', fontSize: '14px' };

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  marginBottom: '28px',
};

const kpiCard = {
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '20px',
};

const kpiLabel = { fontSize: '13px', color: '#94a3b8', marginBottom: '8px' };
const kpiValue = { fontSize: '28px', fontWeight: '600', margin: 0 };

const section = { marginBottom: '28px' };

const sectionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '14px',
};

const sectionTitle = { fontSize: '16px', fontWeight: '600', color: '#e2e8f0', margin: 0 };

const loadingBadge = {
  fontSize: '12px',
  color: '#64748b',
  background: '#1e293b',
  padding: '3px 10px',
  borderRadius: '20px',
};

const linkBtn = {
  background: 'transparent',
  border: 'none',
  color: '#3b82f6',
  fontSize: '13px',
  cursor: 'pointer',
  padding: '4px 0',
};

const servicesGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '12px',
};

const serviceCard = {
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  padding: '14px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const serviceIndicator = (status) => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  flexShrink: 0,
  background: status === 'online' ? '#22c55e' : status === 'degraded' ? '#f59e0b' : '#ef4444',
  boxShadow: status === 'online' ? '0 0 6px #22c55e55' : 'none',
});

const serviceName = { fontSize: '13px', color: '#e2e8f0', margin: 0, fontWeight: '500' };
const serviceStatus = (status) => ({
  fontSize: '11px',
  color: status === 'online' ? '#22c55e' : status === 'degraded' ? '#f59e0b' : '#64748b',
  marginTop: '2px',
});

const recentList = {
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  overflow: 'hidden',
};

const recentItem = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 18px',
  borderBottom: '1px solid #1e293b',
};

const recentId = { fontSize: '14px', fontWeight: '500', color: '#e2e8f0' };
const recentFile = {
  fontSize: '12px',
  color: '#64748b',
  marginLeft: '10px',
};
const recentStat = { fontSize: '13px', color: '#64748b' };

const badgeStyle = (status) => {
  const base = {
    fontSize: '11px',
    padding: '3px 10px',
    borderRadius: '20px',
    fontWeight: '500',
  };
  if (status === 'COMPLETADO') return { ...base, background: '#052e16', color: '#22c55e' };
  if (status === 'ERROR') return { ...base, background: '#2b0a0a', color: '#ef4444' };
  return { ...base, background: '#3b2f0a', color: '#f59e0b' };
};

const quickGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '14px',
};

const quickCard = {
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '20px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '14px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'border-color 0.2s ease',
  width: '100%',
};

const quickIcon = { fontSize: '22px', marginTop: '2px' };
const quickTitle = { fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: 0 };
const quickDesc = { fontSize: '12px', color: '#64748b', marginTop: '4px' };

const emptyText = { color: '#475569', fontSize: '14px', padding: '12px 0' };

const skeleton = (height) => ({
  background: '#1e293b',
  borderRadius: '6px',
  height,
  width: '100%',
  animation: 'pulse 1.5s ease-in-out infinite',
});
