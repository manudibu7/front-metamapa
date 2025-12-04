import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { obtenerSolicitudes, actualizarEstadoSolicitud } from '../../services/solicitudesService';
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
        setSolicitudes(data);
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
      const updatedSolicitud = await actualizarEstadoSolicitud(id, nuevoEstado);
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? updatedSolicitud : s))
      );
    } catch (err) {
      console.error('Error al actualizar solicitud:', err);
      alert('No se pudo actualizar la solicitud');
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
                  <span className="solicitud-card__id">{solicitud.id_solicitud}</span>
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
                    <span className="detail-label">Solicitante</span>
                    <span className="detail-value">{solicitud.id_contribuyente} • {new Date(solicitud.fechaSolicitud).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="solicitud-card__actions">
                {solicitud.estado === 'PENDIENTE' ? (
                  <>
                    <button
                      className="btn-action btn-accept"
                      onClick={() => handleAction(solicitud.id, 'ACEPTADA')}
                      disabled={processingId === solicitud.id}
                    >
                      {processingId === solicitud.id ? 'Procesando...' : '✅ Aceptar Eliminación'}
                    </button>
                    <button
                      className="btn-action btn-reject"
                      onClick={() => handleAction(solicitud.id, 'RECHAZADA')}
                      disabled={processingId === solicitud.id}
                    >
                      {processingId === solicitud.id ? 'Procesando...' : '❌ Rechazar Solicitud'}
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


