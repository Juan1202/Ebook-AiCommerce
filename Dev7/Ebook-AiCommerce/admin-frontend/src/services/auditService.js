const auditDecisions = [
  {
    id: 101,
    timestamp: "2026-04-25 09:18",
    module: "Pricing",
    decision: "Precio ajustado",
    estado: "APROBADO",
    anomaly: false,
    source: "IA Pricing",
    originalValue: 95.0,
    computedValue: 109.5,
    rule: "Regla de margen mínimo",
    detail:
      "Se aplicó un aumento basado en la comparación de precios y el costo interno.",
  },
  {
    id: 102,
    timestamp: "2026-04-25 10:02",
    module: "Enrichment",
    decision: "Enriquecimiento completo",
    estado: "APROBADO",
    anomaly: false,
    source: "Enrichment API",
    originalValue: 160.0,
    computedValue: 158.4,
    rule: "Ajuste de competencia",
    detail:
      "Se validaron datos externos y se normalizó el precio con la tasa de cambio actual.",
  },
  {
    id: 103,
    timestamp: "2026-04-25 11:35",
    module: "Pricing",
    decision: "Precio fuera de rango",
    estado: "ANOMALÍA",
    anomaly: true,
    source: "IA Pricing",
    originalValue: 22.0,
    computedValue: 9.5,
    rule: "Detección de outlier",
    detail:
      "Precio calculado quedó por debajo del umbral mínimo. Se marcó para revisión manual.",
  },
  {
    id: 104,
    timestamp: "2026-04-25 12:42",
    module: "Enrichment",
    decision: "Datos incompletos",
    estado: "ERROR",
    anomaly: true,
    source: "Enrichment API",
    originalValue: 0,
    computedValue: 0,
    rule: "Validación de atributos",
    detail:
      "Faltó atributo de categoría y el registro quedó en estado de error para corrección.",
  },
  {
    id: 105,
    timestamp: "2026-04-25 13:15",
    module: "Pricing",
    decision: "Precio validado",
    estado: "APROBADO",
    anomaly: false,
    source: "IA Pricing",
    originalValue: 48.0,
    computedValue: 50.4,
    rule: "Margen objetivo",
    detail:
      "Se mantuvo el margen objetivo tras revisión de costos y demanda esperada.",
  },
];

const API_BASE = process.env.REACT_APP_BFF_URL || "";

export const getAuditEvents = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/audit`);
    if (!response.ok) {
      throw new Error(`API audit error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Audit API failed, returning fallback data:", error);
    return auditDecisions;
  }
};

export const getAuditDecisionById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/audit/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn("Audit detail API failed, using fallback data:", error);
    return auditDecisions.find((item) => item.id === id) || null;
  }
};
