import { useAuth } from '../../hooks/useAuth';
import './ImportacionDataSet.css' 
import { useRef, useState, useEffect } from 'react';
import { obtenerDataSetsAdmin } from '../../services/importacionesService';
import { DataSetCard } from './DataSetCard';
import { useNavigate } from 'react-router-dom';


export const ImportacionDataSet = () => {
    const {isAuthenticated, isAdmin} = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [archivo, setArchivo] = useState(null);
    const [dataSets, setDataSets] = useState([]);

    const fetchDataSets = async (background = false) => {
        try {
          if (!background) setLoading(true);
          const data = await obtenerDataSetsAdmin();
          setDataSets(data ?? []);
          setError('');
        } catch (err) {
          console.error(err);
          setError('No pudimos cargar las colecciones.');
        } finally {
          if (!background) setLoading(false);
        }
      };

const handleArchivoChange = (event) => {
  const file = event.target.files?.[0];
  if (file && file.size > 10 * 1024 * 1024) { 
     setError("El archivo es demasiado pesado (Max 10MB)");
     return;
  }
  setArchivo(file);
};

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            setLoading(false);
        return;
    }
        fetchDataSets();
    }, [isAuthenticated, isAdmin]);

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

  if (loading) return <section className="gestion-colecciones"><p>Cargando DataSets...</p></section>;
  if (error) return <section className="gestion-colecciones"><p className="error">{error}</p></section>;
    
    return <>
        <div className="contenedor-importacion">
            <div>
                <header className="contenedor-importacion__header">
                    <h1 className="contenedor-importacion__title">Importar DataSets</h1>
                    <input
                        type="file"
                        accept=".csv,.pdf"
                        ref={fileInputRef}
                        onChange={handleArchivoChange}
                        style={{ display: 'none' }} 
                        id="file-upload" 
                    />

                    <label htmlFor="file-upload" className="boton-personalizado">
                        {archivo ? archivo.name : "📂 Subir Archivo"}
                    </label>
                </header>
            </div>
            <div className='fuentes-lista'>
            {dataSets.length === 0 ? (
                <p className="gestion-colecciones__vacio">No hay DataSets registrados.</p>
                ) : (
                dataSets.map((ds) => (
                    <DataSetCard 
                    key={ds.ruta}
                    ds={ds}
                    />
                ))
            )}
            </div>

        </div>
    </>


}