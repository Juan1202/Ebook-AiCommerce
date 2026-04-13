import React, { useEffect, useState } from 'react';
import { getLotes } from '../services/inventoryService';

const STATUS_CONFIG = {
  COMPLETADO: { label: 'Completado', bg: '#052e16', color: '#22c55e' },
  ERROR:      { label: 'Error',      bg: '#2b0a0a', color: '#ef4444' },
  PROCESADO:  { label: 'Procesado',  bg: '#3b2f0a', color: '#f59e0b' },
};

const ReportesPage = () => {
  const [lotes, setLotes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await getLotes();
        if (activo) setLotes(Array.isArray(data) ? data : []);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, []);

  if (cargando) {
    return (
      <div style={page}>
        <h1 style={titleStyle}>Reportes</h1>
        <p style={loadingText}>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={page}>
        <h1 style={titleStyle}>Reportes</h1>
        <div style={errorBanner}>⚠ No se pudo cargar datos: {error}</div>
      </div>
    );
  }

  const totalRows = lotes.reduce((s, l) => s + (l.processed_rows || 0), 0);
  const totalValidos = lotes.reduce((s, l) => s + (l.valid_rows || 0), 0);
  const totalInvalidos = lotes.reduce((s, l) => s + (l.invalid_rows || 0), 0);
  const calidadPct = totalRows > 0 ? ((totalValidos / totalRows) * 100).toFixed(1) : 0;

  const porEstado = Object.keys(STATUS_CONFIG).map((estado) => {
    const grupo = lotes.filter((l) => l.status === estado);
    return {
      estado,
      count: grupo.length,
      validos: grupo.reduce((s, l) => s + (l.valid_rows || 0), 0),
      invalidos: grupo.reduce((s, l) => s + (l.invalid_rows || 0), 0),
    };
  });

  const maxCount = Math.max(...porEstado.map(e => e.count), 1);

  return (
    <div style={page}>
      <div style={headerWrap}>
        <h1 style={titleStyle}>Reportes</h1>
        <p style={subtitle}>Análisis y estadísticas de cargas de inventario</p>
      </div>

      {lotes.length === 0 ? (
        <div style={emptyState}>
          <p style={emptyIcon}>◑</p>
          <p style={emptyTitle}>Sin datos para reportar</p>
          <p style={emptyDesc}>Sube archivos de inventario para ver estadísticas aquí.</p>
        </div>
      ) : (
        <>
          {/* Métricas globales */}
          <div style={metricsGrid}>
            <MetricCard label="Total de lotes" value={lotes.length} />
            <MetricCard label="Filas procesadas" value={totalRows.toLocaleString()} />
            <MetricCard label="Registros válidos" value={totalValidos.toLocaleString()} color="#22c55e" />
            <MetricCard label="Registros inválidos" value={totalInvalidos.toLocaleString()} color="#ef4444" />
            <MetricCard label="Calidad de datos" value={`${calidadPct}%`} color={calidadPct >= 80 ? '#22c55e' : '#f59e0b'} />
          </div>

          {/* Distribución por estado */}
          <section style={section}>
            <h2 style={sectionTitle}>Distribución por Estado</h2>
            <div style={distribucionGrid}>
              {porEstado.map(({ estado, count, validos, invalidos }) => {
                const cfg = STATUS_CONFIG[estado] || STATUS_CONFIG.PROCESADO;
                return (
                  <div key={estado} style={distCard}>
                    <div style={distHeader}>
                      <span style={badge(cfg)}>{cfg.label}</span>
                      <span style={distCount}>{count} lotes</span>
                    </div>
                    <div style={barTrack}>
                      <div
                        style={{
                          ...barFill,
                          width: `${(count / lotes.length) * 100}%`,
                          background: cfg.color,
                        }}
                      />
                    </div>
                    <div style={distStats}>
                      <span style={distStat}>{validos} válidos</span>
                      <span style={distStat}>{invalidos} inválidos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Barras de comparación */}
          <section style={section}>
            <h2 style={sectionTitle}>Lotes por Estado</h2>
            <div style={chartWrap}>
              {porEstado.map(({ estado, count }) => {
                const cfg = STATUS_CONFIG[estado] || STATUS_CONFIG.PROCESADO;
                return (
                  <div key={estado} style={chartRow}>
                    <span style={chartLabel}>{cfg.label}</span>
                    <div style={chartTrack}>
                      <div
                        style={{
                          ...chartBar,
                          width: `${(count / maxCount) * 100}%`,
                          background: cfg.color,
                        }}
                      />
                    </div>
                    <span style={chartCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Historial completo */}
          <section style={section}>
            <h2 style={sectionTitle}>Historial de Lotes</h2>
            <div style={tableWrap}>
              <div style={tableHeader}>
                <span>ID</span>
                <span>Archivo</span>
                <span>Estado</span>
                <span style={{ textAlign: 'right' }}>Procesados</span>
                <span style={{ textAlign: 'right' }}>Válidos</span>
                <span style={{ textAlign: 'right' }}>Inválidos</span>
                <span style={{ textAlign: 'right' }}>Calidad</span>
              </div>
              {[...lotes].reverse().map((l) => {
                const cfg = STATUS_CONFIG[l.status] || STATUS_CONFIG.PROCESADO;
                const pct = l.processed_rows > 0
                  ? ((l.valid_rows / l.processed_rows) * 100).toFixed(0)
                  : 0;
                return (
                  <div key={l.id} style={tableRow}>
                    <span style={idStyle}>#{l.id}</span>
                    <span style={fileStyle}>{l.file_name || '—'}</span>
                    <span><span style={badge(cfg)}>{cfg.label}</span></span>
                    <span style={numStyle}>{(l.processed_rows || 0).toLocaleString()}</span>
                    <span style={{ ...numStyle, color: '#22c55e' }}>{(l.valid_rows || 0).toLocaleString()}</span>
                    <span style={{ ...numStyle, color: '#ef4444' }}>{(l.invalid_rows || 0).toLocaleString()}</span>
                    <span style={{ ...numStyle, color: pct >= 80 ? '#22c55e' : '#f59e0b' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, color }) => (
  <div style={metricCard}>
    <p style={metricLabel}>{label}</p>
    <h2 style={{ ...metricValue, color: color || '#e2e8f0' }}>{value}</h2>
  </div>
);

export default ReportesPage;


/* ================= ESTILOS ================= */

const page = { padding: '30px', overflowY: 'auto', flex: 1 };
const headerWrap = { marginBottom: '28px' };
const titleStyle = { fontSize: '22px', margin: 0, color: '#e2e8f0' };
const subtitle = { color: '#64748b', marginTop: '5px', fontSize: '14px' };
const loadingText = { color: '#475569', fontSize: '14px' };
const errorBanner = {
  background: '#2b0a0a', border: '1px solid #7f1d1d',
  color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', fontSize: '13px',
};

const emptyState = {
  background: '#020617', border: '1px solid #1e293b',
  borderRadius: '12px', padding: '48px', textAlign: 'center',
};
const emptyIcon = { fontSize: '40px', margin: '0 0 12px', color: '#1e293b' };
const emptyTitle = { fontSize: '16px', color: '#e2e8f0', fontWeight: '600' };
const emptyDesc = { fontSize: '14px', color: '#64748b', marginTop: '6px' };

const metricsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '14px',
  marginBottom: '28px',
};

const metricCard = {
  background: '#020617', border: '1px solid #1e293b',
  borderRadius: '12px', padding: '18px',
};
const metricLabel = { fontSize: '12px', color: '#94a3b8', marginBottom: '8px' };
const metricValue = { fontSize: '26px', fontWeight: '700', margin: 0 };

const section = { marginBottom: '28px' };
const sectionTitle = { fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '14px' };

const distribucionGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '14px',
};

const distCard = {
  background: '#020617', border: '1px solid #1e293b',
  borderRadius: '12px', padding: '16px',
};
const distHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' };
const distCount = { fontSize: '13px', color: '#94a3b8' };
const distStats = { display: 'flex', gap: '14px', marginTop: '8px' };
const distStat = { fontSize: '12px', color: '#64748b' };

const barTrack = { background: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' };
const barFill = { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' };

const chartWrap = {
  background: '#020617', border: '1px solid #1e293b',
  borderRadius: '12px', padding: '20px',
  display: 'flex', flexDirection: 'column', gap: '14px',
};
const chartRow = { display: 'flex', alignItems: 'center', gap: '12px' };
const chartLabel = { width: '90px', fontSize: '13px', color: '#94a3b8', flexShrink: 0 };
const chartTrack = { flex: 1, background: '#1e293b', borderRadius: '4px', height: '10px', overflow: 'hidden' };
const chartBar = { height: '100%', borderRadius: '4px', minWidth: '4px', transition: 'width 0.5s ease' };
const chartCount = { width: '30px', fontSize: '13px', color: '#e2e8f0', textAlign: 'right', flexShrink: 0 };

const tableWrap = {
  background: '#020617', border: '1px solid #1e293b',
  borderRadius: '12px', overflow: 'hidden',
};
const tableHeader = {
  display: 'grid',
  gridTemplateColumns: '50px 1fr 120px 90px 90px 90px 80px',
  padding: '12px 18px',
  fontSize: '11px', color: '#64748b', letterSpacing: '0.5px',
  borderBottom: '1px solid #1e293b',
};
const tableRow = {
  display: 'grid',
  gridTemplateColumns: '50px 1fr 120px 90px 90px 90px 80px',
  padding: '13px 18px',
  fontSize: '13px',
  borderBottom: '1px solid #1e293b',
  alignItems: 'center',
};

const idStyle = { fontWeight: '600', color: '#e2e8f0' };
const fileStyle = { color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const numStyle = { textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

const badge = (cfg) => ({
  fontSize: '11px', padding: '3px 9px', borderRadius: '20px',
  fontWeight: '500', background: cfg.bg, color: cfg.color,
  display: 'inline-block',
});
