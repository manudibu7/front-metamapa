import './FeaturedCollections.css';

const formatDate = (value) =>
  new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const FeaturedCollections = ({ collections = [], loading, onExplore }) => {
  const featured = collections.slice(0, 3);

  return (
    <section className="featured-collections" id="colecciones-destacadas">
      <header>
        <p className="section-eyebrow">Colecciones destacadas</p>
        <div>
          <h2>Lo más curado del ecosistema</h2>
          <p>
            Panel rápido con las colecciones que concentran más hechos, últimas sincronizaciones y loaders conectados.
          </p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onExplore}>
          Ver explorador completo
        </button>
      </header>

      {loading ? (
        <div className="featured-collections__loader">Cargando colecciones...</div>
      ) : featured.length ? (
        <div className="featured-collections__grid">
          {featured.map((collection) => (
            <article key={collection.id} className="featured-card">
              <div className="featured-card__meta">
                <span className="featured-card__status">{collection.estado}</span>
                <span>{collection.consenso}</span>
              </div>
              <h3>{collection.titulo}</h3>
              <p>{collection.descripcion}</p>

              <ul className="featured-card__tags">
                {collection.tags.slice(0, 3).map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>

              <div className="featured-card__stats">
                <div>
                  <strong>{collection.totalHechos}</strong>
                  <span>hechos</span>
                </div>
                <div>
                  <strong>{collection.fuentes.length}</strong>
                  <span>loaders</span>
                </div>
                <div>
                  <strong>{formatDate(collection.ultimaActualizacion)}</strong>
                  <span>última sync</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="featured-collections__loader">Sin colecciones para mostrar todavía.</div>
      )}
    </section>
  );
};
