import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { icon } from 'leaflet';
import './HechoDetalle.css';

const markerIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const HechoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hecho, setHecho] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Reemplazar con llamada real a la API
    const mockHecho = {
      id,
      titulo: 'Incendio en Parque Nacional Nahuel Huapi',
      descripcion: 'Gran incendio forestal que afectó más de 500 hectáreas de bosque nativo en el Parque Nacional Nahuel Huapi. El incendio se originó el 15 de febrero de 2024 en horas de la tarde, propagándose rápidamente debido a las condiciones climáticas adversas.',
      categoria: 'Incendio forestal',
      fecha: '2024-02-15',
      fechaDeCarga: '2024-02-16',
      ubicacionLat: '-41.0915',
      ubicacionLon: '-71.4225',
      etiqueta: 'Alta prioridad',
      tipoHecho: 'TEXTO',
      fuente: 'ONG Ambiental Patagonia',
      adjuntos: [
        { url: 'https://via.placeholder.com/800x400/1a1f35/4ade80?text=Imagen+1', tipo: 'imagen' },
        { url: 'https://via.placeholder.com/800x400/1a1f35/22d3ee?text=Imagen+2', tipo: 'imagen' },
        { url: 'informe_tecnico.pdf', tipo: 'PDF' }
      ]
    };

    setTimeout(() => {
      setHecho(mockHecho);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="hecho-detalle hecho-detalle--loading">
        <p>Cargando hecho...</p>
      </div>
    );
  }

  if (!hecho) {
    return (
      <div className="hecho-detalle hecho-detalle--error">
        <p>No se encontró el hecho</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  return (
    <div className="hecho-detalle">
      <div className="hecho-detalle__container">
        <header className="hecho-detalle__header">
          <button className="hecho-detalle__back" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          
          <div className="hecho-detalle__badges">
            <span className="badge badge--categoria">{hecho.categoria}</span>
            <span className="badge badge--estado">{hecho.etiqueta}</span>
          </div>

          <h1>{hecho.titulo}</h1>

          <div className="hecho-detalle__meta">
            <div className="meta-item">
              <span className="meta-label">Fecha:</span>
              <span className="meta-value">{new Date(hecho.fecha).toLocaleDateString('es-AR')}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Fuente:</span>
              <span className="meta-value">{hecho.fuente}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Tipo:</span>
              <span className="meta-value">{hecho.tipoHecho}</span>
            </div>
          </div>
        </header>

        <div className="hecho-detalle__content">
          <section className="hecho-detalle__section">
            <h2>Descripción</h2>
            <p className="hecho-detalle__descripcion">{hecho.descripcion}</p>
          </section>

          {hecho.ubicacionLat && hecho.ubicacionLon && (
            <section className="hecho-detalle__section">
              <h2>Ubicación georreferenciada</h2>
              <div className="hecho-detalle__map">
                <MapContainer
                  center={[parseFloat(hecho.ubicacionLat), parseFloat(hecho.ubicacionLon)]}
                  zoom={11}
                  scrollWheelZoom
                  className="hecho-detalle__map-container"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[parseFloat(hecho.ubicacionLat), parseFloat(hecho.ubicacionLon)]}
                    icon={markerIcon}
                  />
                </MapContainer>
                <div className="hecho-detalle__coordenadas">
                  <span>Lat: {hecho.ubicacionLat}</span>
                  <span>Lng: {hecho.ubicacionLon}</span>
                </div>
              </div>
            </section>
          )}

          {hecho.adjuntos && hecho.adjuntos.length > 0 && (
            <section className="hecho-detalle__section">
              <h2>Adjuntos y Evidencia</h2>
              <div className="hecho-detalle__imagenes">
                {hecho.adjuntos.filter(a => a.tipo === 'imagen' || (a.url && a.url.match(/\.(jpeg|jpg|gif|png)$/))).map((img, idx) => (
                  <img key={idx} src={img.url} alt={`Evidencia ${idx + 1}`} />
                ))}
              </div>
              <div className="hecho-detalle__archivos">
                {hecho.adjuntos.filter(a => a.tipo !== 'imagen' && (!a.url || !a.url.match(/\.(jpeg|jpg|gif|png)$/))).map((archivo, idx) => (
                  <div key={idx} className="archivo-card">
                    <div className="archivo-card__icon">📄</div>
                    <div className="archivo-card__info">
                      <span className="archivo-card__nombre">{archivo.url || 'Archivo adjunto'}</span>
                      <span className="archivo-card__meta">{archivo.tipo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
