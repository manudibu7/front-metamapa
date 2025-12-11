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
import { getCategorias } from '../../services/contribucionesService';

const buildEmptyForm = () => ({
  titulo: '',
  descripcion: '',
  fuentes: [],
  criterios: [],
  algoritmoConcenso: '',
});

export const GestionColecciones = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Datos
  const [colecciones, setColecciones] = useState([]);
  const [fuentes, setFuentes] = useState([]);
  const [categoriasOptions, setCategoriasOptions] = useState([]);

  // Estados de carga/error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Estado para el Resumen del Popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null); 

  // Función para traer datos. 
  // background=true: actualiza sin borrar la pantalla (silencioso).
  // background=false: muestra el "Cargando..." (pantalla completa).
  const fetchColecciones = async (background = false) => {
  try {
    console.log('[GestionColecciones] fetchColecciones called, background=', background);
    if (!background) setLoading(true);

    const data = await obtenerColeccionesAdmin();
    console.log('[GestionColecciones] obtenerColeccionesAdmin response:', data);
    setColecciones(data ?? []);
    setError('');
  } catch (err) {
    console.error('[GestionColecciones] Error cargando colecciones', err);
    setError('No pudimos cargar las colecciones.');
  } finally {
    if (!background) setLoading(false);
  }
};

  useEffect(() => {
    const fetchDatosExternos = async () => {
      try {
        const fuentesResponse = await obtenerFuentes();
        setFuentes(fuentesResponse.map(f => f.nombre));
        
        const categoriasResponse = await getCategorias(); 
        const listaCategorias = Array.isArray(categoriasResponse) ? categoriasResponse : (categoriasResponse?.datos || []);
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

  // --- NUEVA FUNCIÓN: Maneja el cierre del popup y la recarga ---
 const handleClosePopup = async () => {
  console.log('[GestionColecciones] handleClosePopup - cerrando popup y recargando colecciones');
  setPopupOpen(false);
  try {
    await fetchColecciones(true); // recarga visible
  } catch (err) {
    console.error('[GestionColecciones] error en handleClosePopup fetchColecciones', err);
  }
};

  const openCreateModal = () => {
    setEditingId(null);
    setForm(buildEmptyForm());
    setModalOpen(true);
  };

  const openEditModal = (coleccion) => {
    setEditingId(coleccion.id_coleccion);
    const fuentesMapeadas = (coleccion.fuentes ?? []).map(f => {
        if (typeof f === 'string') return f;
        return f.nombre || f.name || f; 
    });

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
      algoritmoConcenso: alg,
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

 const addCriterio = () => {
    setForm((prev) => ({
      ...prev,
      // Inicializamos tipo en vacío para forzar la selección
      criterios: [...prev.criterios, { tipo: "", valor: "" }], 
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

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.titulo.trim()) {
    alert('El título es obligatorio.');
    return;
  }
  setSubmitting(true);

  let oldData = null;
  if (editingId) {
    const original = colecciones.find(c => c.id_coleccion === editingId);
    if (original) {
      oldData = {
        titulo: original.titulo,
        descripcion: original.descripcion,
        algoritmoConcenso: original.algoritmoConcenso || original.algoritmoDeConsenso,
        fuentes: (original.fuentes || []).map(f => typeof f === 'string' ? f : f.nombre),
        criterios: original.criterios || []
      };
    }
  }

  try {
    if (editingId) {
      console.log('[GestionColecciones] actualizarColeccion -> id:', editingId, 'payload:', form);
      const updated = await actualizarColeccion(editingId, form); // idealmente el back devuelve el objeto actualizado
      console.log('[GestionColecciones] actualizarColeccion response:', updated);

      // Actualizo la lista localmente (optimistic + seguro)
      setColecciones(prev => prev.map(c => c.id_coleccion === editingId ? (updated ?? { ...c, ...form }) : c));

      setSummaryData({ type: 'UPDATE', newData: { ...form }, oldData: oldData });
    } else {
      console.log('[GestionColecciones] crearColeccion payload:', form);
      const created = await crearColeccion(form); // idealmente devuelve objeto creado con id_coleccion
      console.log('[GestionColecciones] crearColeccion response:', created);

      // Si el backend devuelve el objeto creado, lo agrego; si no, hago refetch más abajo.
      if (created && (created.id_coleccion || created.id)) {
        const idCreated = created.id_coleccion ?? created.id;
        const objeto = { ...(created.titulo ? created : form), id_coleccion: idCreated };
        setColecciones(prev => [objeto, ...prev]);
        setSummaryData({ type: 'CREATE', newData: objeto, oldData: null });
      } else {
        // fallback: no vino el objeto, pedimos recarga al cerrar popup
        setSummaryData({ type: 'CREATE', newData: { ...form }, oldData: null });
      }
    }

    closeModal();
    setPopupOpen(true);
  } catch (err) {
    console.error('[GestionColecciones] Error guardando colección', err);
    alert("Ocurrió un error al guardar la colección.");
  } finally {
    setSubmitting(false);
  }
};

const handleDelete = async (id_coleccion) => {
  try {
    if (!id_coleccion) {
      console.warn('[GestionColecciones] handleDelete called with falsy id:', id_coleccion);
      return;
    }
    console.log('[GestionColecciones] eliminarColeccion id:', id_coleccion);
    await eliminarColeccion(id_coleccion);
    setConfirmDeleteId(null);

    // Actualizo localmente sin refetch
    setColecciones(prev => prev.filter(c => c.id_coleccion !== id_coleccion));

    // y por si acaso, dispara un fetch silencioso para asegurar consistencia
    await fetchColecciones(true);
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
    fechaAntes: { inputType: 'date', options: [] },
    fechaDespues: { inputType: 'date', options: [] },
    categoria: { inputType: 'select', options: categoriasOptions },
    etiqueta: { inputType: 'text', options: [] },
    titulo: { inputType: 'text', options: [] }
  };

  const criterioTipos = Object.keys(configCriterios);

  const renderSummary = () => {
    if (!summaryData) return null;
    const { type, newData, oldData } = summaryData;
    const isUpdate = type === 'UPDATE';
    const hasChanged = (field) => isUpdate && oldData && newData[field] !== oldData[field];

    return (
        <div className="modal-summary">
            <p className="summary-row">
                <strong>Título:</strong>{' '}
                <span className={hasChanged('titulo') ? 'value-modified' : ''}>
                    {newData.titulo}
                </span>
                {/* Mantenemos el "Antes" solo para el título por contexto, pero sin la etiqueta "Modificado" */}
                {hasChanged('titulo') && <span className="old-value-badge"> (Antes: {oldData.titulo})</span>}
            </p>
            
            <p className="summary-row">
                <strong>Descripción:</strong>{' '}
                <span className={hasChanged('descripcion') ? 'value-modified' : ''}>
                    {newData.descripcion || <em>Sin descripción</em>}
                </span>
            </p>

            <p className="summary-row">
                <strong>Algoritmo:</strong>{' '}
                <span className={hasChanged('algoritmoConcenso') ? 'value-modified' : ''}>
                    {newData.algoritmoConcenso || <em>No seleccionado</em>}
                </span>
            </p>

            <div className="summary-block">
                <strong>Fuentes ({newData.fuentes.length}):</strong>
                <div className="tags-container">
                    {newData.fuentes.map(f => <span key={f} className="tag">{f}</span>)}
                </div>
            </div>

            <div className="summary-block">
                <strong>Criterios ({newData.criterios.length}):</strong>
                <ul className="criteria-list">
                    {newData.criterios.map((c, i) => (
                        <li key={i}>{c.tipo}: <b>{c.valor}</b></li>
                    ))}
                </ul>
            </div>
            
            {isUpdate && <p className="summary-footer-note"><i>* Los valores resaltados indican cambios recientes.</i></p>}
        </div>
    );
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <section className="gestion-colecciones gestion-colecciones--denied">
        <div className="gestion-colecciones__denied">
          <span className="gestion-colecciones__denied-icon">🔒</span>
          <h2>Acceso restringido</h2>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/') }>
            Volver al inicio
          </button>
        </div>
      </section>
    );
  }

  if (loading) return <section className="gestion-colecciones"><p>Cargando colecciones...</p></section>;
  if (error) return <section className="gestion-colecciones"><p className="error">{error}</p></section>;

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
                onChange={(e) => setForm(prev => ({ ...prev, algoritmoConcenso: e.target.value }))}
                >
                  <option value={""}>Selecciona un algoritmo</option>
                  {algoritmosDisponibles.map(alg => (
                    <option key={alg.value} value={alg.value}>{alg.label}</option>
                  ))}
                </select>
              </label>

              <fieldset className="gestion-colecciones__fuentes">
                <label>Fuente
                <select
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      setForm((prev) => ({
                        ...prev,
                        fuentes: [...(prev.fuentes || []), val]
                      }));
                      e.target.selectedIndex = 0;
                    }}
                  >
                  <option value="">Agregar fuente...</option>
                  {fuentes.map((f) =>{const isSelected = form.fuentes.includes(f);
                    return (
                      <option 
                        key={f} 
                        value={f} 
                        disabled={isSelected} // Deshabilitamos si ya está seleccionada
                        style={isSelected ? { color: '#999', fontStyle: 'italic', background: '#f5f5f5' } : {}}
                      >
                        {f} {isSelected ? '(Seleccionado)' : ''}
                      </option>
                    );
                  })}
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
                  const config = configCriterios[criterio.tipo] || { inputType: 'text', options: [] };
                    // --- VARIABLES NUEVAS ---
                    // A. Si tiene ID, significa que vino del Backend (es viejo)
                    const isExisting = !!criterio.id; 

                    // B. Chequeamos si es tipo fecha
                    const isDate = config.inputType === 'date';

                    // C. Calculamos si el VALOR debe estar bloqueado:
                    const showAsLabel = isExisting && !isDate;
                    const existeCategoria = form.criterios.some(c => c.tipo === 'categoria');
                    const existeFechaAntes = form.criterios.some(c => c.tipo === 'fechaAntes');
                    const existeFechaDespues = form.criterios.some(c => c.tipo === 'fechaDespues');
                    if (showAsLabel) {
                    return (
                      <div key={idx} className="gestion-colecciones__criterio-row criterio-label-mode">
                        <span className="criterio-label-text">
                          <strong>{criterio.tipo}:</strong> {criterio.valor}
                        </span>
                        <span title="Condición guardada (Solo lectura)" style={{ cursor: 'help', marginRight: 'auto', marginLeft: '8px' }}>
                           💾
                        </span>
                        <button type="button" className="btn btn--icon" onClick={() => removeCriterio(idx)}>✕</button>
                      </div>
                    );
                  }
                 return(
                    <div key={idx} className="gestion-colecciones__criterio-row">
                      <select
                        value={criterio.tipo}
                        // Si es viejo (y es fecha, porque cayó aquí), bloqueamos el tipo para no cambiar "Fecha" por "Titulo"
                        disabled={isExisting} 
                        onChange={(e) => {
                          handleCriterioChange(idx, 'tipo', e.target.value);
                          handleCriterioChange(idx, 'valor', ''); 
                        }}
                      >
                        <option value="" disabled>Seleccionar criterio...</option>
                        {criterioTipos.map((tipo) => (
                          <option 
                            key={tipo} 
                            value={tipo}
                            disabled={tipo === 'categoria' && existeCategoria && criterio.tipo !== 'categoria' || 
                              tipo === 'fechaAntes' && existeFechaAntes && criterio.tipo !== 'fechaAntes' ||
                              tipo === 'fechaDespues' && existeFechaDespues && criterio.tipo !== 'fechaDespues'}
                          >
                            {tipo}
                          </option>
                        ))}
                      </select>

                      {config.inputType === 'select' ? (
                        <select
                          value={criterio.valor}
                          onChange={(e) => handleCriterioChange(idx, 'valor', e.target.value)}
                        >
                          <option value="" disabled>Seleccionar...</option>
                          {config.options.map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={config.inputType}
                          placeholder="Valor"
                          value={criterio.valor}
                          // Aquí NO ponemos disabled, porque si cayó en este return es porque es editable (o es nuevo o es fecha)
                          onChange={(e) => handleCriterioChange(idx, 'valor', e.target.value)}
                        />
                      )}
                      
                      <button type="button" className="btn btn--icon" onClick={() => removeCriterio(idx)}>✕</button>
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

      {/* --- POPUP DE ÉXITO CON RESUMEN --- */}
      {/* Usamos handleClosePopup al hacer clic en el botón o en el fondo */}
      {popupOpen && summaryData && (
        <div className="modal-overlay" onClick={handleClosePopup}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-success-icon">✓</div>
            
            <h3>
                {summaryData.type === 'CREATE' ? '¡Colección Creada!' : '¡Colección Actualizada!'}
            </h3>
            <p style={{ color: '#666' }}>
               La operación se realizó con éxito.
            </p>
            
            {renderSummary()}

            <div className="modal-actions">
                <button 
                  className="btn btn--primary" 
                  onClick={handleClosePopup}
                >
                  Cerrar
                </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};