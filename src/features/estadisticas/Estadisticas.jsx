import { useEffect, useState } from 'react';
import './Estadisticas.css';
import { obtenerEstadisticas, exportarEstadisticasCSV } from '../../services/estadisticasService';
import EstadisticaTorta from '../../components/Estadistica/EstadisticaTorta/estadisticaTorta';
import EstadisticaBarra from '../../components/Estadistica/EstadisticaBarra/estadisticaBarra';

const colors = ['#38bdf8', '#818cf8', '#f472b6', '#facc15', '#34d399', '#fb7185'];

export const Estadisticas = () => {
  const [estadisticas, setEstadisticas] = useState([]);
  const [estado, setEstado] = useState({ loading: true, error: '' });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const data = await obtenerEstadisticas();
        setEstadisticas(data ?? []);
        setEstado({ loading: false, error: '' });
      } catch (error) {
        setEstado({ loading: false, error: 'No pudimos cargar las estadísticas.' });
        console.error('[Estadísticas] Error al cargar estadísticas', error);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const csv = await exportarEstadisticasCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'estadisticas.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[Estadísticas] Error al exportar CSV', error);
      alert('No pudimos generar el CSV. Intentá nuevamente.');
    } finally {
      setDownloading(false);
    }
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
  };

  if (estado.loading) {
    return (
      <section className="estadisticas">
        <p className="estadisticas__estado">Cargando estadísticas...</p>
      </section>
    );
  }

  if (estado.error) {
    return (
      <section className="estadisticas">
        <p className="estadisticas__estado estadisticas__estado--error">{estado.error}</p>
      </section>
    );
  }

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