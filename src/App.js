import './App.css';
import { useEffect } from 'react';
import { Routes, Route, Outlet} from 'react-router-dom';
import { Home } from './features/home/Home';
import { Colecciones } from './features/colecciones/Colecciones';
import { ColeccionDetalle } from './features/coleccion-detalle/ColeccionDetalle';
import { HechoDetalle } from './features/hecho-detalle/HechoDetalle';
import { NuevaContribucion } from './features/nueva-contribucion/NuevaContribucion';
import { Administracion } from './features/administracion/Administracion';
import { Estadisticas } from './features/estadisticas/Estadisticas';
import { GestionColecciones } from './features/gestion-colecciones/GestionColecciones';
import { GestionSolicitudes } from './features/gestion-solicitudes/GestionSolicitudes';
import { GestionRevisiones } from './features/gestion-revisiones/GestionRevisiones';
import { ContribucionDetalle } from './features/contribucion-detalle/ContribucionDetalle';
import { MisContribuciones } from './features/mis-contribuciones/MisContribuciones';
import { CollectionsProvider } from './context/CollectionsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { HechosListNav } from './components/HechoListaNav/HechoListNav';
import { ScrollToTopButton } from './components/ScrollToTopButton/ScrollToTopButton';
import { ImportacionDataSet} from './features/importacionesDataSets/ImportacionDataSet'
import { NavigationProvider } from './context/NavigationContext';
import GestorUsuarios from "./features/gestor-usuarios/GestorUsuarios";
// MONITOREO PROACTIVO (AGREGADO)
import { SystemStatusProvider } from './context/SystemStatusContext';
import ErrorBoundary from './monitoring/ErrorBoundary';
import { useBackendMonitor } from './monitoring/useBackendMonitor';
import { useConnectivityMonitor } from './monitoring/ConnectivityMonitor';
import { initGlobalErrorHandler } from './monitoring/GlobalErrorHandler';
import { useSystemStatus } from './context/SystemStatusContext';
import { SystemStatusBanner } from './components/SystemStatusBanner';
// ... importaciones ...

const AppShell = () => {
  const { login, logout, isAuthenticated, user } = useAuth();
  
  const handleSearch = (query) => console.info('Buscar:', query);

  // MONITOREO PROACTIVO (AGREGADO)
  const { backendUp, online } = useSystemStatus();
  useBackendMonitor();
  useConnectivityMonitor();


  return (
    <div className="app-shell">
      {/* MONITOREO VISUAL (AGREGADO) */}
      <SystemStatusBanner />
      <Header
        onSearch={handleSearch}
        onLogin={login}
        onLogout={logout}
        isAuthenticated={isAuthenticated}
        user={user}
      />
      <main>
        <Routes>
          {/* GRUPO 1: RUTAS PÚBLICAS 
             Estas SÍ necesitan los datos de la API pública.
             Usamos un Route sin path que envuelve a las demás con el Provider.
          */}
          <Route element={
            <CollectionsProvider>
              <Outlet />
            </CollectionsProvider>
          }>
            <Route path="/" element={<Home onLogin={login} isAuthenticated={isAuthenticated} />} />
            <Route path="/colecciones" element={<Colecciones />} />
            <Route path="/colecciones/:id/hechos" element={<ColeccionDetalle />} />
            <Route path="/hechos/:id" element={<HechoDetalle />} />
            <Route path="/hechos" element={<HechosListNav/>}/>
            <Route path="/contribuir" element={<NuevaContribucion />} />
            <Route path="/mis-contribuciones" element={<MisContribuciones />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
          </Route>

          {/* GRUPO 2: RUTAS DE ADMINISTRACIÓN 
             Estas NO tendrán el CollectionsProvider, por lo que no llamarán a la API Pública.
             Solo llamarán a lo que pidan sus propios componentes (API Admin).
          */}
          <Route path="/admin" element={<Administracion />} />
          <Route path="/admin/colecciones" element={<GestionColecciones />} />
          <Route path="/admin/eliminaciones" element={<GestionSolicitudes />} />
          <Route path="/admin/revisiones" element={<GestionRevisiones />} />
          <Route path="/admin/revisiones/detalle" element={<ContribucionDetalle />} />
          <Route path="/admin/subirDataSet" element={<ImportacionDataSet/>}/>   
          <Route path="/perfil" element={<GestorUsuarios />} />
        </Routes>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

function App() {
  useEffect(() => {
    initGlobalErrorHandler();
  }, []);
  return (
    <SystemStatusProvider> {/* AGREGADO PARA MONITOREO */}
      <ErrorBoundary> {/* AGREGADO PARA MONITOREO  */}
        <AuthProvider>
          <NavigationProvider>
          {/* ELIMINAMOS CollectionsProvider DE AQUÍ PARA QUE NO SEA GLOBAL */}
            <AppShell />
          </NavigationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SystemStatusProvider>
  );
}

export default App;


/*
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
          <Route path="/colecciones/:id/hechos" element={<ColeccionDetalle />} />
          <Route path="/hechos/:id" element={<HechoDetalle />} />
          <Route path="/hechos" element={<HechosListNav/>}/>
          <Route path="/contribuir" element={<NuevaContribucion />} />
          <Route path="/mis-contribuciones" element={<MisContribuciones />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/admin" element={<Administracion />} />
          <Route path="/admin/colecciones" element={<GestionColecciones />} />
          <Route path="/admin/eliminaciones" element={<GestionSolicitudes />} />
          <Route path="/admin/revisiones" element={<GestionRevisiones />} />
          <Route path="/admin/revisiones/detalle" element={<ContribucionDetalle />} />
        </Routes>
      </main>
      <Footer />
      <ScrollToTopButton />
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
*/