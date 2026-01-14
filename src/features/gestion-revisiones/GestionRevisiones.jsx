import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  listarPendientes,
  aceptarRevision,
  aceptarConCambios,
  rechazarRevision,
} from '../../services/revisionesService';
import './GestionRevisiones.css';

export const GestionRevisiones = () => {
const { isAdmin,contribuyenteId } = useAuth();

 //const mockUseAuth = () => {
 //   return {
 //     isAdmin: true, // Cambiar a false para probar redirección
 //   };
 // };
  const [mensaje, setMensaje] = useState("");
//  const { isAdmin } = mockUseAuth();
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState({});
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchPendientes = async () => {
      try {
        const data = await listarPendientes();
        console.log('Revisiones pendientes cargadas:', data);
        setPendientes(data);
      } catch (err) {
        console.error('Error al cargar revisiones:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendientes();
  }, [isAdmin, navigate]);

  const handleComentarioChange = (id, value) => {
    setComentarios((prev) => ({ ...prev, [id]: value }));
  };

  const handleAction = async (id, actionType, tituloHecho) => {
  setProcessingId(id);
  const comentario = comentarios[id] || '';
  
  let texto = "";
  try {
    if (actionType === 'ACEPTAR') {
      texto = `✔️  ${tituloHecho} fue aceptado.`;
      setMensaje(texto);
      setTimeout(() => setMensaje(""), 3000);
      await aceptarRevision(id, comentario,contribuyenteId);

    } else if (actionType === 'CAMBIOS') {
      texto = `⚠️  ${tituloHecho} requiere cambios.`
      setMensaje(texto);
      setTimeout(() => setMensaje(""), 3000);
      await aceptarConCambios(id, comentario,contribuyenteId);
    } else if (actionType === 'RECHAZAR') {
      texto = `❌  ${tituloHecho} fue rechazado.`
      setMensaje(texto);
      setTimeout(() => setMensaje(""), 3000);
      await rechazarRevision(id, comentario,contribuyenteId);
    }

    setPendientes((prev) => prev.filter((p) => p.idContribucion !== id));

    setComentarios((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });


  } catch (err) {
    console.error('Error al procesar revisión:', err);
    alert('Ocurrió un error al procesar la solicitud.');
  } finally {
    setProcessingId(null);
  }
};



  if (loading) {
    return (
      <div className="gestion-revisiones">
        <div className="loading-spinner">Cargando revisiones...</div>
      </div>
    );
  }

  return (
    <div className="gestion-revisiones">
      <header className="gestion-revisiones__header">
        <button 
          className="btn-back-admin" 
          onClick={() => navigate('/admin')}
        >
          ← Volver al panel
        </button>
        <h1 className="gestion-revisiones__title">Revisión de Contribuciones</h1>
        <p className="gestion-revisiones__subtitle">
          Validá las contribuciones pendientes enviadas por la comunidad.
        </p>
      </header>

        {mensaje && (
          <div className="toast-feedback">
            {mensaje}
          </div>
        )}

      <div className="gestion-revisiones__list">
        {pendientes.length === 0 ? (
          <div className="revision-empty">
            <p>🎉 No hay contribuciones pendientes de revisión.</p>
          </div>
        ) : (
          pendientes.map((item) => (
            <div key={item.idContribucion} className="revision-card">
              <div className="revision-card__content">
                <div className="revision-card__header">
                  <span className="revision-card__id">NroContribución: {item.idContribucion}</span>
                  <span className="revision-card__id">{!item.anonimo? "Contribuyente: " + item.nombreContribuyente: "Es una contribucion ANONIMA"}</span>
                </div>

                <div 
                  className="revision-card__hecho"
                  onClick={() => navigate('/admin/revisiones/detalle', { 
                    state: { hecho: item.hecho } 
                  })}
                  style={{ cursor: 'pointer' }}
                  title="Ver detalle completo"
                >
                  <div className="hecho-titulo">
                    {item.hecho.titulo} <span style={{ fontSize: '0.8em', opacity: 0.7 }}>↗</span>
                  </div>
                  <div className="hecho-desc">{item.hecho.descripcion}</div>
                  
                  <div className="hecho-meta">
                    <span className="meta-item">📅 {item.hecho.fecha}</span>
                    <span className="meta-item">📍 {item.hecho.ubicacion.latitud}, {item.hecho.ubicacion.longitud}</span>
                    <span className="meta-item">🏷️ {item.hecho.categoria}</span>
                    <span className="meta-item">📝 {item.hecho.tipoDeHecho}</span>
                  </div>

                  {item.hecho.adjuntos && item.hecho.adjuntos.length > 0 && (
                    <div className="hecho-adjuntos" style={{ marginTop: '1rem' }}>
                      <small style={{ color: '#94a3b8' }}>📎 {item.hecho.adjuntos.length} adjunto(s)</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="revision-card__actions-panel">
                <div className="revision-form">
                  <h3>Dictamen del revisor</h3>
                  <textarea
                    placeholder="Escribí un comentario o sugerencia (opcional para aceptar)..."
                    value={comentarios[item.idContribucion] || ''}
                    onChange={(e) => handleComentarioChange(item.idContribucion, e.target.value)}
                    disabled={processingId === item.idContribucion}
                  />
                  
                  <div className="revision-actions">
                   <button
                    className="btn-revision btn-accept"
                    onClick={() => handleAction(item.idContribucion, 'ACEPTAR', item.hecho.titulo)}
                    disabled={processingId === item.idContribucion}
                  >
                    ✅ Aceptar
                  </button>

                  <button
                    className="btn-revision btn-changes"
                    onClick={() => handleAction(item.idContribucion, 'CAMBIOS', item.hecho.titulo)}
                    disabled={processingId === item.idContribucion}
                  >
                    ⚠️ Con cambios
                  </button>

                  <button
                    className="btn-revision btn-reject"
                    onClick={() => handleAction(item.idContribucion, 'RECHAZAR', item.hecho.titulo)}
                    disabled={processingId === item.idContribucion}
                  >
                    ❌ Rechazar
                  </button>
                </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
