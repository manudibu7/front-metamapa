import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GestionColecciones.css';
import {
  obtenerColeccionesAdmin,
  crearColeccion,
  actualizarColeccion,
  eliminarColeccion,
} from '../../services/coleccionesAdminService';
import { useAuth } from '../../hooks/useAuth';
import { obtenerFuentes } from '../../services/collectionsService';
import { getCategorias } from '../../services/contribucionesService'; // <--- AGREGAR


const buildEmptyForm = () => ({
  titulo: '',
  descripcion: '',
  fuentes: [],
  criterios: [],
  algoritmoConcenso: '',
  //tagsInput: '',
});

export const GestionColecciones = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [colecciones, setColecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fuentes, setFuentes] = useState([]);

  const [categoriasOptions, setCategoriasOptions] = useState([]);
  
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
    const fetchDatosExternos = async () => {
      try {
        const fuentesResponse = await obtenerFuentes();

        setFuentes(fuentesResponse.map(f => f.nombre));
        const categoriasResponse = await getCategorias(); 
        const listaCategorias = Array.isArray(categoriasResponse) ? categoriasResponse : (categoriasResponse?.datos || []);
        // Guardamos solo los nombres en el estado
        setCategoriasOptions(listaCategorias.map(c => c.nombre || c)); 
      } catch (error) {
        setError(error?.message ?? "No se pudo obtener las categorias.");
      }
    };
      fetchDatosExternos();
  }, []);

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
    setEditingId(coleccion.id_coleccion);
    const fuentesMapeadas = (coleccion.fuentes ?? []).map(f => {
        if (typeof f === 'string') return f;
        return f.nombre || f.name || f; // Intenta propiedades comunes
    });

    // Recuperar algoritmo considerando posibles nombres (typo vs correcto)
    const alg = coleccion.algoritmoConcenso || coleccion.algoritmoDeConsenso || '';
    setForm({
      titulo: coleccion.titulo ?? '',
      descripcion: coleccion.descripcion ?? '',
      fuentes: fuentesMapeadas,
      criterios: coleccion.criterios?.map(c => ({
        id: c.id ?? null,
        tipo: c.tipo,
        valor: c.valor
      })) ?? [],

      algoritmoConcenso:alg,
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
      const criterios = [...prev.criterios];
      criterios[index] = { ...criterios[index], [field]: value };
      return { ...prev, criterios: criterios };
    });
  };

  const addCriterio = (tipo, valor) => {
    const defaultTipo = tipo ?? '';
    const defaultValor = valor ?? '';
    setForm((prev) => ({
      ...prev,
      criterios: [...prev.criterios, { tipo: defaultTipo, valor: defaultValor }],
    }));
  };

  const removeCriterio = (index) => {
    setForm((prev) => ({
      ...prev,
      criterios: prev.criterios.filter((_, i) => i !== index),
    }));
  };
  const removeFuente = (fuenteAEliminar) => {
     setForm((prev) => ({
       ...prev,
       fuentes: prev.fuentes.filter(f => f !== fuenteAEliminar)
     }));
  };

  const handleFuenteToggle = (fuente) => {
    setForm((prev) => {
      const actual = prev.fuentes ?? [];
      const existe = actual.includes(fuente);
      return {
        ...prev,
        fuentes: existe ? actual.filter((item) => item !== fuente) : [...actual, fuente],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
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

const algoritmosDisponibles = [
    { label: "Mayoría Simple", value: "MAYORIA_SIMPLE" },
    { label: "Absoluta", value: "ABSOLUTA" },
    { label: "Default", value: "DEFAULT" },
    { label: "Múltiples Menciones", value: "MULTIPLES_MENCIONES" }
  ];

  const configCriterios = {
    fechaAntes: { 
      inputType: 'date', 
      options: [] 
    },
    fechaDespues: { 
      inputType: 'date', 
      options: [] 
    },
    Categoria: { 
      inputType: 'select',        
      options: categoriasOptions  
    },
    etiqueta: { 
      inputType: 'text', 
      options: [] 
    },
    titulo: { 
      inputType: 'text', 
      options: [] 
    }
  };

  const criterioTipos = Object.keys(configCriterios);


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
            <article key={col.id_coleccion} className="gestion-colecciones__card">
              <div className="gestion-colecciones__card-info">
                <h2>{col.titulo}</h2>
                <p>{col.descripcion}</p>
                  <h4 className='gestion-colecciones-titulo-condiciones'>Condiciones: </h4>
                  <ul className="gestion-colecciones__condiciones">
                    {col.criterios.map((cond) => (
                      <li key={cond.id}>{cond.tipo} = {cond.valor}</li>
                    ))}
                  </ul>
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
                  name="titulo"
                  value={form.titulo}
                  onChange={handleFormChange}
                  required
                  maxLength={200}
                />
              </label>
              <label>
                Descripción
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleFormChange}
                  rows={3}
                />
              </label>
              <label>
                Algoritmo de concenso
                <select 
                value={form.algoritmoConcenso}
                onChange={(e) => {
                    const value = e.target.value;
                    setForm(prev => ({
                      ...prev,
                      algoritmoConcenso: value, // Aquí ya se asigna el VALUE (con guion bajo)
                    }));
                  }}
                >
                  <option value={""}>Selecciona un algoritmo</option>
                  {algoritmosDisponibles.map(algoritmo => (
                    // Usamos objeto {label, value} para que Java reciba el formato correcto
                    <option key={algoritmo.value} value={algoritmo.value}>
                      {algoritmo.label}
                    </option>
                  ))}
                </select>
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
                <label>Fuente
                <select
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                    
                      setForm((prev) => ({
                        ...prev,
                        fuentes: [...(prev.fuentes || []), val] // asegura que sea siempre array
                      }));
                    
                      // Resetear el select
                      e.target.selectedIndex = 0;
                    }}
                  >
                  <option value="">Agregar fuente...</option>
                  {fuentes.map((f) => (
                    <option key={f} value={f.nombre}>
                      {f}
                    </option>
                  ))}
                </select>

                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {form.fuentes.map((f) => (
                    <span key={f} style={{ background: '#e0e7ff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {f}
                      <button 
                        type="button" 
                        onClick={() => removeFuente(f)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', fontWeight: 'bold' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </fieldset>
              <fieldset className="gestion-colecciones__criterios">
                <legend>Criterios / Condiciones de Pertenencia</legend>
                  {form.criterios.map((criterio, idx) => {
                  // 1. Obtenemos la config para este criterio actual
                  const config = configCriterios[criterio.tipo] || { inputType: 'text', options: [] };
                  return(
                    <div key={idx} className="gestion-colecciones__criterio-row">
                      {/* SELECTOR DE TIPO (Fecha, Fuente, etc.) */}
                      <select
                        value={criterio.tipo}
                        onChange={(e) => {
                          const nuevoTipo = e.target.value;
                          // Al cambiar el tipo, limpiamos el valor para evitar errores
                          handleCriterioChange(idx, 'tipo', nuevoTipo);
                          handleCriterioChange(idx, 'valor', ''); 
                        }}
                      >
                        {criterioTipos.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                      {config.inputType === 'select' ? (
                        /* CASO: DESPLEGABLE (Solo para Fuente) */
                        <select
                          value={criterio.valor}
                          onChange={(e) => handleCriterioChange(idx, 'valor', e.target.value)}
                        >
                          <option value="" disabled>Seleccionar...</option>
                          {config.options.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      ) : (
                        /* CASO: INPUT (Fecha o Texto) */
                        <input
                          type={config.inputType} // Aquí se convierte en 'date' o 'text' automágicamente
                          placeholder="Valor"
                          value={criterio.valor}
                          onChange={(e) => handleCriterioChange(idx, 'valor', e.target.value)}
                        />
                      )}

                      <button type="button" className="btn btn--icon" onClick={() => removeCriterio(idx)}>
                        ✕
                      </button>
                    </div>
                    );
                  })}
                <button 
                  type="button" 
                  className="btn btn--ghost btn--sm" 
                  onClick={() => addCriterio(criterioTipos[0], '')}
                >
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
