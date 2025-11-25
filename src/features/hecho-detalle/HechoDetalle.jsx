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
      categoria: 'Incendio forestal',
      fecha: '2024-02-15',
      provincia: 'Río Negro',
      descripcion: 'Gran incendio forestal que afectó más de 500 hectáreas de bosque nativo en el Parque Nacional Nahuel Huapi.',
      detalleCompleto: `El incendio se originó el 15 de febrero de 2024 en horas de la tarde, 
      propagándose rápidamente debido a las condiciones climáticas adversas (altas temperaturas y vientos fuertes).
      
      Se movilizaron más de 200 brigadistas, incluyendo personal del Servicio Nacional de Manejo del Fuego, 
      bomberos voluntarios de distintas localidades y brigadas de Parques Nacionales.
      
      Las llamas afectaron principalmente la zona sur del parque, comprometiendo bosques de coihue, lenga y ñire. 
      La fauna local se vio severamente impactada, con reportes de evacuaciones de animales por parte de guardaparques.
      
      Las tareas de extinción se extendieron por 72 horas continuas, requiriendo el apoyo de aviones hidrantes 
      y helicópteros. El fuego fue finalmente controlado el 18 de febrero.`,
      ubicacion: { lat: -41.0915, lng: -71.4225 },
      fuente: 'ONG Ambiental',
      fuenteDetalle: 'Relevamiento de campo realizado por ONG Ambiental Patagonia',
      imagenes: [
        'https://via.placeholder.com/800x400/1a1f35/4ade80?text=Imagen+1',
        'https://via.placeholder.com/800x400/1a1f35/22d3ee?text=Imagen+2',
      ],
      archivos: [
        { nombre: 'informe_tecnico.pdf', tipo: 'PDF', tamaño: '2.4 MB' },
        { nombre: 'registro_fotografico.zip', tipo: 'ZIP', tamaño: '15.8 MB' },
      ],
      contribuyente: {
        nombre: 'ONG Ambiental Patagonia',
        id: 'ong-ambiental-001',
      },
      colecciones: [
        { id: 1, nombre: 'Incendios Forestales 2024' },
        { id: 2, nombre: 'Crisis Ambiental Patagonia' },
      ],
      fechaPublicacion: '2024-02-20',
      estado: 'Verificado',
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
            <span className="badge badge--estado">{hecho.estado}</span>
          </div>

          <h1>{hecho.titulo}</h1>

          <div className="hecho-detalle__meta">
            <div className="meta-item">
              <span className="meta-label">Fecha del hecho:</span>
              <span className="meta-value">{new Date(hecho.fecha).toLocaleDateString('es-AR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Provincia:</span>
              <span className="meta-value">{hecho.provincia}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Fuente:</span>
              <span className="meta-value">{hecho.fuente}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Publicado:</span>
              <span className="meta-value">{new Date(hecho.fechaPublicacion).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
        </header>

        <div className="hecho-detalle__content">
          <section className="hecho-detalle__section">
            <h2>Descripción</h2>
            <p className="hecho-detalle__descripcion">{hecho.descripcion}</p>
          </section>

          <section className="hecho-detalle__section">
            <h2>Detalle completo</h2>
            <div className="hecho-detalle__detalle">
              {hecho.detalleCompleto.split('\n').map((parrafo, idx) => (
                <p key={idx}>{parrafo.trim()}</p>
              ))}
            </div>
          </section>

          {hecho.ubicacion && (
            <section className="hecho-detalle__section">
              <h2>Ubicación georreferenciada</h2>
              <div className="hecho-detalle__map">
                <MapContainer
                  center={[hecho.ubicacion.lat, hecho.ubicacion.lng]}
                  zoom={11}
                  scrollWheelZoom
                  className="hecho-detalle__map-container"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[hecho.ubicacion.lat, hecho.ubicacion.lng]}
                    icon={markerIcon}
                  />
                </MapContainer>
                <div className="hecho-detalle__coordenadas">
                  <span>Lat: {hecho.ubicacion.lat}</span>
                  <span>Lng: {hecho.ubicacion.lng}</span>
                </div>
              </div>
            </section>
          )}

          {hecho.imagenes && hecho.imagenes.length > 0 && (
            <section className="hecho-detalle__section">
              <h2>Evidencia visual</h2>
              <div className="hecho-detalle__imagenes">
                {hecho.imagenes.map((img, idx) => (
                  <img key={idx} src={img} alt={`Evidencia ${idx + 1}`} />
                ))}
              </div>
            </section>
          )}

          {hecho.archivos && hecho.archivos.length > 0 && (
            <section className="hecho-detalle__section">
              <h2>Archivos adjuntos</h2>
              <div className="hecho-detalle__archivos">
                {hecho.archivos.map((archivo, idx) => (
                  <div key={idx} className="archivo-card">
                    <div className="archivo-card__icon">📄</div>
                    <div className="archivo-card__info">
                      <span className="archivo-card__nombre">{archivo.nombre}</span>
                      <span className="archivo-card__meta">{archivo.tipo} · {archivo.tamaño}</span>
                    </div>
                    <button className="archivo-card__btn">Descargar</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="hecho-detalle__section">
            <h2>Información de la fuente</h2>
            <div className="hecho-detalle__fuente-info">
              <p><strong>Contribuyente:</strong> {hecho.contribuyente.nombre}</p>
              <p><strong>ID:</strong> <code>{hecho.contribuyente.id}</code></p>
              <p><strong>Detalle:</strong> {hecho.fuenteDetalle}</p>
            </div>
          </section>

          {hecho.colecciones && hecho.colecciones.length > 0 && (
            <section className="hecho-detalle__section">
              <h2>Colecciones relacionadas</h2>
              <div className="hecho-detalle__colecciones">
                {hecho.colecciones.map((col) => (
                  <button
                    key={col.id}
                    className="coleccion-tag"
                    onClick={() => navigate(`/colecciones/${col.id}`)}
                  >
                    {col.nombre}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
