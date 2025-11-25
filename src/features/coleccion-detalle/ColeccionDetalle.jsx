import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { icon } from 'leaflet';
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
    // TODO: Reemplazar con llamada real a la API
    const mockColeccion = {
      id,
      nombre: 'Incendios Forestales 2024',
      descripcion: 'Registro de incendios forestales ocurridos durante el año 2024 en distintas provincias.',
      cantidadHechos: 15,
      fechaCreacion: '2024-01-15',
    };

    const mockHechos = [
      {
        id: 1,
        titulo: 'Incendio en Parque Nacional Nahuel Huapi',
        categoria: 'Incendio forestal',
        fecha: '2024-02-15',
        provincia: 'Río Negro',
        descripcion: 'Gran incendio forestal que afectó más de 500 hectáreas de bosque nativo.',
        ubicacion: { lat: -41.0915, lng: -71.4225 },
        fuente: 'ONG Ambiental',
      },
      {
        id: 2,
        titulo: 'Incendio en Córdoba Sierras',
        categoria: 'Incendio forestal',
        fecha: '2024-03-20',
        provincia: 'Córdoba',
        descripcion: 'Incendio en zona serrana que requirió evacuación de 200 familias.',
        ubicacion: { lat: -31.4201, lng: -64.1888 },
        fuente: 'Bomberos Voluntarios',
      },
      {
        id: 3,
        titulo: 'Incendio en Delta del Paraná',
        categoria: 'Incendio forestal',
        fecha: '2024-04-10',
        provincia: 'Entre Ríos',
        descripcion: 'Incendio intencional en humedales del Delta del Paraná afectó fauna local.',
        ubicacion: { lat: -33.7399, lng: -59.2489 },
        fuente: 'Prefectura Naval',
      },
    ];

    setColeccion(mockColeccion);
    setHechos(mockHechos);
    setLoading(false);
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
    ? [hechos[0].ubicacion.lat, hechos[0].ubicacion.lng]
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
          <span>·</span>
          <span>Creada: {new Date(coleccion.fechaCreacion).toLocaleDateString('es-AR')}</span>
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
                  key={hecho.id}
                  className={`hecho-card ${selectedHecho?.id === hecho.id ? 'hecho-card--selected' : ''}`}
                  onClick={() => handleHechoClick(hecho.id)}
                  onMouseEnter={() => setSelectedHecho(hecho)}
                  onMouseLeave={() => setSelectedHecho(null)}
                >
                  <div className="hecho-card__header">
                    <span className="hecho-card__categoria">{hecho.categoria}</span>
                    <span className="hecho-card__fecha">{new Date(hecho.fecha).toLocaleDateString('es-AR')}</span>
                  </div>
                  <h3 className="hecho-card__titulo">{hecho.titulo}</h3>
                  <p className="hecho-card__descripcion">{hecho.descripcion}</p>
                  <div className="hecho-card__footer">
                    <span className="hecho-card__provincia">{hecho.provincia}</span>
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
                  key={hecho.id}
                  position={[hecho.ubicacion.lat, hecho.ubicacion.lng]}
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
                        onClick={() => handleHechoClick(hecho.id)}
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
