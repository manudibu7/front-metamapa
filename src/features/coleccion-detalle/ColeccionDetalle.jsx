import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { icon } from 'leaflet';
import { collectionsService } from '../../services/collectionsService';
import './ColeccionDetalle.css';

const markerIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const ColeccionDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coleccion, setColeccion] = useState(null);
  const [hechos, setHechos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHecho, setSelectedHecho] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
    try {
      const coleccionData = await collectionsService.getCollectionById(id);
      setColeccion(coleccionData);

      const hechosData = await collectionsService.getHechosDeColeccion(id);
      setHechos(hechosData);

    } catch (error) {
      console.error("Error cargando datos:", error);
      setColeccion(null);
      setHechos([]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id]);

  const handleHechoClick = (hechoId) => {
    navigate(`/hechos/${hechoId}`);
  };

  const handleMapMarkerClick = (hecho) => {
    setSelectedHecho(hecho);
  };

  if (loading) {
    return (
      <div className="coleccion-detalle coleccion-detalle--loading">
        <p>Cargando colección...</p>
      </div>
    );
  }

  if (!coleccion) {
    return (
      <div className="coleccion-detalle coleccion-detalle--error">
        <p>No se encontró la colección</p>
        <button onClick={() => navigate('/colecciones')}>Volver a colecciones</button>
      </div>
    );
  }

  const center = hechos.length > 0 && hechos[0].ubicacion
    ? [hechos[0].ubicacion.latitud, hechos[0].ubicacion.longitud]
    : [-38.4161, -63.6167]; // Centro de Argentina

  return (
    <div className="coleccion-detalle">
      <header className="coleccion-detalle__header">
        <button className="coleccion-detalle__back" onClick={() => navigate('/colecciones')}>
          ← Volver a colecciones
        </button>
        <h1>{coleccion.nombre}</h1>
        <p className="coleccion-detalle__descripcion">{coleccion.descripcion}</p>
        <div className="coleccion-detalle__meta">
          <span>{hechos.length} hechos</span>
        </div>
      </header>

      <div className="coleccion-detalle__content">
        <aside className="coleccion-detalle__hechos-list">
          <h2>Hechos en esta colección</h2>
          {hechos.length === 0 ? (
            <p className="coleccion-detalle__empty">No hay hechos en esta colección</p>
          ) : (
            <div className="hechos-list">
              {hechos.map((hecho) => (
                <article
                  key={hecho.id_hecho}
                  className={`hecho-card ${selectedHecho?.id_hecho === hecho.id_hecho ? 'hecho-card--selected' : ''}`}
                  onClick={() => handleHechoClick(hecho.id_hecho)}
                  onMouseEnter={() => setSelectedHecho(hecho)}
                  onMouseLeave={() => setSelectedHecho(null)}
                >
                  <div className="hecho-card__header">
                    <span className="hecho-card__categoria">{hecho.categoria}</span>
                    <span className="hecho-card__fecha">{hecho.fecha}</span>
                  </div>
                  <h3 className="hecho-card__titulo">{hecho.titulo}</h3>
                  <p className="hecho-card__descripcion">{hecho.descripcion}</p>
                  <div className="hecho-card__footer">
                    <span className="hecho-card__provincia">{hecho.ubicacion.provincia}</span>
                    <span className="hecho-card__fuente">Fuente: {hecho.fuente}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>

        <div className="coleccion-detalle__map">
          <MapContainer
            center={center}
            zoom={5}
            scrollWheelZoom
            className="coleccion-detalle__map-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hechos
              .filter((h) => h.ubicacion)
              .map((hecho) => (
                <Marker
                  key={hecho.id_hecho}
                  position={[hecho.ubicacion.latitud, hecho.ubicacion.longitud]}
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => handleMapMarkerClick(hecho),
                  }}
                >
                  <Popup>
                    <div className="marker-popup">
                      <h4>{hecho.titulo}</h4>
                      <p>{hecho.descripcion}</p>
                      <button
                        className="marker-popup__btn"
                        onClick={() => handleHechoClick(hecho.id_hecho)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
