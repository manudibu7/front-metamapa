import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { obtenerSolicitudes, actualizarEstadoSolicitud, eliminarSolicitud } from '../../services/solicitudesService';
import './GestionSolicitudes.css';

export const GestionSolicitudes = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
   // if (!isAdmin) {
  //    navigate('/');
    //  return;
    //}

    const fetchSolicitudes = async () => {
      try {
        const data = await obtenerSolicitudes();
        const dataFiltrada = data.filter(solicitud => solicitud.estadoSolicitud === 'PENDIENTE');
        console.log("Solicitudes obtenidas:", dataFiltrada);
        setSolicitudes(dataFiltrada);
      } catch (err) {
        setError('Error al cargar las solicitudes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [isAdmin, navigate]);

  const handleAction = async (id, nuevoEstado) => {
  setProcessingId(id);
  try {
    await actualizarEstadoSolicitud(id, nuevoEstado);

    if (nuevoEstado === "RECHAZADA") {
      await eliminarSolicitud(id);
    }

    // Quita la solicitud de la UI
    setSolicitudes((prev) =>
      prev.filter((s) => s.id_solicitud !== id)
    );

  } catch (err) {
    console.error("Error al actualizar solicitud:", err);
    alert("No se pudo actualizar la solicitud");
  } finally {
    setProcessingId(null);
  }
};

  if (loading) {
    return (
      <div className="gestion-solicitudes">
        <div className="loading-spinner">Cargando solicitudes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-solicitudes">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  console.log("Solicitud recibida:", solicitudes);
  return (
    <div className="gestion-solicitudes">
      <header className="gestion-solicitudes__header">
        <h1 className="gestion-solicitudes__title">Gestión de Solicitudes</h1>
        <p className="gestion-solicitudes__subtitle">
          Administra las solicitudes de eliminación de hechos reportados por la comunidad.
        </p>
      </header>

      <div className="gestion-solicitudes__list">
        {solicitudes.length === 0 ? (
          <div className="solicitud-empty">
            <p>No hay solicitudes pendientes de revisión.</p>
          </div>
        ) : (
          solicitudes.map((solicitud) => (
            <div key={solicitud.id_solicitud} className="solicitud-card">
              <div className="solicitud-card__info">
                <div className="solicitud-card__header">
                  <span className="solicitud-card__id">{"Nro de Solicitud: " + solicitud.id_solicitud}</span>
                  <span className={`solicitud-card__status status-${solicitud.estadoSolicitud!=null? solicitud.estadoSolicitud.toLowerCase(): "sin estado"}`}>
                    {solicitud.estadoSolicitud}
                  </span>
                </div>

                <div 
                  className="solicitud-card__hecho"
                  onClick={() => navigate(`/hechos/${solicitud.hecho.id_hecho}`)}
                  title="Ver detalle del hecho"
                >
                  <div className="hecho-titulo">
                    {solicitud.hecho.titulo} <span style={{ fontSize: '0.8em', opacity: 0.7 }}>↗</span>
                  </div>
                  <div className="hecho-desc">{solicitud.hecho.descripcion}</div>
                  <div className="hecho-meta">
                    <span>📍 {solicitud.hecho.ubicacion.provincia}</span>
                    <span>📍 {solicitud.hecho.ubicacion.pais}</span>
                    <span>📅 {solicitud.hecho.fecha}</span>
                    <span>📂 {solicitud.hecho.fuente}</span>
                  </div>
                </div>

                <div className="solicitud-card__details">
                  <div className="detail-row">
                    <span className="detail-label">Motivo de eliminación</span>
                    <span className="detail-value">{solicitud.motivo}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-value">{"Fecha de subida: " + new Date(solicitud.fechaSolicitud).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="solicitud-card__actions">
                {solicitud.estadoSolicitud === 'PENDIENTE' ? (
                  <>
                <button className="btn-action btn-accept" onClick={() => {
                   if (window.confirm("¿Confirmás aceptar esta solicitud de eliminación?")) {
                      handleAction(solicitud.id_solicitud, 'ACEPTADA');
                    }
                    }}
                  disabled={processingId === solicitud.id_solicitud}
                  >{processingId === solicitud.id_solicitud ? 'Procesando...' : '✅ Aceptar Eliminación'}
                </button>

                  <button className="btn-action btn-reject"
                    onClick={() => {
                    if (window.confirm("¿Confirmás rechazar esta solicitud?")) {
                    handleAction(solicitud.id_solicitud, 'RECHAZADA');
                  }
                  }}
                  disabled={processingId === solicitud.id_solicitud}
                  >
                  {processingId === solicitud.id_solicitud ? 'Procesando...' : '❌ Rechazar Solicitud'}
                </button>
                </>
                ) : (
                  <div className="action-completed">
                    Solicitud {solicitud.estadoSolicitud != null? solicitud.estadoSolicitud.toLowerCase(): "sinestado"}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


