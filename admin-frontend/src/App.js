import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import InventarioPage from './pages/InventarioPage';
import ReportesPage from './pages/ReportesPage';
import PreciosPage from './pages/PreciosPage';

const PAGES = {
  dashboard:  DashboardPage,
  inventario: InventarioPage,
  reportes:   ReportesPage,
  precios:    PreciosPage,
};

function App() {
  const [paginaActual, setPaginaActual] = useState('dashboard');
  const Pagina = PAGES[paginaActual] || DashboardPage;

  return (
    <div style={layout}>
      <Sidebar paginaActual={paginaActual} onNavegar={setPaginaActual} />
      <Pagina onNavegar={setPaginaActual} />
    </div>
  );
}

export default App;

const layout = {
  display: 'flex',
  height: '100vh',
  background: '#020617',
  overflow: 'hidden',
};
