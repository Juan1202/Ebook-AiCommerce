import React from 'react';

const PricingExplanation = ({ decision }) => {
  if (!decision) return null;

  const {
    explanation,
    suggested_price,
    base_price,
    condition_factor,
    reference_count,
    source,
    is_fallback,
    adjustment_reasons = [],
    currency = 'USD',
  } = decision;

  return (
    <div style={wrap}>
      <h3 style={heading}>Desglose del cálculo</h3>

      <div style={grid}>
        <Row label="Precio sugerido" value={`$${Number(suggested_price).toFixed(2)} ${currency}`} highlight />
        <Row label="Precio base" value={`$${Number(base_price).toFixed(2)}`} />
        <Row label="Factor de condición" value={`×${condition_factor}`} />
        <Row label="Referencias encontradas" value={reference_count} />
        <Row
          label="Fuente"
          value={source === 'ebay' ? 'eBay Browse API' : 'Reglas internas'}
          badge={is_fallback ? 'fallback' : 'verified'}
        />
      </div>

      {adjustment_reasons.length > 0 && (
        <div style={adjustWrap}>
          <p style={adjustLabel}>Ajustes aplicados</p>
          <ul style={adjustList}>
            {adjustment_reasons.map((r, i) => (
              <li key={i} style={adjustItem}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {explanation && (
        <div style={explanationBox}>
          <p style={explanationLabel}>Explicación completa</p>
          <p style={explanationText}>{explanation}</p>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value, highlight, badge }) => (
  <div style={row}>
    <span style={rowLabel}>{label}</span>
    <span style={highlight ? rowValueHL : rowValue}>
      {value}
      {badge === 'fallback' && <span style={badgeFallback}>Estimado</span>}
      {badge === 'verified' && <span style={badgeVerified}>Verificado</span>}
    </span>
  </div>
);

export default PricingExplanation;


const wrap = {
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '20px',
};

const heading = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#e2e8f0',
  margin: '0 0 16px',
};

const grid = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginBottom: '16px',
};

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '10px',
  borderBottom: '1px solid #0f172a',
};

const rowLabel = { fontSize: '13px', color: '#94a3b8' };
const rowValue = { fontSize: '13px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' };
const rowValueHL = { fontSize: '16px', fontWeight: '700', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' };

const badgeFallback = {
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '20px',
  background: '#431407',
  color: '#fb923c',
  fontWeight: '500',
};

const badgeVerified = {
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '20px',
  background: '#052e16',
  color: '#22c55e',
  fontWeight: '500',
};

const adjustWrap = { marginBottom: '16px' };
const adjustLabel = { fontSize: '12px', color: '#64748b', marginBottom: '6px' };
const adjustList = { margin: 0, paddingLeft: '16px' };
const adjustItem = { fontSize: '13px', color: '#94a3b8', marginBottom: '4px' };

const explanationBox = {
  background: '#0f172a',
  borderRadius: '8px',
  padding: '14px 16px',
};

const explanationLabel = { fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' };
const explanationText = { fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 };
