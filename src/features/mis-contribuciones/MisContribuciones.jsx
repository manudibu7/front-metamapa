import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getContribucionesByContribuyente, updateContribucion, getCategorias } from '../../services/contribucionesService';
import { getDetalleRevision } from '../../services/revisionesService';
import { UbicacionSelector } from '../../components/UbicacionSelector/UbicacionSelector';
import './MisContribuciones.css';

export const MisContribuciones = () => {
  const { contribuyenteId, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [contribuciones, setContribuciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingContribucion, setEditingContribucion] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [editFormData, setEditFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    categoria: '',
    ubicacion: null
  });

  useEffect(() => {
    if (!isAuthenticated || !contribuyenteId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [contribData, categoriasData] = await Promise.all([
          getContribucionesByContribuyente(contribuyenteId, token),
          getCategorias()
        ]);
        
        setCategorias(categoriasData.map(c => c.nombre));

        // Fetch revisions for each contribution
        const contribucionesConRevision = await Promise.all( 
          contribData.map(async (contribucion) => {
            try {
              const revision = await getDetalleRevision(contribucion.idContribucion);
              return { ...contribucion, revision };
            } catch (err) {
              console.error(`Error fetching revision for contribution ${contribucion.idContribucion}`, err);
              return { ...contribucion, revision: null};
            }
          })
        );
        setContribuciones(contribucionesConRevision);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar tus contribuciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, contribuyenteId, token]);

  const handleEditClick = (e, contribucion) => {
    e.stopPropagation();
    setEditingContribucion(contribucion);
    setEditFormData({
      titulo: contribucion.hecho.titulo,
      descripcion: contribucion.hecho.descripcion,
      fecha: contribucion.hecho.fecha,
      categoria: contribucion.hecho.categoria,
      ubicacion: contribucion.hecho.ubicacion
    });
    setNuevaCategoria("");
  };

  const handleCardClick = (contribucion) => {
    navigate('/admin/revisiones/detalle', { 
      state: { hecho: contribucion.hecho } 
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUbicacionChange = (coords) => {
    setEditFormData(prev => ({ ...prev, ubicacion: coords }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingContribucion) return;

    try {
      const categoriaFinal =
        editFormData.categoria === "__agregar__"
          ? nuevaCategoria
          : editFormData.categoria;

      const datosActualizados = {
        idContribuyente: contribuyenteId,
        anonimo: editingContribucion.anonimo,
        hecho: {
          titulo: editFormData.titulo,
          descripcion: editFormData.descripcion,
          fecha: editFormData.fecha,
          categoria: categoriaFinal,
          ubicacion: editFormData.ubicacion
        }
      };

      await updateContribucion(editingContribucion.idContribucion, datosActualizados, token);
      
      // Update local state
      setContribuciones(prev => prev.map(c => 
        c.idContribucion === editingContribucion.idContribucion 
          ? { ...c, hecho: { ...c.hecho, ...datosActualizados.hecho } }
          : c
      ));
      
      setEditingContribucion(null);
    } catch (err) {
      console.error('Error updating contribution:', err);
      alert('Error al actualizar la contribución');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACEPTADA': return 'badge-success';
      case 'ACEPTADA_CON_SUGERENCIA': return 'badge-info';
      case 'RECHAZADA': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACEPTADA': return 'Aprobada';
      case 'ACEPTADA_CON_SUGERENCIA': return 'Aprobada con observaciones';
      case 'RECHAZADA': return 'Rechazada';
      case 'PENDIENTE': return 'Pendiente de revisión';
      default: return status;
    }
  };

  if (!isAuthenticated) {
    return <div className="mis-contribuciones__msg">Debes iniciar sesión para ver tus contribuciones.</div>;
  }

  if (loading) {
    return <div className="mis-contribuciones__loading">Cargando...</div>;
  }

  if (error) {
    return <div className="mis-contribuciones__error">{error}</div>;
  }

  return (
    
    <div className="mis-contribuciones">
      <h2>Mis Contribuciones</h2>
      {contribuciones.length === 0 ? (
        <p>No has realizado ninguna contribución aún.</p>
      ) : (
        <div className="mis-contribuciones__list">
          {contribuciones.map((c) => (
            <div 
              key={c.idContribucion} 
              className="contribucion-card"
              onClick={() => handleCardClick(c)}
              style={{ cursor: 'pointer' }}
            >
              <div className="contribucion-card__header">
                <h3>{c.hecho.titulo}</h3>
                <div className="contribucion-card__status">
                  {c.revision && (
                    <span className={`badge ${getStatusBadgeClass(c.revision.estado)}`}>
                      {getStatusText(c.revision.estado)}
                    </span>
                  )}
                  <span className="contribucion-card__date">{c.hecho.fecha}</span>
                </div>
              </div>
              
              <p className="contribucion-card__desc">{c.hecho.descripcion}</p>
              
              <div className="contribucion-card__meta">
                <span className="badge">{c.hecho.categoria}</span>
                <span className="badge">{c.hecho.tipoDeHecho}</span>
              </div>

              {c.revision && c.revision.mensaje && (
                <div className="contribucion-card__feedback">
                  <strong>Feedback:</strong> {c.revision.mensaje}
                </div>
              )}
            
              {!c.anonimo? (c.revision && (c.revision.estado === 'ACEPTADA_CON_SUGERENCIA' || c.revision.estado === 'PENDIENTE') )&& (
                <button 
                  className="btn-edit"
                  onClick={(e) => handleEditClick(e, c)}
                >
                  Editar
                </button>
              ):<span 
                className="contribucion-card__status">
                  No se puede editar una contribución anónima
                </span>}
            </div>
          ))}
        </div>
      )}

      {editingContribucion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Contribución</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={editFormData.titulo}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={editFormData.descripcion}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={editFormData.fecha}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="categoria"
                  value={editFormData.categoria}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditFormData(prev => ({ ...prev, categoria: value }));
                    if (value === "__agregar__") {
                      setNuevaCategoria("");
                    }
                  }}
                  required
                >
                  <option value="">Seleccioná una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__agregar__">Otra</option>
                </select>
                {editFormData.categoria === "__agregar__" && (
                  <input
                    type="text"
                    placeholder="Ingresá nueva categoría"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <div style={{ marginBottom: '1rem' }}>
                  <UbicacionSelector
                    value={editFormData.ubicacion}
                    onChange={handleUbicacionChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingContribucion(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
