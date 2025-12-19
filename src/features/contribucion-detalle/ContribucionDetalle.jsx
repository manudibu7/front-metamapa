import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { icon } from 'leaflet';
import './ContribucionDetalle.css';

const API_BASE_URL = 'http://localhost:8090';

const markerIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const ContribucionDetalle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hecho = location.state?.hecho;

  if (!hecho) {
    return (
      <div className="contribucion-detalle">
        <p>No se proporcionaron datos de la contribución.</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  return (
    <div className="contribucion-detalle">
      <header className="contribucion-detalle__header">
        <button className="contribucion-detalle__back" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        
        <div className="contribucion-detalle__badges">
          <span className="badge badge--categoria">{hecho.categoria}</span>
          <span className="badge badge--estado">{hecho.tipoDeHecho}</span>
        </div>

        <h1 className="contribucion-detalle__title">{hecho.titulo}</h1>

        <div className="contribucion-detalle__meta">
          <span>📅 {hecho.fecha}</span>
          <span>📍 {hecho.ubicacion?.latitud}, {hecho.ubicacion?.longitud}</span>
        </div>
      </header>

      <div className="contribucion-detalle__content">
        <section className="contribucion-detalle__section">
          <h2>Descripción</h2>
          <p className="contribucion-detalle__descripcion">{hecho.descripcion}</p>
        </section>

        {hecho.ubicacion && (
          <section className="contribucion-detalle__section">
            <h2>Ubicación</h2>
            <MapContainer
              center={[hecho.ubicacion.latitud, hecho.ubicacion.longitud]}
              zoom={13}
              scrollWheelZoom={false}
              className="contribucion-detalle__map-container"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[hecho.ubicacion.latitud, hecho.ubicacion.longitud]}
                icon={markerIcon}
              />
            </MapContainer>
          </section>
        )}

        {hecho.adjuntos && hecho.adjuntos.length > 0 && (
          <section className="contribucion-detalle__section">
            <h2>Adjuntos</h2>
            <div className="contribucion-detalle__adjuntos">
              {hecho.adjuntos.map((adjunto, index) => {
                const imageUrl = adjunto.url.startsWith('http') ? adjunto.url : `${API_BASE_URL}${adjunto.url}`;
                const isImage = (adjunto.url.match(/\.(jpeg|jpg|gif|png)$/i) || adjunto.tipo === 'imagen' || adjunto.tipo === 'IMAGE');
                
                return (
                  <div key={index} className="adjunto-card">
                    {/* Simple logic to show image preview if url is available, else generic icon */}
                    {adjunto.url && isImage ? (
                      <img src={imageUrl} alt="Adjunto" className="adjunto-preview" />
                    ) : (
                      <div className="adjunto-icon">📎</div>
                    )}
                    <div className="adjunto-info">
                      {/* Assuming AdjuntoOutputDTO might have url or name */}
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="adjunto-link">
                        Ver archivo
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
