import React, { useState } from 'react';
import { recalculatePrice } from '../../services/pricingService';

const RecalculateButton = ({ bookId, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    try {
      await recalculatePrice({ book_id: bookId });
      if (onDone) onDone();
    } catch (err) {
      setError(err.message || 'Error al recalcular');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <button style={btn(loading)} onClick={handle} disabled={loading}>
        {loading ? (
          <span style={spinnerWrap}>
            <span style={spinner} />
            Calculando...
          </span>
        ) : (
          '↻ Recalcular precio'
        )}
      </button>
      {error && <p style={errText}>{error}</p>}
    </div>
  );
};

export default RecalculateButton;


const wrap = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' };

const btn = (loading) => ({
  background: loading ? '#1e293b' : '#1d4ed8',
  border: 'none',
  borderRadius: '8px',
  color: loading ? '#64748b' : '#e2e8f0',
  fontSize: '13px',
  fontWeight: '500',
  padding: '8px 16px',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'background 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const spinnerWrap = { display: 'flex', alignItems: 'center', gap: '8px' };

const spinner = {
  width: '12px',
  height: '12px',
  border: '2px solid #334155',
  borderTop: '2px solid #60a5fa',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  display: 'inline-block',
};

const errText = { fontSize: '12px', color: '#f87171', margin: 0 };
