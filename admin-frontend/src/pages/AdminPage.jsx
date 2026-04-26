import React, { useEffect, useState } from "react";
import { getLotes } from "../services/inventoryService";
import { getAuditEvents, getAuditDecisionById } from "../services/auditService";
import TablaLotes from "../components/TablaLotes";
import Filtros from "../components/Filtros";
import DetalleLote from "../components/DetalleLote";
import Resumen from "../components/Resumen";
import GraficaResumen from "../components/GraficaResumen";
import AuditSummary from "../components/AuditSummary";
import AuditTable from "../components/AuditTable";
import AuditDetail from "../components/AuditDetail";

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState("inventory");
  const [lotes, setLotes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const [audits, setAudits] = useState([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFiltro, setAuditFiltro] = useState("");
  const [auditPage, setAuditPage] = useState(1);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);

  const lotesPorPagina = 5;
  const auditsPorPagina = 6;

  useEffect(() => {
    getLotes().then(setLotes);
  }, []);

  useEffect(() => {
    if (activeSection === "audit" && audits.length === 0) {
      setAuditLoading(true);
      setAuditError(null);
      getAuditEvents()
        .then(setAudits)
        .catch((error) => setAuditError(error.message || "Error cargando auditoría"))
        .finally(() => setAuditLoading(false));
    }
  }, [activeSection, audits.length]);

  const openAuditDetail = async (item) => {
    setSelectedAudit(null);
    try {
      const detail = await getAuditDecisionById(item.id);
      setSelectedAudit(detail || item);
    } catch (error) {
      console.warn("Detail fetch failed", error);
      setSelectedAudit(item);
    }
  };

  const filtrados = lotes.filter((l) => {
    const coincideEstado = filtroEstado === "" || l.estado === filtroEstado;
    const coincideBusqueda =
      l.estado.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.id.toString().includes(busqueda);

    return coincideEstado && coincideBusqueda;
  });

  const auditFiltrados = audits.filter((item) => {
    const coincideFiltro = auditFiltro === "" || item.estado === auditFiltro;
    const coincideBusqueda =
      item.module.toLowerCase().includes(auditSearch.toLowerCase()) ||
      item.decision.toLowerCase().includes(auditSearch.toLowerCase()) ||
      item.source.toLowerCase().includes(auditSearch.toLowerCase()) ||
      item.id.toString().includes(auditSearch);

    return coincideFiltro && coincideBusqueda;
  });

  const inicio = (pagina - 1) * lotesPorPagina;
  const fin = inicio + lotesPorPagina;
  const paginados = filtrados.slice(inicio, fin);

  const auditInicio = (auditPage - 1) * auditsPorPagina;
  const auditFin = auditInicio + auditsPorPagina;
  const auditPaginados = auditFiltrados.slice(auditInicio, auditFin);

  const totalPaginas = Math.ceil(filtrados.length / lotesPorPagina);
  const totalAuditPages = Math.max(1, Math.ceil(auditFiltrados.length / auditsPorPagina));

  return (
    <div style={layout}>
      {/* SIDEBAR */}
      <aside style={sidebar}>
        <h2 style={logo}>BookFlow</h2>
        <div style={navGroup}>
          <button
            style={activeSection === "inventory" ? activeNavItem : navItem}
            onClick={() => setActiveSection("inventory")}
          >
            Inventario
          </button>
          <button
            style={activeSection === "audit" ? activeNavItem : navItem}
            onClick={() => setActiveSection("audit")}
          >
            Auditoría
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main style={main}>
        <div style={header}>
          <h1 style={title}>
            {activeSection === "inventory" ? "Panel de Inventario" : "Panel de Auditoría"}
          </h1>
          <p style={subtitle}>
            {activeSection === "inventory"
              ? "Monitoreo y control de cargas de datos"
              : "Historial de decisiones, anomalías y trazabilidad de precios."}
          </p>
        </div>

        {activeSection === "inventory" ? (
          <>
            <Resumen lotes={lotes} />
            <GraficaResumen lotes={lotes} />

            <input
              type="text"
              placeholder="Buscar registros..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              style={input}
            />

            <Filtros setFiltroEstado={setFiltroEstado} />
            <TablaLotes lotes={paginados} onSelect={setLoteSeleccionado} />

            <div style={paginacion}>
              <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
                Anterior
              </button>
              <span>Página {pagina} de {totalPaginas || 1}</span>
              <button
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <>
            <AuditSummary audits={audits} />

            <input
              type="text"
              placeholder="Buscar auditoría..."
              value={auditSearch}
              onChange={(e) => {
                setAuditSearch(e.target.value);
                setAuditPage(1);
              }}
              style={input}
            />

            {auditLoading && <p style={infoText}>Cargando auditoría...</p>}
            {auditError && <p style={errorText}>{auditError}</p>}
            <div style={filtersRow}>
              {[
                { label: "Todos", value: "" },
                { label: "Aprobado", value: "APROBADO" },
                { label: "Anomalía", value: "ANOMALÍA" },
                { label: "Error", value: "ERROR" },
              ].map((item) => (
                <button
                  key={item.value}
                  style={auditFiltro === item.value ? activeFilterBtn : filterBtn}
                  onClick={() => {
                    setAuditFiltro(item.value);
                    setAuditPage(1);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <AuditTable audits={auditPaginados} onSelect={openAuditDetail} />

            <div style={paginacion}>
              <button disabled={auditPage === 1} onClick={() => setAuditPage(auditPage - 1)}>
                Anterior
              </button>
              <span>Página {auditPage} de {totalAuditPages}</span>
              <button
                disabled={auditPage === totalAuditPages}
                onClick={() => setAuditPage(auditPage + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>

      <DetalleLote lote={loteSeleccionado} cerrar={() => setLoteSeleccionado(null)} />
      <AuditDetail audit={selectedAudit} cerrar={() => setSelectedAudit(null)} />
    </div>
  );
};

export default AdminPage;

/* ================= ESTILOS ================= */

const layout = {
  display: "flex",
  height: "100vh",
  background: "#020617",
};

const sidebar = {
  width: "220px",
  background: "#020617",
  borderRight: "1px solid #1e293b",
  padding: "20px",
};

const logo = {
  marginBottom: "30px",
  fontSize: "18px",
  fontWeight: "600",
};

const navGroup = {
  display: "grid",
  gap: "10px",
};

const navItem = {
  background: "transparent",
  border: "1px solid #1e293b",
  color: "#94a3b8",
  padding: "10px 14px",
  borderRadius: "10px",
  textAlign: "left",
  cursor: "pointer",
};

const activeNavItem = {
  ...navItem,
  background: "#1e293b",
  color: "#e2e8f0",
};

const main = {
  flex: 1,
  padding: "30px",
  overflowY: "auto",
};

const header = {
  marginBottom: "25px",
};

const title = {
  fontSize: "22px",
  margin: 0,
};

const subtitle = {
  color: "#64748b",
  marginTop: "5px",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "6px",
  color: "white",
};

const filtersRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const infoText = {
  color: "#93c5fd",
  marginBottom: "15px",
};

const errorText = {
  color: "#f87171",
  marginBottom: "15px",
};

const filterBtn = {
  background: "transparent",
  border: "1px solid #1e293b",
  color: "#e2e8f0",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

const activeFilterBtn = {
  ...filterBtn,
  background: "#1e293b",
};

const paginacion = {
  marginTop: "15px",
  display: "flex",
  justifyContent: "center",
  gap: "10px",
};
