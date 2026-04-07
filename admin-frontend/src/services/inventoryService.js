const BFF = process.env.REACT_APP_BFF_URL || "http://localhost:8009";

/* ── Obtener lista de lotes (reales desde el backend) ─────────────── */
export const getLotes = async () => {
  try {
    const res = await fetch(`${BFF}/api/inventory/batches/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Normaliza campos para que coincidan con el frontend actual
    return data.map((b) => ({
      id: b.id,
      estado: normalizeStatus(b.status),
      file_name: b.file_name,
      processed_rows: b.processed_rows,
      valid_rows: b.valid_rows,
      invalid_rows: b.invalid_rows,
      upload_date: b.upload_date,
    }));
  } catch {
    // Fallback mock si el backend no está disponible
    return [
      { id: 1, estado: "COMPLETADO", file_name: "sample.csv", processed_rows: 100, valid_rows: 95, invalid_rows: 5 },
      { id: 2, estado: "ERROR",      file_name: "lote2.xlsx", processed_rows: 50,  valid_rows: 30, invalid_rows: 20 },
      { id: 3, estado: "PROCESADO",  file_name: "lote3.csv",  processed_rows: 80,  valid_rows: 80, invalid_rows: 0 },
    ];
  }
};

/* ── Subir archivo de inventario (CSV / XLSX / XLS) ──────────────── */
export const uploadInventario = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BFF}/api/inventory/batches/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let detail = `Error HTTP ${res.status}`;
    try {
      const json = await res.json();
      detail = json.detail || detail;
    } catch {}
    throw new Error(detail);
  }

  return res.json(); // BatchResponse
};

/* ── Obtener errores detallados de un lote ───────────────────────── */
export const getBatchErrors = async (batchId) => {
  const res = await fetch(`${BFF}/api/inventory/batches/${batchId}/errors`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // ImportError[]
};

/* ── Helper: normaliza status del backend al español ─────────────── */
function normalizeStatus(status) {
  const map = {
    completed: "COMPLETADO",
    failed: "ERROR",
    pending: "PENDIENTE",
    processing: "PROCESANDO",
  };
  return map[status?.toLowerCase()] || status?.toUpperCase() || "DESCONOCIDO";
}

/* ── EXPORTAR LOTE A CATÁLOGO (Y ENRIQUECER) ─────────────────────── */
export const exportBatchToCatalog = async (batchId) => {
  const resItems = await fetch(`${BFF}/api/inventory/batches/${batchId}/items`);
  if (!resItems.ok) throw new Error("No se obtuvieron items del lote");
  const items = await resItems.json();

  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      // 1. Opcional: Enriquecer metadatos (mock IA)
      const enrichRes = await fetch(`${BFF}/api/enrichment/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_reference: item.book_reference,
          title: item.title,
          author: item.author,
          isbn: item.isbn || undefined // No enviar nada si no hay ISBN real 
        })
      });
      
      let enrichedData = {};
      if (enrichRes.ok) {
        enrichedData = await enrichRes.json();
      }

      const categoryMap = { 
        "Ficción": 1, "No Ficción": 2, "Ciencia": 3, "Historia": 4, 
        "Filosofía": 5, "Tecnología": 6, "Arte": 7, "Economía": 8 
      };

      // 2. Crear y publicar libro en Catálogo
      const bookData = {
        title: enrichedData.normalized_title || item.title,
        author: enrichedData.normalized_author || item.author,
        isbn: item.isbn || undefined,
        description: enrichedData.description || "Sin descripción detallada.",
        cover_url: enrichedData.cover_url || undefined,
        category_id: categoryMap[enrichedData.category] || null,
        published_flag: true // Directo a la vitrina
      };
      
      const res = await fetch(`${BFF}/api/catalog/books/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData)
      });
      
      if (res.ok) successCount++;
      else errorCount++;
      
    } catch {
      errorCount++;
    }
  }

  return { successCount, errorCount, total: items.length };
};