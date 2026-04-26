import { useState } from "react";
import styles from "./Layout.module.css";
import ReportesPage from "../pages/ReportesPage";
import ConfiguracionPage from "../pages/ConfiguracionPage";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const [view, setView] = useState("dashboard");

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return children;
      case "reportes":
        return <ReportesPage />;
      case "configuracion":
        return <ConfiguracionPage />;
      default:
        return children;
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Pricing Admin</h2>

        <nav className={styles.nav}>
          <div
            className={view === "dashboard" ? styles.active : ""}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </div>

          <div
            className={view === "reportes" ? styles.active : ""}
            onClick={() => setView("reportes")}
          >
            Reportes
          </div>

          <div
            className={view === "configuracion" ? styles.active : ""}
            onClick={() => setView("configuracion")}
          >
            Configuración
          </div>
        </nav>
      </aside>

      <main className={styles.main}>{renderContent()}</main>
    </div>
  );
};

export default Layout;