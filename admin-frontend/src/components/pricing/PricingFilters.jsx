import React from 'react';

const CONDITIONS = ['Todas', 'NUEVO', 'BUENO', 'ACEPTABLE', 'DETERIORADO'];
const SOURCES = ['Todas', 'ebay', 'internal_rules'];

const PricingFilters = ({ filters, onChange }) => {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div style={wrap}>
      <div style={group}>
        <label style={labelStyle}>Condición</label>
        <select
          style={selectStyle}
          value={filters.condition || 'Todas'}
          onChange={(e) => set('condition', e.target.value === 'Todas' ? '' : e.target.value)}
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div style={group}>
        <label style={labelStyle}>Fuente</label>
        <select
          style={selectStyle}
          value={filters.source || 'Todas'}
          onChange={(e) => set('source', e.target.value === 'Todas' ? '' : e.target.value)}
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s === 'internal_rules' ? 'Reglas internas' : s === 'ebay' ? 'eBay' : s}</option>
          ))}
        </select>
      </div>

      <div style={group}>
        <label style={labelStyle}>Precio mín. ($)</label>
        <input
          type="number"
          style={inputStyle}
          placeholder="0"
          value={filters.minPrice || ''}
          onChange={(e) => set('minPrice', e.target.value)}
        />
      </div>

      <div style={group}>
        <label style={labelStyle}>Precio máx. ($)</label>
        <input
          type="number"
          style={inputStyle}
          placeholder="9999"
          value={filters.maxPrice || ''}
          onChange={(e) => set('maxPrice', e.target.value)}
        />
      </div>

      <button
        style={clearBtn}
        onClick={() => onChange({ condition: '', source: '', minPrice: '', maxPrice: '' })}
      >
        Limpiar
      </button>
    </div>
  );
};

export default PricingFilters;


const wrap = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  alignItems: 'flex-end',
  padding: '16px 18px',
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  marginBottom: '20px',
};

const group = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
};

const labelStyle = {
  fontSize: '11px',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const selectStyle = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '13px',
  padding: '7px 10px',
  cursor: 'pointer',
  minWidth: '140px',
};

const inputStyle = {
  ...selectStyle,
  minWidth: '100px',
};

const clearBtn = {
  background: 'transparent',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#94a3b8',
  fontSize: '13px',
  padding: '7px 14px',
  cursor: 'pointer',
  alignSelf: 'flex-end',
};
