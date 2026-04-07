import React from "react";

const TablaLotes = ({ lotes, onSelect }) => {
  return (
    <div style={container}>
      <div style={header}>
        <span>ID</span>
        <span>Estado</span>
        <span>Válidos</span>
        <span>Inválidos</span>
        <span></span>
      </div>

      {lotes.map((l) => (
        <div key={l.id} style={row}>
          <span style={id}>{l.id}</span>

          <span style={getEstadoStyle(l.estado)}>
            {l.estado}
          </span>

          <span>{l.valid_rows}</span>
          <span>{l.invalid_rows}</span>

          <button style={button} onClick={() => onSelect(l)}>
            Ver
          </button>
        </div>
      ))}
    </div>
  );
};

export default TablaLotes;


/* ================= ESTILOS ================= */

const container = {
  marginTop: "20px",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  overflow: "hidden",
  background: "#020617"
};

const header = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 100px",
  padding: "14px 20px",
  fontSize: "12px",
  color: "#64748b",
  letterSpacing: "0.5px",
  borderBottom: "1px solid #1e293b"
};

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 100px",
  padding: "16px 20px",
  alignItems: "center",
  fontSize: "14px",
  borderBottom: "1px solid #1e293b",
  transition: "background 0.2s ease"
};

const id = {
  fontWeight: "500"
};

const button = {
  background: "transparent",
  border: "1px solid #1e293b",
  padding: "6px 10px",
  borderRadius: "6px",
  fontSize: "12px",
  cursor: "pointer",
  color: "#e2e8f0"
};

const getEstadoStyle = (estado) => {
  const base = {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    width: "fit-content"
  };

  if (estado === "COMPLETADO") {
    return { ...base, background: "#052e16", color: "#22c55e" };
  }

  if (estado === "ERROR") {
    return { ...base, background: "#2b0a0a", color: "#ef4444" };
  }

  return { ...base, background: "#3b2f0a", color: "#f59e0b" };
};