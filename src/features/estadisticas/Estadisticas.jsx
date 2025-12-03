import { useEffect, useState } from 'react';
import { VictoryPie, VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';
import './Estadisticas.css';
import { obtenerEstadisticas, exportarEstadisticasCSV } from '../../services/estadisticasService';

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
      return (
        <VictoryPie
          data={data}
          innerRadius={60}
          colorScale={data.map((item) => item.fill)}
          padAngle={1.5}
          labels={({ datum }) => `${datum.x}: ${datum.y}`}
          style={{ labels: { fill: '#e2e8f0', fontSize: 12 } }}
        />
      );
    }

    return (
      <VictoryChart theme={VictoryTheme.material} domainPadding={15} height={260} padding={{ top: 16, bottom: 60, left: 60, right: 24 }}>
        <VictoryAxis style={{ axis: { stroke: 'rgba(148, 163, 184, 0.4)' }, tickLabels: { fill: '#cbd5f5', angle: -35, fontSize: 10 } }} />
        <VictoryAxis dependentAxis style={{ axis: { stroke: 'rgba(148, 163, 184, 0.4)' }, tickLabels: { fill: '#cbd5f5', fontSize: 10 }, grid: { stroke: 'rgba(148, 163, 184, 0.2)' } }} />
        <VictoryBar
          data={data}
          style={{ data: { fill: '#38bdf8', width: 16 }, labels: { fill: '#e2e8f0', fontSize: 11 } }}
          cornerRadius={{ top: 4 }}
          labels={({ datum }) => datum.y }
        />
      </VictoryChart>
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
          <p className="section-eyebrow">Indicadores del agregador</p>
          <h1>Panel de estadísticas</h1>
          <p>Datos mockeados con la misma estructura del servicio /estadisticas. Reemplazá la llamada en estadisticasService para conectarlo a la API real.</p>
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
