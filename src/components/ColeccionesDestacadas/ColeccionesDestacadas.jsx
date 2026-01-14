import { useNavigate } from "react-router-dom";
import './ColeccionesDestacadas.css';

const formatearFecha = (valor) => {
  if (!valor) return '-';

  const fecha = new Date(valor);

  if (isNaN(fecha.getTime())) return 'Fecha inválida';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
};



export const ColeccionesDestacadas = ({ colecciones = [], cargando, onExplorar }) => {
const navigate = useNavigate();
const destacadas = Array.isArray(colecciones) ? colecciones.slice(0, 3) : [];
  return (
    <section className="colecciones-destacadas" id="colecciones-destacadas">
      <header>
        <div>
          <h2>Colecciones Destacadas</h2>
          <p>Algunas de las colecciones que concentran más hechos...</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onExplorar}>
          Ver explorador completo
        </button>
      </header>

      {cargando ? (
        <div className="colecciones-destacadas__loader">Cargando colecciones...</div>
      ) : destacadas.length ? (
        <div className="colecciones-destacadas__grid">
          {destacadas.map((coleccion) => (
            <article key={coleccion.id_coleccion} className="coleccion-card" onClick={() => navigate(`/colecciones/${coleccion.id_coleccion}/hechos`)}
          style={{ cursor: "pointer" }}>
              <div className="coleccion-card__meta">
                <span className="coleccion-card__estado">{coleccion.estado}</span>
                <span>{coleccion.consenso}</span>
              </div>
              <h3>{coleccion.titulo}</h3>
              <p>{coleccion.descripcion}</p>

              <ul className="coleccion-card__tags">
                {(coleccion.tags || []).slice(0, 3).map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>

              <div className="coleccion-card__stats">
                <div>
                  <strong>{coleccion.cantidadHechos}</strong>
                  <span>hechos</span>
                </div>
                <div>
                  <strong>{coleccion.fuentes?.length || 0}</strong>
                  <span>loaders</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="colecciones-destacadas__loader">Sin colecciones para mostrar todavía.</div>
      )}
    </section>
  );
};
