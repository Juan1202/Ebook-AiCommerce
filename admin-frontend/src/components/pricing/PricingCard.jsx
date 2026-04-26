import React, { useState } from 'react';
import RecalculateButton from './RecalculateButton';
import PricingExplanation from './PricingExplanation';
import PricingHistory from './PricingHistory';
import { getPricingHistory } from '../../services/pricingService';

const PricingCard = ({ entry, onRecalculated }) => {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && !history) {
      setLoadingHistory(true);
      try {
        const data = await getPricingHistory(entry.book_id || entry.book_reference);
        setHistory(Array.isArray(data) ? data : [data]);
      } catch {
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    }
    setExpanded((v) => !v);
  };

  const isFallback = entry.is_fallback || entry.source === 'internal_rules';

  return (
    <div style={card}>
      {/* Header row */}
      <div style={headerRow}>
        <div style={titleGroup}>
          <p style={bookRef}>{entry.book_reference || entry.book_id || '—'}</p>
          <div style={badgeRow}>
            <span style={conditionBadge(entry.condition_factor)}>
              {conditionLabel(entry.condition_factor)}
            </span>
            <span style={sourceBadge(isFallback)}>
              {isFallback ? 'Estimado' : 'Verificado'}
            </span>
          </div>
        </div>

        <div style={priceGroup}>
          <p style={priceLabel}>Precio sugerido</p>
          <p style={priceValue}>${Number(entry.suggested_price).toFixed(2)}</p>
          <p style={currencyLabel}>{entry.currency || 'USD'}</p>
        </div>
      </div>

      {/* Compact stats */}
      <div style={statsRow}>
        <Stat label="Base" value={`$${Number(entry.base_price).toFixed(2)}`} />
        <Stat label="Factor" value={`×${entry.condition_factor}`} />
        <Stat label="Referencias" value={entry.reference_count ?? '—'} />
        <Stat label="Fuente" value={entry.source === 'ebay' ? 'eBay' : 'Reglas internas'} />
      </div>

      {/* Actions */}
      <div style={actionsRow}>
        <RecalculateButton
          bookId={entry.book_id || entry.book_reference}
          onDone={() => {
            setHistory(null);
            if (onRecalculated) onRecalculated();
          }}
        />
        <button style={expandBtn} onClick={toggleExpand}>
          {expanded ? 'Ocultar detalle ↑' : 'Ver detalle ↓'}
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={expandedPanel}>
          <PricingExplanation decision={entry} />
          <div style={{ marginTop: '16px' }}>
            <PricingHistory history={history} loading={loadingHistory} />
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div style={stat}>
    <span style={statLabel}>{label}</span>
    <span style={statValue}>{value}</span>
  </div>
);

function conditionLabel(factor) {
  if (factor === 1.0) return 'NUEVO';
  if (factor === 0.75) return 'BUENO';
  if (factor === 0.5) return 'ACEPTABLE';
  if (factor === 0.25) return 'DETERIORADO';
  return `×${factor}`;
}

export default PricingCard;


const card = {
  background: '#020617',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
};

const titleGroup = { flex: 1 };

const bookRef = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#e2e8f0',
  margin: '0 0 8px',
  wordBreak: 'break-all',
};

const badgeRow = { display: 'flex', gap: '6px', flexWrap: 'wrap' };

const conditionBadge = (factor) => {
  const colors = {
    1.0:  { bg: '#052e16', color: '#22c55e' },
    0.75: { bg: '#0c1a3a', color: '#60a5fa' },
    0.5:  { bg: '#2d1a05', color: '#fb923c' },
    0.25: { bg: '#2b0a0a', color: '#f87171' },
  };
  const c = colors[factor] || { bg: '#1e293b', color: '#94a3b8' };
  return {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '20px',
    background: c.bg,
    color: c.color,
    fontWeight: '600',
    letterSpacing: '0.05em',
  };
};

const sourceBadge = (isFallback) => ({
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '20px',
  background: isFallback ? '#431407' : '#052e16',
  color: isFallback ? '#fb923c' : '#22c55e',
  fontWeight: '500',
});

const priceGroup = { textAlign: 'right' };
const priceLabel = { fontSize: '11px', color: '#64748b', margin: '0 0 2px' };
const priceValue = { fontSize: '22px', fontWeight: '700', color: '#60a5fa', margin: 0 };
const currencyLabel = { fontSize: '11px', color: '#475569', marginTop: '2px' };

const statsRow = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
  paddingTop: '12px',
  borderTop: '1px solid #0f172a',
};

const stat = { display: 'flex', flexDirection: 'column', gap: '2px' };
const statLabel = { fontSize: '11px', color: '#475569' };
const statValue = { fontSize: '13px', color: '#94a3b8', fontWeight: '500' };

const actionsRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const expandBtn = {
  background: 'transparent',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  color: '#64748b',
  fontSize: '12px',
  padding: '6px 12px',
  cursor: 'pointer',
};

const expandedPanel = {
  paddingTop: '14px',
  borderTop: '1px solid #0f172a',
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};
