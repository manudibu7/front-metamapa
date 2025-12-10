import { useEffect, useState } from 'react';
import { VictoryPie, VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';
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
          <h1>Panel de estadísticas</h1>
        </div>
        <button type="button" className="btn btn--primary" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Generando CSV...' : 'Descargar CSV'}
        </button>
      </header>

      <div className="estadisticas__grid">
        {estadisticas.map((estadistica, index) => (
          <article key={`${estadistica?.discriminante?.valor ?? 'estadistica'}-${index}`} className="estadisticas__card">
            <div className="estadisticas__card-header">
              <p className="estadisticas__tag">{estadistica?.discriminante?.tipo ?? 'ESTADISTICA'}</p>
              <h2>{estadistica?.discriminante?.valor ?? 'Estadística'}</h2>
              {estadistica?.resultado && (
                <p className="estadisticas__resumen">
                  Resultado destacado: <strong>{estadistica.resultado.nombre}</strong> ({estadistica.resultado.cantidad})
                </p>
              )}
            </div>
            <div className="estadisticas__chart">{renderChart(estadistica)}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
