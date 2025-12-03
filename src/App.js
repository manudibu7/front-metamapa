import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Home } from './features/home/Home';
import { Colecciones } from './features/colecciones/Colecciones';
import { ColeccionDetalle } from './features/coleccion-detalle/ColeccionDetalle';
import { HechoDetalle } from './features/hecho-detalle/HechoDetalle';
import { NuevaContribucion } from './features/nueva-contribucion/NuevaContribucion';
import { Administracion } from './features/administracion/Administracion';
import { Estadisticas } from './features/estadisticas/Estadisticas';
import { GestionColecciones } from './features/gestion-colecciones/GestionColecciones';
import { GestionSolicitudes } from './features/gestion-solicitudes/GestionSolicitudes';
import { CollectionsProvider } from './context/CollectionsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

const AppShell = () => {
  const { login, logout, isAuthenticated, user } = useAuth();

  const handleSearch = (query) => {
    // Placeholder to integrate with API filters later
    console.info('Buscar hechos:', query);
  };

  return (
    <div className="app-shell">
      <Header
        onSearch={handleSearch}
        onLogin={login}
        onLogout={logout}
        isAuthenticated={isAuthenticated}
        user={user}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home onLogin={login} isAuthenticated={isAuthenticated} />} />
          <Route path="/colecciones" element={<Colecciones />} />
          <Route path="/colecciones/:id" element={<ColeccionDetalle />} />
          <Route path="/hechos/:id" element={<HechoDetalle />} />
          <Route path="/contribuir" element={<NuevaContribucion />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/admin" element={<Administracion />} />
          <Route path="/admin/colecciones" element={<GestionColecciones />} />
          <Route path="/admin/eliminaciones" element={<GestionSolicitudes />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CollectionsProvider>
        <AppShell />
      </CollectionsProvider>
    </AuthProvider>
  );
}

export default App;
