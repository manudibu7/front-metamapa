import './ColeccionesDestacadas.css';

const formatearFecha = (valor) =>
  new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(valor));

export const ColeccionesDestacadas = ({ colecciones = [], cargando, onExplorar }) => {
  const destacadas = colecciones.slice(0, 3);

  return (
    <section className="colecciones-destacadas" id="colecciones-destacadas">
      <header>
        <p className="section-eyebrow">Colecciones destacadas</p>
        <div>
          <h2>Lo más confiable del ecosistema</h2>
          <p>Panel rápido con las colecciones que concentran más hechos, últimas sincronizaciones y loaders conectados.</p>
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
            <article key={coleccion.id} className="coleccion-card">
              <div className="coleccion-card__meta">
                <span className="coleccion-card__estado">{coleccion.estado}</span>
                <span>{coleccion.consenso}</span>
              </div>
              <h3>{coleccion.titulo}</h3>
              <p>{coleccion.descripcion}</p>

              <ul className="coleccion-card__tags">
                {coleccion.tags.slice(0, 3).map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>

              <div className="coleccion-card__stats">
                <div>
                  <strong>{coleccion.totalHechos}</strong>
                  <span>hechos</span>
                </div>
                <div>
                  <strong>{coleccion.fuentes.length}</strong>
                  <span>loaders</span>
                </div>
                <div>
                  <strong>{formatearFecha(coleccion.ultimaActualizacion)}</strong>
                  <span>última sync</span>
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
