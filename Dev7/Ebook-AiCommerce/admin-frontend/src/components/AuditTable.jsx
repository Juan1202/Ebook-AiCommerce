import React from "react";

const AuditTable = ({ audits, onSelect }) => {
  return (
    <div style={container}>
      <div style={header}>
        <span>ID</span>
        <span>Fecha</span>
        <span>Módulo</span>
        <span>Decisión</span>
        <span>Estado</span>
        <span></span>
      </div>

      {audits.map((item) => (
        <div key={item.id} style={row}>
          <span style={idStyle}>{item.id}</span>
          <span>{item.timestamp}</span>
          <span>{item.module}</span>
          <span>{item.decision}</span>
          <span style={getEstadoStyle(item.estado)}>{item.estado}</span>
          <button style={button} onClick={() => onSelect(item)}>
            Ver detalle
          </button>
        </div>
      ))}
    </div>
  );
};

export default AuditTable;

const container = {
  marginTop: "20px",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  overflow: "hidden",
  background: "#020617",
};

const header = {
  display: "grid",
  gridTemplateColumns: "60px 140px 140px 1fr 120px 120px",
  padding: "14px 20px",
  fontSize: "12px",
  color: "#64748b",
  letterSpacing: "0.5px",
  borderBottom: "1px solid #1e293b",
};

const row = {
  display: "grid",
  gridTemplateColumns: "60px 140px 140px 1fr 120px 120px",
  padding: "16px 20px",
  alignItems: "center",
  fontSize: "14px",
  borderBottom: "1px solid #1e293b",
  transition: "background 0.2s ease",
};

const idStyle = {
  fontWeight: "500",
};

const button = {
  background: "transparent",
  border: "1px solid #1e293b",
  padding: "6px 10px",
  borderRadius: "6px",
  fontSize: "12px",
  cursor: "pointer",
  color: "#e2e8f0",
};

const getEstadoStyle = (estado) => {
  const base = {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    width: "fit-content",
  };

  if (estado === "APROBADO") {
    return { ...base, background: "#052e16", color: "#22c55e" };
  }
  if (estado === "ERROR") {
    return { ...base, background: "#2b0a0a", color: "#ef4444" };
  }
  return { ...base, background: "#3b2f0a", color: "#f59e0b" };
};
