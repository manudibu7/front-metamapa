import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GestionColecciones.css';
import {
  obtenerColeccionesAdmin,
  crearColeccion,
  actualizarColeccion,
  eliminarColeccion,
  obtenerFuentes,
} from '../../services/coleccionesAdminService';
import { useAuth } from '../../hooks/useAuth';

const criterioOptions = [
  {
    tipo: 'Categoría',
    valores: ['Incendio forestal', 'Vertido químico', 'Violencia policial', 'Detención arbitraria'],
  },
  {
    tipo: 'Provincia',
    valores: ['Buenos Aires', 'Santa Fe', 'Córdoba', 'Chaco', 'Misiones', 'Río Negro'],
  },
  {
    tipo: 'Estado',
    valores: ['Pendiente', 'Aprobada', 'Rechazada'],
  },
];

const consensusAlgorithms = [
  { value: 'MAYORIA_SIMPLE', label: 'Mayoría Simple' },
  { value: 'MULTIPLES_MENCIONES', label: 'Múltiples Menciones' },
  { value: 'ABSOLUTA', label: 'Consenso Absoluto' },
  { value: 'DEFAULT', label: 'Consenso Default' },
];

const buildEmptyForm = () => ({
  tituloInput: '',
  descripcionInput: '',
  fuentesInput: [], // Array of IDs
  criteriosInput: [],
  algoritmoConcenso: '',
});

export const GestionColecciones = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [colecciones, setColecciones] = useState([]);
  const [fuentesDisponibles, setFuentesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal / form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [submitting, setSubmitting] = useState(false);

  // Confirmación de eliminación
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cols, fuentes] = await Promise.all([
        obtenerColeccionesAdmin(),
        obtenerFuentes()
      ]);
      setColecciones(cols ?? []);
      setFuentesDisponibles(fuentes ?? []);
      setError('');
    } catch (err) {
      console.error('[GestionColecciones] Error cargando datos', err);
      setError('No pudimos cargar las colecciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [isAuthenticated, isAdmin]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(buildEmptyForm());
    setModalOpen(true);
  };

  const openEditModal = (coleccion) => {
    setEditingId(coleccion.id);
    setForm({
      tituloInput: coleccion.titulo ?? '',
      descripcionInput: coleccion.descripcion ?? '',
      fuentesInput: coleccion.fuentesIds ?? [],
      criteriosInput: (coleccion.Condiciones ?? []).map((c) => {
        const [tipo, valor] = (c.detail ?? '').split('=');
        return { id: c.id, tipo: tipo?.trim() ?? '', valor: valor?.trim() ?? '' };
      }),
      algoritmoConcenso: coleccion.consenso ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(buildEmptyForm());
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCriterioChange = (index, field, value) => {
    setForm((prev) => {
      const criterios = [...prev.criteriosInput];
      criterios[index] = { ...criterios[index], [field]: value };
      return { ...prev, criteriosInput: criterios };
    });
  };

  const addCriterio = () => {
    const defaultTipo = criterioOptions[0]?.tipo ?? '';
    const defaultValor = criterioOptions[0]?.valores?.[0] ?? '';
    setForm((prev) => ({
      ...prev,
      criteriosInput: [...prev.criteriosInput, { tipo: defaultTipo, valor: defaultValor }],
    }));
  };

  const removeCriterio = (index) => {
    setForm((prev) => ({
      ...prev,
      criteriosInput: prev.criteriosInput.filter((_, i) => i !== index),
    }));
  };

  const handleFuenteToggle = (fuenteId) => {
    setForm((prev) => {
      const actual = prev.fuentesInput ?? [];
      const existe = actual.includes(fuenteId);
      return {
        ...prev,
        fuentesInput: existe ? actual.filter((id) => id !== fuenteId) : [...actual, fuenteId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tituloInput.trim()) {
      alert('El título es obligatorio.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await actualizarColeccion(editingId, form);
      } else {
        await crearColeccion(form);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error('[GestionColecciones] Error guardando colección', err);
      alert('No pudimos guardar la colección. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await eliminarColeccion(id);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      console.error('[GestionColecciones] Error eliminando colección', err);
      alert('No pudimos eliminar la colección.');
    }
  };

  const getValoresForTipo = (tipo) => criterioOptions.find((opt) => opt.tipo === tipo)?.valores ?? [];

  if (!isAuthenticated || !isAdmin) {
    return (
      <section className="gestion-colecciones gestion-colecciones--denied">
        <div className="gestion-colecciones__denied">
          <span className="gestion-colecciones__denied-icon">🔒</span>
          <h2>Acceso restringido</h2>
          <p>Necesitás ser administrador para gestionar colecciones.</p>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/') }>
            Volver al inicio
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="gestion-colecciones">
        <p className="gestion-colecciones__estado">Cargando colecciones...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="gestion-colecciones">
        <p className="gestion-colecciones__estado gestion-colecciones__estado--error">{error}</p>
      </section>
    );
  }

  return (
    <section className="gestion-colecciones">
      <button type="button" className="gestion-colecciones__volver" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <header className="gestion-colecciones__header">
        <div>
          <p className="section-eyebrow">Administración</p>
          <h1>Gestión de colecciones</h1>
          <p>Creá, editá o eliminá colecciones del sistema.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreateModal}>
          + Nueva colección
        </button>
      </header>

      <div className="gestion-colecciones__lista">
        {colecciones.length === 0 ? (
          <p className="gestion-colecciones__vacio">No hay colecciones registradas.</p>
        ) : (
          colecciones.map((col) => (
            <article key={col.id} className="gestion-colecciones__card">
              <div className="gestion-colecciones__card-info">
                <h2>{col.titulo}</h2>
                <p>{col.descripcion}</p>
                <div className="gestion-colecciones__card-meta">
                  <span>Fuentes: {col.fuentesIds?.length ?? 0}</span>
                  <span>Criterios: {col.Condiciones?.length ?? 0}</span>
                </div>
              </div>
              <div className="gestion-colecciones__card-actions">
                <button type="button" className="btn btn--ghost" onClick={() => openEditModal(col)}>
                  Editar
                </button>
                {confirmDeleteId === col.id ? (
                  <>
                    <button type="button" className="btn btn--danger" onClick={() => handleDelete(col.id)}>
                      Confirmar
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => setConfirmDeleteId(null)}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn--danger-outline" onClick={() => setConfirmDeleteId(col.id)}>
                    Eliminar
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal crear / editar */}
      {modalOpen && (
        <div className="gestion-colecciones__modal-overlay" onClick={closeModal}>
          <div className="gestion-colecciones__modal" onClick={(e) => e.stopPropagation()}>
            <header className="gestion-colecciones__modal-header">
              <h2>{editingId ? 'Editar colección' : 'Nueva colección'}</h2>
              <button type="button" className="btn-close" onClick={closeModal}>×</button>
            </header>
            
            <form onSubmit={handleSubmit} className="gestion-colecciones__form">
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  name="tituloInput"
                  value={form.tituloInput}
                  onChange={handleFormChange}
                  required
                  maxLength={200}
                  placeholder="Ej: Incendios en Córdoba"
                />
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcionInput"
                  value={form.descripcionInput}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Breve descripción de la colección..."
                />
              </div>

              <div className="form-group">
                <label>Fuentes de datos</label>
                <div className="gestion-colecciones__fuentes-grid">
                  {fuentesDisponibles.map((fuente) => (
                    <label key={fuente.id} className={`fuente-checkbox ${form.fuentesInput.includes(fuente.id) ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.fuentesInput.includes(fuente.id)}
                        onChange={() => handleFuenteToggle(fuente.id)}
                      />
                      <span className="fuente-name">{fuente.nombre}</span>
                      <span className="fuente-type">{fuente.tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <div className="form-group-header">
                  <label>Criterios de selección</label>
                  <button type="button" className="btn btn--small btn--secondary" onClick={addCriterio}>
                    + Agregar criterio
                  </button>
                </div>
                
                {form.criteriosInput.length === 0 && (
                  <p className="text-muted">No hay criterios definidos.</p>
                )}

                <div className="criterios-list">
                  {form.criteriosInput.map((criterio, index) => (
                    <div key={index} className="criterio-row">
                      <select
                        value={criterio.tipo}
                        onChange={(e) => handleCriterioChange(index, 'tipo', e.target.value)}
                      >
                        {criterioOptions.map((opt) => (
                          <option key={opt.tipo} value={opt.tipo}>{opt.tipo}</option>
                        ))}
                      </select>
                      
                      <select
                        value={criterio.valor}
                        onChange={(e) => handleCriterioChange(index, 'valor', e.target.value)}
                      >
                        {getValoresForTipo(criterio.tipo).map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={() => removeCriterio(index)}
                        title="Eliminar criterio"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Algoritmo de Consenso</label>
                <select
                  name="algoritmoConcenso"
                  value={form.algoritmoConcenso}
                  onChange={handleFormChange}
                >
                  <option value="">Seleccionar algoritmo...</option>
                  {consensusAlgorithms.map((algo) => (
                    <option key={algo.value} value={algo.value}>
                      {algo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gestion-colecciones__modal-actions">
                <button type="button" className="btn btn--ghost" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar colección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
