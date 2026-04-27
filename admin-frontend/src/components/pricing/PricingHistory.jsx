import React from 'react';

const PricingHistory = ({ history, loading }) => {
  if (loading) {
    return (
      <div style={wrap}>
        <h3 style={heading}>Historial de precios</h3>
        {Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div style={wrap}>
        <h3 style={heading}>Historial de precios</h3>
        <p style={emptyText}>Sin historial registrado.</p>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h3 style={heading}>Historial de precios</h3>
      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <Th>Fecha</Th>
              <Th>Precio sugerido</Th>
              <Th>Condición</Th>
              <Th>Fuente</Th>
              <Th>Referencias</Th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, i) => (
              <tr key={entry.id || i} style={i % 2 === 0 ? rowEven : rowOdd}>
                <Td>{formatDate(entry.created_at)}</Td>
                <Td highlight>${Number(entry.suggested_price).toFixed(2)}</Td>
                <Td>{entry.condition_factor != null ? conditionLabel(entry.condition_factor) : '—'}</Td>
                <Td>
                  <span style={sourceBadge(entry.is_fallback)}>
                    {entry.is_fallback ? 'Reglas internas' : 'eBay'}
                  </span>
                </Td>
                <Td>{entry.reference_count ?? '—'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Th = ({ children }) => <th style={thStyle}>{children}</th>;
const Td = ({ children, highlight }) => <td style={highlight ? tdHL : tdStyle}>{children}</td>;
const SkeletonRow = () => (
  <div style={skeletonRow}>
    <div style={skeletonCell(120)} />
    <div style={skeletonCell(80)} />
    <div style={skeletonCell(90)} />
    <div style={skeletonCell(70)} />
  </div>
);

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function conditionLabel(factor) {
  if (factor === 1.0) return 'NUEVO';
  if (factor === 0.75) return 'BUENO';
  if (factor === 0.5) return 'ACEPTABLE';
  if (factor === 0.25) return 'DETERIORADO';
  return `×${factor}`;
}

export default PricingHistory;


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

const tableWrap = { overflowX: 'auto' };

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
};

const thStyle = {
  textAlign: 'left',
  padding: '10px 14px',
  color: '#64748b',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #1e293b',
  fontWeight: '500',
  whiteSpace: 'nowrap',
};

const rowEven = { background: 'transparent' };
const rowOdd = { background: '#080f1a' };

const tdStyle = {
  padding: '12px 14px',
  color: '#94a3b8',
  borderBottom: '1px solid #0f172a',
  whiteSpace: 'nowrap',
};

const tdHL = {
  ...tdStyle,
  color: '#60a5fa',
  fontWeight: '600',
};

const sourceBadge = (isFallback) => ({
  fontSize: '11px',
  padding: '2px 8px',
  borderRadius: '20px',
  background: isFallback ? '#431407' : '#052e16',
  color: isFallback ? '#fb923c' : '#22c55e',
  fontWeight: '500',
});

const emptyText = { fontSize: '13px', color: '#475569' };

const skeletonRow = {
  display: 'flex',
  gap: '16px',
  padding: '12px 0',
  borderBottom: '1px solid #0f172a',
};

const skeletonCell = (w) => ({
  height: '14px',
  width: w,
  background: '#1e293b',
  borderRadius: '6px',
});
