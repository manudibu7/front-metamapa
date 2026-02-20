import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { icon } from 'leaflet';
import { hechosService, actualizarEtiqueta, obtenerEtiquetas } from '../../services/hechosService';
import { crearSolicitud } from '../../services/solicitudesService';
import { useAuthContext } from '../../context/AuthContext';
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

  const { contribuyenteId,isAuthenticated, isAdmin} = useAuthContext(); // <--- OBTENER EL ID DEL CONTEXTO
  
  console.log('Usuario:', { isAuthenticated, contribuyenteId });

  const [showModal, setShowModal] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [hecho, setHecho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false); // Estado para evitar doble envío
  const [requestMessage, setRequestMessage] = useState(''); // Mensaje de éxito/error
  // Estado para etiquetas
  const [showEtiquetaModal, setShowEtiquetaModal] = useState(false);
  const [etiqueta, setEtiqueta] = useState("");
  const [successEtiqueta, setSuccessEtiqueta] = useState("");
  const [isEtiquetando, setIsEtiquetando] = useState(false);
  const [errorEtiqueta, setErrorEtiqueta] = useState(null);
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState([]);
  const [loadingEtiquetas, setLoadingEtiquetas] = useState(true);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  useEffect(() => {
    const fetchHecho = async () => {
      if (!id || id === 'undefined') {
        setError("ID de hecho no válido.");
        setLoading(false);
        return;
      }
      
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
  useEffect(() => {
  const fetchEtiquetas = async () => {
    if (!showEtiquetaModal) return;

    setLoadingEtiquetas(true);
    try {
      const data = await obtenerEtiquetas();
      console.log("Etiquetas recibidas:", data);
      setEtiquetasDisponibles(data);
    } catch (err) {
      console.error("Error cargando etiquetas", err);
    } finally {
      setLoadingEtiquetas(false);
    }
  };

  fetchEtiquetas();
}, [showEtiquetaModal]);
  // Función para manejar la solicitud de eliminación
  const handleSolicitarEliminacion = async () => {
    if (!contribuyenteId || !hecho || isRequesting) return;
    if (!motivo.trim()) {
      alert("Por favor, escribe un motivo.");
      return;
    }

    if (!window.confirm("¿Estás seguro de que quieres solicitar la eliminación de este hecho?")) {
      return;
    }

    setIsRequesting(true);
    setRequestMessage('');
    setError(null);

    // Estructura de la solicitud (ajusta esto según tu backend)
    const solicitudData = {
      idHecho: hecho.id_hecho, // Ojo: verifica si tu objeto usa id_hecho o id
      idContribuyente: contribuyenteId,
      motivo: motivo, // <--- AQUI VA EL TEXTO DEL USUARIO
    };
    console.log(motivo)
    try {
      await crearSolicitud(solicitudData);
      setRequestMessage("✅ Solicitud de eliminación enviada con éxito.");

      setTimeout(() => {
         setShowModal(false);
         setMotivo('');
         //navigate(-1); // Descomenta si quieres que vuelva atrás automáticamente
      }, 1500);
    } catch (err) {
      console.error("Error al enviar solicitud:", err);
      setError("❌ Error al enviar la solicitud: " + (err.message || "Inténtalo de nuevo."));
    } finally {
      setIsRequesting(false);
    }
  };
  const handleAsignarEtiqueta = async () => {
  const etiquetaFinal = etiqueta === "__agregar__" ? nuevaEtiqueta : etiqueta;

  if (!etiquetaFinal.trim()) return; 

  setIsEtiquetando(true);
  setErrorEtiqueta(null);
  setSuccessEtiqueta("");

  try {
    await actualizarEtiqueta(hecho.id_hecho, etiquetaFinal);

    setHecho({ ...hecho, etiqueta: etiquetaFinal });

    setSuccessEtiqueta("Etiqueta actualizada correctamente ✔️"); 
    setEtiqueta("");
    setNuevaEtiqueta("");

    setTimeout(() => {
      setShowEtiquetaModal(false);
      setSuccessEtiqueta(""); 
    }, 1200);
  } catch (err) {
    console.error(err);
    setErrorEtiqueta("No se pudo actualizar la etiqueta.");
  } finally {
    setIsEtiquetando(false);
  }
};

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

  return (
    <div className="hecho-detalle">
      <div className="hecho-detalle__container">
        
        <header className="hecho-detalle__header">
          <button className="hecho-detalle__back" onClick={() => navigate(-1)}>
            ← Volver
          </button>

          <div className="hecho-detalle__badges">
            <div className="meta-value">{"Categoría: " + hecho.categoria}</div>
            <div className="meta-value">{"Etiqueta: " + hecho.etiqueta}</div>
          </div>

          <h1>{hecho.titulo}</h1>

          {contribuyenteId && (
            <button className="btn-solicitud" onClick={() => setShowModal(true)}>
              🗑️ Solicitar Eliminación
            </button>
          )}

          {isAdmin && (
            <button className="btn-etiqueta" onClick={() => setShowEtiquetaModal(true)}>
              🏷️ Asignar Etiqueta
            </button>
          )}

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
          {hecho.ubicacion.latitud!=null && hecho.ubicacion.longitud!=null && (
            <section className="hecho-detalle__section">
              <h2>Ubicación georreferenciada</h2>
              <div className="hecho-detalle__map">
                <MapContainer
                  center={[parseFloat(hecho.ubicacion.latitud), parseFloat(hecho.ubicacion.longitud)]}
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
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Solicitud de Eliminación</h3>
            <p>Por favor, indica por qué este hecho debería ser eliminado:</p>
            
            <textarea
              className="modal-textarea"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: La información es incorrecta, la imagen es ofensiva..."
              rows={4}
            />

            {requestMessage && <p className="modal-message">{requestMessage}</p>}
            {error && <p className="modal-error">{error}</p>}

            <div className="modal-actions">
              <button 
                className="btn-cancelar"
                onClick={() => {
                  setShowModal(false);
                  setMotivo('');
                  setError(null);
                  setRequestMessage('');
                }}
                disabled={isRequesting}
              >
                Cancelar
              </button>
              
              <button 
                className="btn-confirmar" 
                onClick={handleSolicitarEliminacion}
                disabled={isRequesting || !motivo.trim()}
              >
                {isRequesting ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Etiqueta */}
      {showEtiquetaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Asignar Etiqueta</h3>

            <label>
              Etiqueta
            <select
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
            >
            <option value="">Seleccioná una etiqueta</option>
            {etiquetasDisponibles.map(et => (
              <option key={et.id_etiqueta} value={et.nombre}>
                {et.nombre}
              </option>
            ))}
              <option value="__agregar__">Otra</option>
            </select>

              {etiqueta === "__agregar__" && (
              <input
                type="text"
                placeholder="Ingresá nueva etiqueta"
                value={nuevaEtiqueta}
                onChange={(e) => setNuevaEtiqueta(e.target.value)}
              />
            )}
            </label>

            {errorEtiqueta && <p className="modal-error">{errorEtiqueta}</p>}
            {successEtiqueta && <p className="modal-success">{successEtiqueta}</p>}
            {isEtiquetando && (<p className="modal-loading">⏳ Procesando, haciendo cambios...</p>)}
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setShowEtiquetaModal(false)}>
                Cancelar
              </button>

              <button className="btn-confirmar" onClick={handleAsignarEtiqueta} disabled={isEtiquetando}>
                {isEtiquetando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};