import { useEffect, useMemo, useState } from 'react';
import './CollectionsExplorer.css';
import { MapPreview } from '../MapPreview/MapPreview';
import { HechoList } from '../HechoList/HechoList';
import { buildMarkers } from '../../helpers/collections';

export const CollectionsExplorer = ({ collections = [], loading = false, onClose }) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState(collections[0]?.id ?? null);
  const [selectedHechoId, setSelectedHechoId] = useState(null);

  useEffect(() => {
    if (!selectedCollectionId && collections.length) {
      setSelectedCollectionId(collections[0].id);
    }
  }, [collections, selectedCollectionId]);

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === selectedCollectionId) ?? collections[0],
    [collections, selectedCollectionId]
  );

  const markers = useMemo(() => buildMarkers(selectedCollection), [selectedCollection]);

  useEffect(() => {
    setSelectedHechoId(null);
  }, [selectedCollectionId]);

  if (loading) {
    return (
      <section className="collections-explorer">
        <p>Cargando colecciones...</p>
      </section>
    );
  }

  if (!collections.length) return null;

  return (
    <section className="collections-explorer">
      <header className="collections-explorer__header">
        <div>
          <p className="section-eyebrow">Colecciones publicadas</p>
          <h2>Visualizá hechos por instancia</h2>
        </div>
        {onClose && (
          <button className="btn btn--ghost" onClick={onClose}>
            Cerrar
          </button>
        )}
      </header>

      <div className="collections-explorer__tabs">
        {collections.map((collection) => (
          <button
            key={collection.id}
            type="button"
            className={`collection-pill ${collection.id === selectedCollectionId ? 'is-active' : ''}`}
            onClick={() => setSelectedCollectionId(collection.id)}
          >
            <span>{collection.titulo}</span>
            <small>{collection.totalHechos} hechos</small>
          </button>
        ))}
      </div>

      {selectedCollection && (
        <div className="collections-explorer__body">
          <div className="collections-explorer__map">
            <div className="collections-explorer__info">
              <h3>{selectedCollection.titulo}</h3>
              <p>{selectedCollection.descripcion}</p>
              <div className="collections-explorer__chips">
                <span>{selectedCollection.consenso}</span>
                <span>{selectedCollection.estado}</span>
                <span>{selectedCollection.fuentes.join(' · ')}</span>
              </div>
            </div>
            <MapPreview markers={markers} highlightedId={selectedHechoId} />
          </div>
          <div className="collections-explorer__list">
            <HechoList
              hechos={selectedCollection.hechos}
              selectedId={selectedHechoId}
              onSelect={setSelectedHechoId}
            />
          </div>
        </div>
      )}
    </section>
  );
};
