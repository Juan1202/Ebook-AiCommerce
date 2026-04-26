import React, { useEffect } from "react";

const AuditDetail = ({ audit, cerrar }) => {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [cerrar]);

  if (!audit) return null;

  return (
    <div style={overlay} onClick={cerrar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <div>
            <h2 style={title}>Detalle de Auditoría</h2>
            <p style={subtitle}>Revisión completa de la decisión seleccionada</p>
          </div>
          <button style={closeButton} onClick={cerrar}>
            ✕
          </button>
        </div>

        <div style={body}>
          <DetailRow label="ID" value={audit.id} />
          <DetailRow label="Fecha" value={audit.timestamp} />
          <DetailRow label="Módulo" value={audit.module} />
          <DetailRow label="Decisión" value={audit.decision} />
          <DetailRow label="Estado" value={audit.estado} />
          <DetailRow label="Anomalía" value={audit.anomaly ? "Sí" : "No"} />
          <DetailRow label="Origen" value={audit.source} />
          <DetailRow label="Precio original" value={`$ ${audit.originalValue.toFixed(2)}`} />
          <DetailRow label="Precio calculado" value={`$ ${audit.computedValue.toFixed(2)}`} />
          <DetailRow label="Regla aplicada" value={audit.rule} />
          <DetailRow label="Comentarios" value={audit.detail} multiline />
        </div>

        <div style={footer}>
          <button style={primaryBtn} onClick={cerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, multiline }) => (
  <div style={multiline ? multilineRow : row}>
    <span style={labelStyle}>{label}</span>
    <span style={multiline ? multilineValue : valueStyle}>{value}</span>
  </div>
);

export default AuditDetail;

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(2, 6, 23, 0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(6px)",
};

const modal = {
  width: "480px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  animation: "fadeIn 0.25s ease",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 20px",
  borderBottom: "1px solid #1e293b",
};

const title = {
  fontSize: "16px",
  margin: 0,
};

const subtitle = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "3px",
};

const closeButton = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  fontSize: "16px",
  cursor: "pointer",
};

const body = {
  padding: "20px",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "14px",
};

const multilineRow = {
  display: "block",
  marginBottom: "16px",
};

const labelStyle = {
  fontSize: "13px",
  color: "#64748b",
  width: "140px",
};

const valueStyle = {
  fontSize: "14px",
  fontWeight: "500",
};

const multilineValue = {
  display: "block",
  marginTop: "8px",
  fontSize: "14px",
  fontWeight: "500",
  lineHeight: "1.5",
};

const footer = {
  padding: "15px 20px",
  borderTop: "1px solid #1e293b",
  display: "flex",
  justifyContent: "flex-end",
};

const primaryBtn = {
  background: "#3b82f6",
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
};
