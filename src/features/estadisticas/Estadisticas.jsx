import { useEffect, useState } from 'react';
import './Estadisticas.css';
import { obtenerEstadisticas, exportarEstadisticasCSV } from '../../services/estadisticasService';
import EstadisticaTorta from '../../components/Estadistica/EstadisticaTorta/estadisticaTorta';
import EstadisticaBarra from '../../components/Estadistica/EstadisticaBarra/estadisticaBarra';

const colors = ['#38bdf8', '#818cf8', '#f472b6', '#facc15', '#34d399', '#fb7185'];

export const Estadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [rawStats, setRawStats] = useState([]);
  
  // Processed data
  const [globalCategoryStat, setGlobalCategoryStat] = useState(null);
  const [spamStat, setSpamStat] = useState(null);
  
  // Selection options
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  
  // Selected values
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEstadisticas();
        setRawStats(data);
        processData(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const processData = (data) => {
    const cats = new Set();
    const cols = new Set();

    data.forEach(stat => {
      const discTipo = stat.discriminante?.tipo;
      const discValor = stat.discriminante?.valor;
      const resultName = stat.resultado?.nombre;

      // Infer type based on discriminante and result
      if (discTipo === 'SIN') {
        if (resultName === 'cantidad spam') {
          setSpamStat(stat);
        } else {
          setGlobalCategoryStat(stat);
        }
      } else if (discTipo === 'CATEGORIA') {
        cats.add(discValor);
      } else if (discTipo === 'COLECCION') {
        cols.add(discValor);
      }
    });

    const catsArray = Array.from(cats);
    const colsArray = Array.from(cols);

    setCategories(catsArray);
    setCollections(colsArray);

    if (catsArray.length > 0) setSelectedCategory(catsArray[0]);
    if (colsArray.length > 0) setSelectedCollection(colsArray[0]);
  };

  const renderChart = (estadistica) => {
    const data = (estadistica?.datos ?? []).map((dato, index) => ({
      x: dato.nombre,
      y: dato.cantidad,
      fill: colors[index % colors.length],
    }));

    if (!data.length) {
      return <p className="estadisticas__sin-datos">Sin datos disponibles.</p>;
    }

    if (data.length <= 5) {
  return <EstadisticaTorta data={data} />;
  }


    return <EstadisticaBarra data={data} />;
  };
  const grupoCategoria = estadisticas.filter(e => e.discriminante?.tipo === 'CATEGORIA');
  const grupoColeccion = estadisticas.filter(e => e.discriminante?.tipo === 'COLECCION');
  const grupoSin = estadisticas.filter(e => e.discriminante?.tipo === 'SIN');

  const renderSection = (titulo, listaEstadisticas) => {
    if (!listaEstadisticas || listaEstadisticas.length === 0) return null;

    return (
      <div className="estadisticas__grupo">
        {/* Puedes agregar una clase CSS para darle estilo al título si quieres */}
        <h2 style={{ margin: '2rem 0 1rem', fontSize: '1.5rem', color: '#333' }}>
          {titulo}
        </h2>
        
        <div className="estadisticas__grid">
          {listaEstadisticas.map((estadistica, index) => (
            <article key={`${estadistica?.discriminante?.valor ?? 'estadistica'}-${index}`} className="estadisticas__card">
              <div className="estadisticas__card-header">
                <div className="estadisticas__tag">
                  <span className="estadisticas__label">
                    {estadistica?.descripcion ?? 'ESTADISTICA'}
                    <b className="estadisticas__value">
                      {estadistica?.discriminante?.valor ?? 'Estadística'}
                    </b>
                  </span>
                </div>
                {estadistica?.resultado && (
                  <p className="estadisticas__resumen">
                    Resultado con más hechos: <strong>{estadistica.resultado.nombre + " con " + estadistica.resultado.cantidad + " hechos"}</strong>
                  </p>
                )}
              </div>
              <div className="estadisticas__chart">{renderChart(estadistica)}</div>
            </article>
          ))}
        </div>
      </div>
    );

    // Distinguish between hours and provinces based on data keys
    // Hours usually contain ':' (e.g. "13:00"), Provinces don't
    let hours = null;
    let provinces = null;

    categoryStats.forEach(stat => {
      const firstKey = stat.datos?.[0]?.nombre;
      if (firstKey && firstKey.includes(':')) {
        hours = stat;
      } else {
        provinces = stat;
      }
    });

    return { hours, provinces };
  };

  const getCollectionStats = () => {
    if (!selectedCollection) return { provinces: null };

    const provinces = rawStats.find(s => 
      s.discriminante?.tipo === 'COLECCION' && 
      s.discriminante?.valor === selectedCollection
    );

    return { provinces };
  };

  const categoryStats = getCategoryStats();
  const collectionStats = getCollectionStats();

  if (loading) return <div className="loading">Cargando estadísticas...</div>;

 return (
    <section className="estadisticas">
      <header className="estadisticas__encabezado">
        <div>
          <h1>Estadísticas de Metamapa</h1>
        </div>
        <button type="button" className="btn btn--primary" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Generando CSV...' : 'Descargar CSV'}
        </button>
      </header>

      {/* 3. Renderizamos los grupos en el orden solicitado */}
      
      {/* Grupo 1: Categoria */}
      {renderSection('Por Categoría', grupoCategoria)}

      {/* Grupo 2: Coleccion */}
      {renderSection('Por Colección', grupoColeccion)}

      {/* Grupo 3: Sin (Generales u otros) */}
      {renderSection('Generales', grupoSin)}

      {/* Mensaje por si no hay nada en ninguno de los grupos */}
      {estadisticas.length === 0 && (
         <p className="estadisticas__sin-datos">No hay estadísticas para mostrar.</p>
      )}

    </section>
  );
};
