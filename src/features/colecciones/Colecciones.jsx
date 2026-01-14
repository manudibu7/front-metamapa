import { useNavigate } from 'react-router-dom';
import './Colecciones.css';
import { useCollectionsContext } from '../../context/CollectionsContext';

const formatSyncDate = (value) => {
  if (!value) return 'Sin registro';
  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

export const Colecciones = () => {
  const { collections, isLoading } = useCollectionsContext();
  const navigate = useNavigate();

  return (
    <div className="colecciones-page">
      <header className="colecciones-page__header">
        <div>
          <p className="section-eyebrow">Colecciones del sistema</p>
          <h1>Explorá datasets curados</h1>
          <p>
            Navegá por las colecciones disponibles. Hacé clic en una para ver el detalle completo con mapa interactivo
            y listado de hechos.
          </p>
        </div>
        <button className="btn btn--ghost" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </header>

      <div className="colecciones-page__content">
        {isLoading ? (
          <div className="colecciones-page__loader">Cargando colecciones...</div>
        ) : !collections.length ? (
          <div className="colecciones-page__empty">
            <p>Todavía no hay colecciones publicadas.</p>
          </div>
        ) : (
          <div className="colecciones-grid">
            {collections.map((collection) => (
              <article
                key={collection.id}
                className="coleccion-card"
                onClick={() => navigate(`/colecciones/${collection.id_coleccion}/hechos`)}
              >
                <div className="coleccion-card__header">
                  <span className="coleccion-card__estado">{collection.estado}</span>
                  <span className="coleccion-card__consenso">{collection.consenso}</span>
                </div>
                
                <h2 className="coleccion-card__titulo">{collection.titulo}</h2>
                <p className="coleccion-card__descripcion">{collection.descripcion}</p>

                {collection.tags && collection.tags.length > 0 && (
                  <div className="coleccion-card__tags">
                    {collection.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="coleccion-card__footer">
                  <div className="coleccion-card__stat">
                    <strong>{collection.cantidadHechos}</strong>
                    <span>hechos</span>
                  </div>
                  <div className="coleccion-card__stat">
                    <strong>{(collection.fuentes ?? []).length}</strong>
                    <span>fuentes</span>
                  </div>
                </div>

                <button className="coleccion-card__btn">
                  Ver detalle →
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
