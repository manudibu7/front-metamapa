import { useNavigate } from 'react-router-dom';
import './AccionesRapidas.css';

const desplazarse = (id) => {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export const AccionesRapidas = ({ onVerColecciones }) => {
  const navigate = useNavigate();
  const acciones = [
    {
      id: 'mapa',
      icono: '🗺️',
      titulo: 'Mapa Leaflet',
      descripcion: 'Ubicá cada hecho activo de los loaders conectados.',
      cta: 'Ir al mapa',
      onClick: () => desplazarse('mapa-hechos'),
    },
    {
      id: 'colecciones',
      icono: '📚',
      titulo: 'Colecciones curadas',
      descripcion: 'Explorá datasets agregados con sus métricas clave.',
      cta: 'Abrir tablero',
      onClick: () => onVerColecciones?.(),
    },
    {
      id: 'contribuir',
      icono: '⚡',
      titulo: 'Subir contribución',
      descripcion: 'Cargá un nuevo hecho rápidamente.',
      cta: 'Completar formulario',
      onClick: () => navigate('/contribuir'),
    },
    {
      id: 'estadisticas',
      icono: '📈',
      titulo: 'Panel de estadísticas',
      descripcion: 'Explorá métricas clave del agregador.',
      cta: 'Ver estadísticas',
      onClick: () => navigate('/estadisticas'),
    },
  ];

  return (
    <section className="acciones-rapidas">
      <header>
        <p className="section-eyebrow">Barra rápida</p>
        <h2>Acciones inmediatas sobre el agregador</h2>
        <p>Todo lo esencial está a dos clics: mapa interactivo, colecciones curadas, carga express y estadisticas.</p>
      </header>

      <div className="acciones-rapidas__grid">
        {acciones.map((accion) => (
          <button key={accion.id} type="button" className="acciones-rapidas__card" onClick={accion.onClick}>
            <span className="acciones-rapidas__icono" aria-hidden>
              {accion.icono}
            </span>
            <div>
              <h3>{accion.titulo}</h3>
              <p>{accion.descripcion}</p>
              <span className="acciones-rapidas__cta">{accion.cta}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
