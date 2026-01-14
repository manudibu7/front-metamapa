import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GestionColecciones.css';
import {
  obtenerColeccionesAdmin,
  crearColeccion,
  actualizarColeccion,
  eliminarColeccion,
  obtenerFuentes
} from '../../services/coleccionesAdminService';
import { useAuth } from '../../hooks/useAuth';
import { getCategorias } from '../../services/contribucionesService';

// Importar Sub-componentes
// Asegúrate de poner la ruta correcta donde guardaste los archivos nuevos
import { CollectionCard } from './CollectionCard'; 
import { CollectionForm } from './CollectionForm';
import { SuccessPopup } from './SuccessPopup';

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
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Estado para el Resumen del Popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null); 

  const fetchColecciones = async (background = false) => {
    try {
      if (!background) setLoading(true);
      const data = await obtenerColeccionesAdmin();
      setColecciones(data ?? []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No pudimos cargar las colecciones.');
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDatosExternos = async () => {
      try {
        const fuentesResponse = await obtenerFuentes();
        setFuentes(fuentesResponse.map(f => ({
          nombre: f.nombre,
          tipo: f.tipoFuente
        })));
        
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

  const handleClosePopup = async () => {
    setPopupOpen(false);
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
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.titulo.trim()) { setFormError('El título es obligatorio.'); return; }
    if (!form.descripcion.trim()) { setFormError('La descripcion es obligatoria.'); return; }
    if (!form.fuentes || form.fuentes.length === 0) { setFormError("Tiene que tener al menos una fuente"); return; }
    if (!form.algoritmoConcenso) { setFormError("Debe elegir un algoritmo de concenso"); return; }

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
        const updated = await actualizarColeccion(editingId, form);
        setColecciones(prev => prev.map(c => c.id_coleccion === editingId ? (updated ?? { ...c, ...form }) : c));
        setSummaryData({ type: 'UPDATE', newData: { ...form }, oldData: oldData });
      } else {
        const created = await crearColeccion(form);
        if (created && (created.id_coleccion || created.id)) {
          const idCreated = created.id_coleccion ?? created.id;
          const objeto = { ...(created.titulo ? created : form), id_coleccion: idCreated };
          setColecciones(prev => [objeto, ...prev]);
          setSummaryData({ type: 'CREATE', newData: objeto, oldData: null });
        } else {
          setSummaryData({ type: 'CREATE', newData: { ...form }, oldData: null });
        }
      }
      await fetchColecciones(true);
      closeModal();
      setPopupOpen(true);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar la colección.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id_coleccion) => {
    try {
      setLoadingDelete(true);
      if (!id_coleccion) return;
      
      const colToDelete = colecciones.find(c => c.id_coleccion === id_coleccion);
      const datosNormalizados = {
        titulo: colToDelete.titulo,
        descripcion: colToDelete.descripcion,
        algoritmoConcenso: colToDelete.algoritmoConcenso || colToDelete.algoritmoDeConsenso || '',
        fuentes: (colToDelete.fuentes ?? []).map(f => {
            if (typeof f === 'string') return f;
            return f.nombre || f.name || f; 
        }),
        criterios: colToDelete.criterios?.map(c => ({
            id: c.id,
            tipo: c.tipo,
            valor: c.valor
        })) ?? []
      };

      await eliminarColeccion(id_coleccion);
      setConfirmDeleteId(null);
      setColecciones(prev => prev.filter(c => c.id_coleccion !== id_coleccion));
      
      setSummaryData({ 
        type: 'DELETE', 
        newData: datosNormalizados, 
        oldData: null 
      });

      setLoadingDelete(false);
      setPopupOpen(true);
      await fetchColecciones(true);
    } catch (err) {
      console.error(err);
      alert('No pudimos eliminar la colección.');
    }
  };

  // --- Render ---

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
          Crear nueva colección
        </button>
      </header>

      <div className="gestion-colecciones__lista">
        {colecciones.length === 0 ? (
          <p className="gestion-colecciones__vacio">No hay colecciones registradas.</p>
        ) : (
          colecciones.map((col) => (
            <CollectionCard 
              key={col.id_coleccion}
              col={col}
              onEdit={openEditModal}
              onDelete={handleDelete}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              loadingDelete={loadingDelete}
            />
          ))
        )}
      </div>

      {/* Modal Formulario */}
      {modalOpen && (
        <div className="gestion-colecciones__modal-overlay" onClick={closeModal}>
          <div className="gestion-colecciones__modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Editar colección' : 'Nueva colección'}</h2>
            
            <CollectionForm 
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              submitting={submitting}
              errorMsg={formError}
              fuentesDisponibles={fuentes}
              categoriasOptions={categoriasOptions}
            />
          </div>
        </div>
      )}

      {/* Popup de Éxito */}
      <SuccessPopup 
        open={popupOpen} 
        summaryData={summaryData} 
        onClose={handleClosePopup} 
      />

    </section>
  );
};