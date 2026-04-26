import React from "react";

const AuditSummary = ({ audits }) => {
  const total = audits.length;
  const anomalies = audits.filter((item) => item.anomaly).length;
  const approved = audits.filter((item) => item.estado === "APROBADO").length;
  const successRate = total ? Math.round((approved / total) * 100) : 0;

  return (
    <div style={container}>
      <Card title="Decisiones auditoría" value={total} />
      <Card title="Anomalías detectadas" value={anomalies} />
      <Card title="Tasa de aprobación" value={`${successRate}%`} />
    </div>
  );
};

const Card = ({ title, value }) => (
  <div style={card}>
    <p style={titleStyle}>{title}</p>
    <h2 style={valueStyle}>{value}</h2>
  </div>
);

export default AuditSummary;

const container = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "25px",
};

const card = {
  background: "#020617",
  border: "1px solid #1e293b",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
};

const titleStyle = {
  fontSize: "13px",
  color: "#94a3b8",
  marginBottom: "8px",
};

const valueStyle = {
  fontSize: "28px",
  fontWeight: "600",
  color: "#e2e8f0",
  margin: 0,
};
