import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GestionColecciones.css';
import {
  obtenerColeccionesAdmin,
  crearColeccion,
  actualizarColeccion,
  eliminarColeccion,
  fuentesDisponibles,
} from '../../services/coleccionesAdminService';
import { useAuth } from '../../hooks/useAuth';
{
  
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
  {
    tipo: 'Fuente',
    valores: fuentesDisponibles,
  },
];}

const buildEmptyForm = () => ({
  tituloInput: '',
  descripcionInput: '',
  fuentesInput: [],
  criteriosInput: [],
  algoritmoConcenso: '',
  //tagsInput: '',
});

export const GestionColecciones = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [colecciones, setColecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal / form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [submitting, setSubmitting] = useState(false);

  // Confirmación de eliminación
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchColecciones = async () => {
    try {
      setLoading(true);
      const data = await obtenerColeccionesAdmin();
      setColecciones(data ?? []);
      setError('');
    } catch (err) {
      console.error('[GestionColecciones] Error cargando colecciones', err);
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
    fetchColecciones();
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
      fuentesInput: coleccion.fuentes ?? [],
      criteriosInput: coleccion.criterios?.map(c => ({
        id: c.id ?? null,
        tipo: c.tipo,
        valor: c.valor
      })) ?? [],

      algoritmoConcenso: coleccion.consenso ?? '',
      //tagsInput: (coleccion.tags ?? []).join(', '),
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

  const handleFuenteToggle = (fuente) => {
    setForm((prev) => {
      const actual = prev.fuentesInput ?? [];
      const existe = actual.includes(fuente);
      return {
        ...prev,
        fuentesInput: existe ? actual.filter((item) => item !== fuente) : [...actual, fuente],
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
      fetchColecciones();
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
      fetchColecciones();
    } catch (err) {
      console.error('[GestionColecciones] Error eliminando colección', err);
      alert('No pudimos eliminar la colección.');
    }
  };

  const criterioTipos = useMemo(() => {
    const base = criterioOptions.map((opt) => opt.tipo);
    const dinamicos = (form.criteriosInput ?? []).map((c) => c.tipo).filter(Boolean);
    return Array.from(new Set([...base, ...dinamicos]));
  }, [form.criteriosInput]);

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
                {col.Condiciones?.length > 0 && (
                  <ul className="gestion-colecciones__condiciones">
                    {col.Condiciones.map((cond) => (
                      <li key={cond.id}>{cond.detail}</li>
                    ))}
                  </ul>
                )}
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
            <h2>{editingId ? 'Editar colección' : 'Nueva colección'}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Título
                <input
                  type="text"
                  name="tituloInput"
                  value={form.tituloInput}
                  onChange={handleFormChange}
                  required
                  maxLength={200}
                />
              </label>
              <label>
                Descripción
                <textarea
                  name="descripcionInput"
                  value={form.descripcionInput}
                  onChange={handleFormChange}
                  rows={3}
                />
              </label>
              <label>
                Algoritmo de consenso
                <input
                  type="text"
                  name="algoritmoConcenso"
                  value={form.algoritmoConcenso}
                  onChange={handleFormChange}
                  placeholder="Ej: Mayoría simple"
                />
              </label>
              {/* LO COMENTO POR QUE NO APLICAMOS EN NINGUN MOMENTO LAS ETIQUETAS
              <label>
                Tags (separados por coma)
                <input
                  type="text"
                  name="tagsInput"
                  value={form.tagsInput}
                  onChange={handleFormChange}
                  placeholder="Ej: Incendios, Bosques"
                />
              </label> */}

              <fieldset className="gestion-colecciones__fuentes">
                <legend>Fuentes habilitadas</legend>
                <div className="gestion-colecciones__fuentes-grid">
                  {fuentesDisponibles.map((fuente) => (
                    <label key={fuente} className="gestion-colecciones__fuente-option">
                      <input
                        type="checkbox"
                        checked={form.fuentesInput?.includes(fuente)}
                        onChange={() => handleFuenteToggle(fuente)}
                      />
                      <span>{fuente}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="gestion-colecciones__criterios">
                <legend>Criterios / Condiciones de Pertenencia</legend>
                {form.criteriosInput.map((criterio, idx) => (
                  <div key={idx} className="gestion-colecciones__criterio-row">
                    <select
                      value={criterio.tipo}
                      onChange={(e) => {
                        const nuevoTipo = e.target.value;
                        const valores = getValoresForTipo(nuevoTipo);
                        handleCriterioChange(idx, 'tipo', nuevoTipo);
                        if (valores.length) {
                          handleCriterioChange(idx, 'valor', valores[0]);
                        }
                      }}
                    >
                      <option value="" disabled>
                        Seleccionar criterio
                      </option>
                      {criterioTipos.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                    {getValoresForTipo(criterio.tipo).length ? (
                      <select
                        value={criterio.valor}
                        onChange={(e) => handleCriterioChange(idx, 'valor', e.target.value)}
                      >
                        {getValoresForTipo(criterio.tipo).map((valor) => (
                          <option key={valor} value={valor}>
                            {valor}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Valor"
                        value={criterio.valor}
                        onChange={(e) => handleCriterioChange(idx, 'valor', e.target.value)}
                      />
                    )}
                    <button type="button" className="btn btn--icon" onClick={() => removeCriterio(idx)}>
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn--ghost btn--sm" onClick={addCriterio}>
                  + Agregar criterio
                </button>
              </fieldset>

              <div className="gestion-colecciones__modal-actions">
                <button type="button" className="btn btn--ghost" onClick={closeModal} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
