import { useEffect, useState } from "react";
import PricingCard from "./PricingCard";
import PricingFilters from "./PricingFilters";
import { getPricingList, bulkCalculate } from "../../services/pricingService";
import styles from "./PricingDashboard.module.css";

interface PricingItem {
  book_id: string;
  title: string;
  condition: string;
  price: number;
  isFallback: boolean;
}

const PricingDashboard = () => {
  const [data, setData] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPricingList();
      const items: PricingItem[] = (res.items || res || []).map((item: Record<string, unknown>) => ({
        book_id: String(item.book_id ?? item.id ?? ""),
        title: String(item.title ?? item.book_id ?? "Sin título"),
        condition: String(item.condition ?? "BUENO"),
        price: Number(item.suggested_price ?? item.price ?? 0),
        isFallback: Boolean(item.is_fallback ?? item.isFallback ?? false),
      }));
      setData(items);
    } catch {
      setError("No se pudo conectar con el servicio de pricing.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCalculate = async () => {
    setCalculating(true);
    setError("");
    try {
      await bulkCalculate();
      await load();
    } catch {
      setError("Error al calcular precios del catálogo.");
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = data.filter((item) => {
    if (filter === "verified") return !item.isFallback;
    if (filter === "estimated") return item.isFallback;
    return true;
  });

  const verifiedCount = data.filter((i) => !i.isFallback).length;
  const estimatedCount = data.filter((i) => i.isFallback).length;
  const avgPrice = data.length
    ? (data.reduce((s, i) => s + i.price, 0) / data.length).toFixed(2)
    : "0.00";

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Panel de Precios</h1>
          <p className={styles.pageSubtitle}>Motor de pricing inteligente con trazabilidad completa</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={styles.refreshBtn}
            onClick={handleBulkCalculate}
            disabled={calculating || loading}
          >
            {calculating ? "Calculando…" : "⚡ Calcular catálogo"}
          </button>
          <button className={styles.refreshBtn} onClick={load} disabled={loading || calculating}>
            {loading ? "Cargando…" : "↻ Actualizar"}
          </button>
        </div>
      </div>

      <div className={styles.kpiRow}>
        <div className={`${styles.kpi} ${styles.kpiBlue}`}>
          <span className={styles.kpiNum}>{data.length}</span>
          <span className={styles.kpiLabel}>Total libros</span>
        </div>
        <div className={`${styles.kpi} ${styles.kpiGreen}`}>
          <span className={styles.kpiNum}>{verifiedCount}</span>
          <span className={styles.kpiLabel}>Verificados</span>
        </div>
        <div className={`${styles.kpi} ${styles.kpiOrange}`}>
          <span className={styles.kpiNum}>{estimatedCount}</span>
          <span className={styles.kpiLabel}>Estimados</span>
        </div>
        <div className={`${styles.kpi} ${styles.kpiPurple}`}>
          <span className={styles.kpiNum}>${avgPrice}</span>
          <span className={styles.kpiLabel}>Precio promedio</span>
        </div>
      </div>

      <PricingFilters filter={filter} setFilter={setFilter} />

      {loading && (
        <div className={styles.stateWrap}>
          <div className={styles.spinner} />
          <p className={styles.stateText}>Obteniendo precios…</p>
        </div>
      )}

      {!loading && error && (
        <div className={styles.errorBox}>
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.stateWrap}>
          <p className={styles.stateText}>
            {data.length === 0
              ? "Aún no hay precios calculados. Usa ⚡ Calcular catálogo para iniciar."
              : "No hay libros con los filtros seleccionados."}
          </p>
          {data.length === 0 && (
            <button
              className={styles.refreshBtn}
              onClick={handleBulkCalculate}
              disabled={calculating}
              style={{ marginTop: "1rem" }}
            >
              {calculating ? "Calculando…" : "⚡ Calcular catálogo"}
            </button>
          )}
        </div>
      )}

      {!loading && !error && (
        <div className={styles.grid}>
          {filtered.map((item) => (
            <PricingCard key={item.book_id} data={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PricingDashboard;
