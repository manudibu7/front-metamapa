import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { icon } from 'leaflet';
import { hechosService } from '../../services/hechosService';
import './HechoDetalle.css';
// Configuración del icono de Leaflet
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHecho = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Llamada al servicio real
        const data = await hechosService.obtenerHechoPorId(id);
        
        setHecho(data);
      } catch (err) {
        console.error("Error obteniendo el hecho:", err);
        setError(err.message || "Error desconocido al cargar el hecho.");
        setHecho(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHecho();
  }, [id]);

  // --- Renderizado: Estado de Carga ---
  if (loading) {
    return (
      <div className="hecho-detalle hecho-detalle--loading">
        <p>Cargando hecho...</p>
      </div>
    );
  }

  // --- Renderizado: Estado de Error o No Encontrado ---
  if (!hecho) {
    return (
      <div className="hecho-detalle hecho-detalle--error">
        <p>{error || "No se encontró el hecho solicitado."}</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  // --- Renderizado: Contenido Principal ---
  return (
    <div className="hecho-detalle">
      <div className="hecho-detalle__container">
        
        {/* Cabecera */}
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
              <span className="meta-value">
                {hecho.fecha ? new Date(hecho.fecha).toLocaleDateString('es-AR') : '-'}
              </span>
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
          {/* Sección: Descripción */}
          <section className="hecho-detalle__section">
            <h2>Descripción</h2>
            <p className="hecho-detalle__descripcion">{hecho.descripcion}</p>
          </section>

          {/* Sección: Mapa (solo si hay coordenadas) */}
          {hecho.ubicacion.latitud && hecho.ubicacion.logitud && (
            <section className="hecho-detalle__section">
              <h2>Ubicación georreferenciada</h2>
              <div className="hecho-detalle__map">
                <MapContainer
                  center={[parseFloat(hecho.ubicacion.latitud), parseFloat(hecho.ubicacion.logitud)]}
                  zoom={11}
                  scrollWheelZoom
                  className="hecho-detalle__map-container"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[parseFloat(hecho.ubicacion.latitud), parseFloat(hecho.ubicacion.longitud)]}
                    icon={markerIcon}
                  />
                </MapContainer>
                <div className="hecho-detalle__coordenadas">
                  <span>Lat: {hecho.ubicacion.latitud}</span>
                  <span>Lng: {hecho.ubicacion.longitud}</span>
                </div>
              </div>
            </section>
          )}

          {/* Sección: Adjuntos (solo si hay adjuntos) */}
          {hecho.adjuntos && hecho.adjuntos.length > 0 && (
            <section className="hecho-detalle__section">
              <h2>Adjuntos y Evidencia</h2>
              
              {/* Galería de Imágenes */}
              <div className="hecho-detalle__imagenes">
                {hecho.adjuntos
                  .filter(a => a.tipo === 'imagen' || (a.url && a.url.match(/\.(jpeg|jpg|gif|png)$/i)))
                  .map((img, idx) => (
                    <img key={idx} src={img.url} alt={`Evidencia ${idx + 1}`} />
                ))}
              </div>

              {/* Lista de Archivos (PDFs, docs, etc) */}
              <div className="hecho-detalle__archivos">
                {hecho.adjuntos
                  .filter(a => a.tipo !== 'imagen' && (!a.url || !a.url.match(/\.(jpeg|jpg|gif|png)$/i)))
                  .map((archivo, idx) => (
                    <div key={idx} className="archivo-card">
                      <div className="archivo-card__icon">📄</div>
                      <div className="archivo-card__info">
                        <span className="archivo-card__nombre">{archivo.url || 'Archivo adjunto'}</span>
                        <span className="archivo-card__meta">{archivo.tipoMedia}</span>
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