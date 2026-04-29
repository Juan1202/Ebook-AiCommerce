import { useState } from "react";
import styles from "./Layout.module.css";
import DashboardPage from "../pages/DashboardPage";
import InventarioPage from "../pages/InventarioPage";
import ReportesPage from "../pages/ReportesPage";
import ConfiguracionPage from "../pages/ConfiguracionPage";
import EnrichmentPage from "../pages/EnrichmentPage";
import PricingDashboard from "../components/pricing/PricingDashboard";

type View = "dashboard" | "inventario" | "precios" | "enriquecimiento" | "reportes" | "configuracion";

const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: "dashboard",      label: "Dashboard",       icon: "📊" },
  { id: "inventario",     label: "Inventario",      icon: "⊞" },
  { id: "precios",        label: "Precios IA",      icon: "💰" },
  { id: "enriquecimiento", label: "Enriquecimiento", icon: "📂" },
  { id: "reportes",       label: "Reportes",        icon: "📈" },
  { id: "configuracion",  label: "Configuración",   icon: "⚙️" },
];

const Layout = () => {
  const [view, setView] = useState<View>("dashboard");

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <DashboardPage onNavegar={(v) => setView(v as View)} />;
      case "inventario":
        return <InventarioPage />;
      case "precios":
        return <PricingDashboard />;
      case "enriquecimiento":
        return <EnrichmentPage />;
      case "reportes":
        return <ReportesPage />;
      case "configuracion":
        return <ConfiguracionPage />;
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logoWrap}>
          <span className={styles.logoIcon}>📚</span>
          <div>
            <h2 className={styles.logo}>BookFlow</h2>
            <span className={styles.logoSub}>Panel Admin</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${view === item.id ? styles.active : ""}`}
              onClick={() => setView(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className={styles.storeLink}
        >
          <span>🛒</span> Ir a la tienda →
        </a>
      </aside>

      <main className={styles.main}>{renderContent()}</main>
    </div>
  );
};

export default Layout;
