import './Administracion.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Administracion = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="administracion">
        <div className="administracion__denied">
          <span className="administracion__denied-icon">🔒</span>
          <h2>Acceso restringido</h2>
          <p>No tenés permisos para acceder a esta sección. Necesitás ser administrador.</p>
          <button className="btn btn--primary" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const acciones = [
    {
      id: 'revisiones',
      icono: '📝',
      titulo: 'Revisión de contribuciones',
      descripcion: 'Revisá y aprobá o rechazá las contribuciones pendientes de los usuarios.',
      cta: 'Gestionar revisiones',
      ruta: '/admin/revisiones',
    },
    {
      id: 'eliminaciones',
      icono: '🗑️',
      titulo: 'Solicitudes de eliminación',
      descripcion: 'Administrá las solicitudes de eliminación de hechos enviadas por usuarios.',
      cta: 'Ver solicitudes',
      ruta: '/admin/eliminaciones',
    },
    {
      id: 'colecciones',
      icono: '📚',
      titulo: 'Gestión de colecciones',
      descripcion: 'Creá, editá y organizá las colecciones de hechos del sistema.',
      cta: 'Administrar colecciones',
      ruta: '/admin/colecciones',
    },
    {
      id: 'importaciones',
      icono: '📂',
      titulo: 'Importar datasets',
      descripcion: 'Importá un dataset que contega hechos a la base de datos del sistema',
      cta: 'Subir DataSet',
      ruta: '/admin/subirDataSet'
    }
  ];

  return (
    <div className="administracion">
      <button type="button" className="administracion__volver" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <header className="administracion__header">
        <p className="section-eyebrow">Panel de administración</p>
        <h1>Acciones de administrador</h1>
        <p>Gestioná las contribuciones, solicitudes y colecciones del sistema.</p>
      </header>

      <div className="administracion__grid">
        {acciones.map((accion) => (
          <button
            key={accion.id}
            type="button"
            className="administracion__card"
            onClick={() => navigate(accion.ruta)}
          >
            <span className="administracion__icono" aria-hidden>
              {accion.icono}
            </span>
            <div>
              <h3>{accion.titulo}</h3>
              <p>{accion.descripcion}</p>
              <span className="administracion__cta">{accion.cta}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
