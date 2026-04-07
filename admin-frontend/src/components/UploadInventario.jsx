import React, { useState, useRef } from "react";
import { uploadInventario, getBatchErrors } from "../services/inventoryService";

/* ─── Mapeo de mensajes de error a sugerencias de solución ──────────────── */
const SOLUCIONES = {
  book_reference: {
    keywords: ["book_reference"],
    solucion: 'Asegúrate de que la columna "book_reference" esté presente y tenga un valor único (ej: REF-001). No puede estar vacía.',
  },
  title: {
    keywords: ["title", "título"],
    solucion: 'La columna "title" es obligatoria y no puede estar vacía. Agrega el título del libro en esa fila.',
  },
  author: {
    keywords: ["author", "autor"],
    solucion: 'La columna "author" es obligatoria. Ingresa el nombre del autor en la celda correspondiente.',
  },
  quantity: {
    keywords: ["quantity_available", "negativo", "cantidad"],
    solucion: 'El campo "quantity_available" debe ser un número entero igual o mayor a 0. Corrige el valor de esa fila.',
  },
  format: {
    keywords: ["columnas requeridas", "required", "missing"],
    solucion: 'El archivo no tiene las columnas mínimas requeridas: title, author, book_reference, quantity_available. Revisa los encabezados del CSV.',
  },
  encoding: {
    keywords: ["unicode", "decode", "encoding", "utf"],
    solucion: 'El archivo tiene problemas de codificación. Guárdalo como UTF-8 desde Excel: Archivo → Guardar como → CSV UTF-8.',
  },
};

function getSolucion(mensaje) {
  const lower = mensaje.toLowerCase();
  for (const key of Object.values(SOLUCIONES)) {
    if (key.keywords.some((k) => lower.includes(k))) {
      return key.solucion;
    }
  }
  return "Revisa el valor de esa fila y asegúrate de que cumpla con el formato esperado del inventario.";
}

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const FORMATOS = ["csv", "xlsx", "xls"];

const UploadInventario = ({ onLoteCreado }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [estado, setEstado] = useState("idle"); // idle | uploading | success | error | sizeError | formatError
  const [archivo, setArchivo] = useState(null);
  const [resultado, setResultado] = useState(null);   // BatchResponse del backend
  const [errores, setErrores] = useState([]);          // ImportError[]
  const [errorMsg, setErrorMsg] = useState("");

  const validar = (file) => {
    if (!file) return null;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!FORMATOS.includes(ext)) {
      setEstado("formatError");
      setErrorMsg(`Formato no permitido: .${ext}. Solo se aceptan CSV, XLSX y XLS.`);
      return null;
    }

    if (file.size > MAX_BYTES) {
      setEstado("sizeError");
      setErrorMsg(
        `El archivo pesa ${(file.size / 1024 / 1024).toFixed(2)} MB y supera el límite de 15 MB. Divide el inventario en archivos más pequeños.`
      );
      return null;
    }

    return file;
  };

  /* ── Selección de archivo ────────────────────────────────────────────── */
  const handleFile = (file) => {
    const valid = validar(file);
    if (!valid) return;
    setArchivo(valid);
    setEstado("idle");
    setResultado(null);
    setErrores([]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!archivo) return;
    setEstado("uploading");
    setResultado(null);
    setErrores([]);

    try {
      const batch = await uploadInventario(archivo);
      setResultado(batch);

      if (batch.invalid_rows > 0) {
        try {
          const errs = await getBatchErrors(batch.id);
          setErrores(errs);
        } catch {
        }
      }

      setEstado("success");

      if (onLoteCreado) onLoteCreado(batch);
    } catch (err) {
      setEstado("error");
      setErrorMsg(
        err?.message || "No se pudo procesar el archivo. Verifica que el servicio de inventario esté activo."
      );
    }
  };

  const resetear = () => {
    setArchivo(null);
    setEstado("idle");
    setResultado(null);
    setErrores([]);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const hayErrores = errores.length > 0;
  const soloExitos = resultado && resultado.invalid_rows === 0;

  return (
    <section style={card}>
      <div style={cardHeader}>
        <div>
          <h2 style={cardTitle}>📂 Carga de Inventario</h2>
          <p style={cardSub}>
            Sube un archivo CSV, XLSX o XLS con los datos del inventario.
            Peso máximo: <strong style={{ color: "#f59e0b" }}>15 MB</strong>.
          </p>
        </div>
        {archivo && estado !== "uploading" && (
          <button style={btnReset} onClick={resetear} title="Limpiar">
            ✕ Limpiar
          </button>
        )}
      </div>

      {!resultado && estado !== "uploading" && (
        <div
          style={dropzone(dragging, !!archivo)}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {!archivo ? (
            <>
              <div style={dropIcon}>⬆️</div>
              <p style={dropTitle}>Arrastra el archivo aquí</p>
              <p style={dropSub}>o haz clic para seleccionarlo</p>
              <div style={formatsRow}>
                {FORMATOS.map((f) => (
                  <span key={f} style={formatBadge}>.{f}</span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={filePreview}>
                <span style={fileIcon}>📄</span>
                <div>
                  <p style={fileName}>{archivo.name}</p>
                  <p style={fileSize}>{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <span style={fileReplace}>Clic para cambiar</span>
              </div>
            </>
          )}
        </div>
      )}

      {(estado === "sizeError" || estado === "formatError") && (
        <div style={alertBox("#2b0a0a", "#ef4444")}>
          <span style={{ fontSize: "18px" }}>
            {estado === "sizeError" ? "⚠️" : "🚫"}
          </span>
          <div>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              {estado === "sizeError" ? "Archivo demasiado grande" : "Formato no permitido"}
            </strong>
            <span style={{ fontSize: "13px", color: "#fca5a5" }}>{errorMsg}</span>
          </div>
        </div>
      )}

      {archivo && !resultado && estado !== "uploading" &&
        estado !== "sizeError" && estado !== "formatError" && (
          <button style={btnUpload} onClick={handleUpload}>
            🚀 Cargar inventario
          </button>
        )}

      {estado === "uploading" && (
        <div style={loadingBlock}>
          <div style={spinner} />
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
            Procesando archivo...
          </p>
        </div>
      )}

      {estado === "error" && (
        <div style={alertBox("#2b0a0a", "#ef4444")}>
          <span style={{ fontSize: "20px" }}>❌</span>
          <div>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Error al procesar el archivo
            </strong>
            <span style={{ fontSize: "13px", color: "#fca5a5" }}>{errorMsg}</span>
          </div>
        </div>
      )}

      {resultado && (
        <div style={{ marginTop: "10px" }}>

          <div style={alertBox(soloExitos ? "#052e16" : "#1c1408", soloExitos ? "#22c55e" : "#f59e0b")}>
            <span style={{ fontSize: "22px" }}>{soloExitos ? "✅" : "⚠️"}</span>
            <div>
              <strong style={{ display: "block", marginBottom: "4px", fontSize: "15px" }}>
                {soloExitos
                  ? "¡Archivo cargado exitosamente!"
                  : "Archivo procesado con errores"}
              </strong>
              <span style={{ fontSize: "12px", color: soloExitos ? "#86efac" : "#fde68a" }}>
                Lote ID #{resultado.id} · {resultado.file_name}
              </span>
            </div>
          </div>

          {/* KPIs */}
          <div style={kpiRow}>
            <div style={kpi("#0f172a", "#94a3b8")}>
              <span style={kpiNum}>{resultado.processed_rows}</span>
              <span style={kpiLabel}>Procesadas</span>
            </div>
            <div style={kpi("#052e16", "#22c55e")}>
              <span style={kpiNum}>{resultado.valid_rows}</span>
              <span style={kpiLabel}>✅ Cargadas</span>
            </div>
            <div style={kpi(resultado.invalid_rows > 0 ? "#2b0a0a" : "#0f172a",
              resultado.invalid_rows > 0 ? "#ef4444" : "#475569")}>
              <span style={kpiNum}>{resultado.invalid_rows}</span>
              <span style={kpiLabel}>❌ Con error</span>
            </div>
          </div>

          {/* Lista de errores detallados */}
          {hayErrores && (
            <div style={{ marginTop: "16px" }}>
              <h3 style={erroresTitle}>
                🔍 Errores detectados — {errores.length} fila{errores.length !== 1 ? "s" : ""} con problema
              </h3>
              <p style={erroresInfo}>
                Los registros con error <strong>no fueron guardados</strong>. Corrígelos en el archivo y vuelve a subirlos.
              </p>

              <div style={erroresList}>
                {errores.map((err, i) => (
                  <div key={err.id ?? i} style={errorCard}>
                    <div style={errorCardHeader}>
                      <span style={errorRowBadge}>Fila {err.row_number}</span>
                      <span style={errorTypeBadge}>{err.error_type}</span>
                    </div>

                    <p style={errorMsg2}>
                      <strong style={{ color: "#fca5a5" }}>❌ Error:</strong> {err.message}
                    </p>

                    <p style={errorSolucion}>
                      <strong style={{ color: "#86efac" }}>💡 Solución:</strong>{" "}
                      {getSolucion(err.message)}
                    </p>

                    {err.raw_data && (
                      <details style={{ marginTop: "6px" }}>
                        <summary style={{ fontSize: "11px", color: "#64748b", cursor: "pointer" }}>
                          Ver datos originales de la fila
                        </summary>
                        <pre style={rawDataPre}>{err.raw_data}</pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón cargar otro */}
          <button style={btnSecondary} onClick={resetear}>
            📂 Cargar otro archivo
          </button>
        </div>
      )}
    </section>
  );
};

export default UploadInventario;

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "24px",
  marginBottom: "28px",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "18px",
};

const cardTitle = {
  fontSize: "16px",
  margin: 0,
  color: "#f1f5f9",
};

const cardSub = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "4px",
};

const dropzone = (dragging, hasFile) => ({
  border: `2px dashed ${dragging ? "#3b82f6" : hasFile ? "#22c55e" : "#334155"}`,
  borderRadius: "10px",
  padding: "32px 20px",
  textAlign: "center",
  cursor: "pointer",
  background: dragging ? "rgba(59,130,246,0.05)" : hasFile ? "rgba(34,197,94,0.05)" : "rgba(30,41,59,0.4)",
  transition: "all 0.2s ease",
  marginBottom: "16px",
});

const dropIcon = { fontSize: "32px", marginBottom: "10px" };

const dropTitle = {
  fontSize: "15px",
  color: "#e2e8f0",
  margin: "0 0 4px",
};

const dropSub = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 14px",
};

const formatsRow = {
  display: "flex",
  justifyContent: "center",
  gap: "8px",
};

const formatBadge = {
  background: "#1e293b",
  color: "#94a3b8",
  padding: "3px 10px",
  borderRadius: "20px",
  fontSize: "11px",
};

const filePreview = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  justifyContent: "center",
};

const fileIcon = { fontSize: "30px" };

const fileName = {
  margin: 0,
  fontSize: "14px",
  color: "#e2e8f0",
  fontWeight: "500",
};

const fileSize = {
  margin: "2px 0 0",
  fontSize: "11px",
  color: "#64748b",
};

const fileReplace = {
  fontSize: "11px",
  color: "#3b82f6",
  marginLeft: "10px",
};

const alertBox = (bg, color) => ({
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  background: bg,
  border: `1px solid ${color}22`,
  borderLeft: `4px solid ${color}`,
  borderRadius: "8px",
  padding: "14px 16px",
  marginBottom: "12px",
  color: color,
});

const btnUpload = {
  width: "100%",
  padding: "12px",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  border: "none",
  borderRadius: "8px",
  color: "white",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  letterSpacing: "0.3px",
  boxShadow: "0 4px 15px rgba(37,99,235,0.3)",
  transition: "opacity 0.15s",
};

const btnReset = {
  background: "transparent",
  border: "1px solid #334155",
  color: "#94a3b8",
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "12px",
  cursor: "pointer",
};

const btnSecondary = {
  marginTop: "16px",
  padding: "10px 20px",
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#94a3b8",
  fontSize: "13px",
  cursor: "pointer",
};

const loadingBlock = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  justifyContent: "center",
  padding: "24px",
};

const spinner = {
  width: "26px",
  height: "26px",
  border: "3px solid #1e293b",
  borderTop: "3px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

const kpiRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "10px",
  margin: "12px 0",
};

const kpi = (bg, color) => ({
  background: bg,
  border: `1px solid ${color}33`,
  borderRadius: "8px",
  padding: "14px 10px",
  textAlign: "center",
  color,
});

const kpiNum = {
  display: "block",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: 1,
};

const kpiLabel = {
  display: "block",
  fontSize: "11px",
  marginTop: "4px",
  opacity: 0.8,
};

const erroresTitle = {
  fontSize: "14px",
  color: "#f1f5f9",
  margin: "0 0 6px",
};

const erroresInfo = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 12px",
};

const erroresList = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  maxHeight: "380px",
  overflowY: "auto",
  paddingRight: "4px",
};

const errorCard = {
  background: "#0f172a",
  border: "1px solid #3f1515",
  borderLeft: "4px solid #ef4444",
  borderRadius: "8px",
  padding: "12px 14px",
};

const errorCardHeader = {
  display: "flex",
  gap: "8px",
  marginBottom: "8px",
};

const errorRowBadge = {
  background: "#1e293b",
  color: "#94a3b8",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "11px",
  fontWeight: "600",
};

const errorTypeBadge = {
  background: "#2b0a0a",
  color: "#fca5a5",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "11px",
};

const errorMsg2 = {
  fontSize: "13px",
  color: "#cbd5e1",
  margin: "0 0 6px",
};

const errorSolucion = {
  fontSize: "12px",
  color: "#cbd5e1",
  margin: 0,
  padding: "8px 10px",
  background: "#052e16",
  borderRadius: "6px",
  lineHeight: 1.5,
};

const rawDataPre = {
  fontSize: "10px",
  color: "#64748b",
  background: "#020617",
  padding: "8px",
  borderRadius: "4px",
  overflowX: "auto",
  marginTop: "6px",
};
