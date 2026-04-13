import React, { useEffect, useState, useCallback } from 'react';
import PricingCard from './PricingCard';
import PricingFilters from './PricingFilters';
import { getPricingList } from '../../services/pricingService';

const PricingDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ condition: '', source: '', minPrice: '', maxPrice: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPricingList();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err.message || 'Error al cargar precios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((item) => {
    if (filters.condition && item.condition_factor !== conditionToFactor(filters.condition)) return false;
    if (filters.source && item.source !== filters.source) return false;
    if (filters.minPrice && Number(item.suggested_price) < Number(filters.minPrice)) return false;
    if (filters.maxPrice && Number(item.suggested_price) > Number(filters.maxPrice)) return false;
    return true;
  });

  const verified = items.filter((i) => !i.is_fallback).length;
  const estimated = items.filter((i) => i.is_fallback).length;
  const avgPrice = items.length
    ? (items.reduce((s, i) => s + Number(i.suggested_price), 0) / items.length).toFixed(2)
    : '—';

  return (
    <div style={page}>
      <div style={headerWrap}>
        <h1 style={title}>Pricing</h1>
        <p style={subtitle}>Precios sugeridos calculados por el motor de IA</p>
      </div>

      {/* KPIs */}
      <div style={kpiGrid}>
        <KpiCard label="Total precios" value={items.length} loading={loading} color="#3b82f6" />
        <KpiCard label="Verificados (eBay)" value={verified} loading={loading} color="#22c55e" />
        <KpiCard label="Estimados (reglas)" value={estimated} loading={loading} color="#fb923c" />
        <KpiCard label="Precio promedio" value={loading ? '—' : `$${avgPrice}`} loading={loading} color="#a78bfa" />
      </div>

      {/* Filters */}
      <PricingFilters filters={filters} onChange={setFilters} />

      {/* Content */}
      {error && (
        <div style={errorBox}>
          <p style={errorText}>{error}</p>
          <button style={retryBtn} onClick={load}>Reintentar</button>
        </div>
      )}

      {!error && loading && (
        <div style={skeletonGrid}>
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!error && !loading && filtered.length === 0 && (
        <p style={emptyText}>
          {items.length === 0
            ? 'No hay precios calculados aún. Sube libros al inventario para generar precios.'
            : 'Ningún precio coincide con los filtros aplicados.'}
        </p>
      )}

      {!error && !loading && filtered.length > 0 && (
        <div style={grid}>
          {filtered.map((entry, i) => (
            <PricingCard
              key={entry.id || i}
              entry={entry}
              onRecalculated={load}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ label, value, loading, color }) => (
  <div style={kpiCard}>
    <p style={kpiLabel}>{label}</p>
    {loading
      ? <div style={skeleton(28)} />
      : <h2 style={{ ...kpiValue, color }}>{value}</h2>}
  </div>
);

const SkeletonCard = () => (
  <div style={skeletonCard}>
    <div style={skeleton(16)} />
    <div style={{ ...skeleton(12), marginTop: 8, width: '60%' }} />
    <div style={{ ...skeleton(28), marginTop: 16 }} />
    <div style={{ ...skeleton(12), marginTop: 10, width: '40%' }} />
  </div>
);

function conditionToFactor(condition) {
  const map = { NUEVO: 1.0, BUENO: 0.75, ACEPTABLE: 0.5, DETERIORADO: 0.25 };
  return map[condition] ?? null;
}

export default PricingDashboard;


const page = { padding: '30px', overflowY: 'auto', flex: 1 };
const headerWrap = { marginBottom: '28px' };
const title = { fontSize: '22px', margin: 0, color: '#e2e8f0' };
const subtitle = { color: '#64748b', marginTop: '5px', fontSize: '14px' };

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
};

const kpiCard = {
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '20px',
};

const kpiLabel = { fontSize: '13px', color: '#94a3b8', marginBottom: '8px' };
const kpiValue = { fontSize: '28px', fontWeight: '600', margin: 0 };

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
  gap: '16px',
};

const skeletonGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
  gap: '16px',
};

const skeletonCard = {
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '20px',
};

const skeleton = (height) => ({
  background: '#1e293b',
  borderRadius: '6px',
  height,
  width: '100%',
});

const errorBox = {
  background: '#2b0a0a',
  border: '1px solid #7f1d1d',
  borderRadius: '10px',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const errorText = { fontSize: '13px', color: '#f87171', flex: 1, margin: 0 };

const retryBtn = {
  background: 'transparent',
  border: '1px solid #7f1d1d',
  borderRadius: '8px',
  color: '#f87171',
  fontSize: '12px',
  padding: '6px 12px',
  cursor: 'pointer',
};

const emptyText = {
  fontSize: '14px',
  color: '#475569',
  padding: '40px 0',
  textAlign: 'center',
};
