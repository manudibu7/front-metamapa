import React, { useEffect, useState } from 'react';
import { 
  VictoryBar, 
  VictoryChart, 
  VictoryAxis, 
  VictoryTheme, 
  VictoryPie, 
  VictoryTooltip, 
  VictoryLabel,
  VictoryContainer
} from 'victory';
import { getEstadisticas, downloadCSV } from '../../services/estadisticasService';
import './Estadisticas.css';

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

  // Filtered stats based on selection
  const getCategoryStats = () => {
    if (!selectedCategory) return { hours: null, provinces: null };
    
    // Find stats for this category
    const categoryStats = rawStats.filter(s => 
      s.discriminante?.tipo === 'CATEGORIA' && 
      s.discriminante?.valor === selectedCategory
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
    <div className="estadisticas-container">
      <header className="estadisticas-header">
        <h1>Panel de Estadísticas</h1>
        <p>Visualización de métricas del sistema</p>
        <button className="btn-download" onClick={downloadCSV}>
          📥 Descargar Reporte CSV
        </button>
      </header>

      {/* Global Stats Section */}
      <section className="estadisticas-grid">
        {/* Spam Stat */}
        {spamStat && (
          <div className="estadistica-card">
            <h3>Solicitudes Spam</h3>
            <div className="spam-stat">
              <span className="spam-value">{spamStat.resultado.cantidad}</span>
              <span className="spam-label">Detectados como Spam</span>
              <span className="spam-total">
                de {spamStat.datos.find(d => d.nombre === 'cantidad total')?.cantidad || 0} totales
              </span>
            </div>
          </div>
        )}

        {/* Global Category Distribution */}
        {globalCategoryStat && (
          <div className="estadistica-card">
            <h3>Hechos por Categoría (Global)</h3>
            <div className="chart-container">
              <VictoryPie
                data={globalCategoryStat.datos}
                x="nombre"
                y="cantidad"
                colorScale="qualitative"
                innerRadius={50}
                labelRadius={({ innerRadius }) => innerRadius + 30 }
                style={{ labels: { fill: "white", fontSize: 12, fontWeight: "bold" } }}
                labels={({ datum }) => `${datum.nombre}\n(${datum.cantidad})`}
              />
            </div>
          </div>
        )}
      </section>

      {/* Category Specific Stats */}
      {categories.length > 0 && (
        <section className="estadisticas-section">
          <div className="controls-section">
            <label>Seleccionar Categoría:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="estadisticas-grid">
            {categoryStats.hours ? (
              <div className="estadistica-card">
                <h3>Distribución Horaria - {selectedCategory}</h3>
                <div className="chart-container">
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={20}
                    containerComponent={<VictoryContainer responsive={true}/>}
                  >
                    <VictoryAxis 
                      style={{ 
                        tickLabels: { fill: "white", fontSize: 10, angle: -45, textAnchor: 'end' },
                        axis: { stroke: "white" }
                      }} 
                    />
                    <VictoryAxis 
                      dependentAxis 
                      style={{ 
                        tickLabels: { fill: "white", fontSize: 10 },
                        axis: { stroke: "white" },
                        grid: { stroke: "rgba(255,255,255,0.1)" }
                      }} 
                    />
                    <VictoryBar
                      data={categoryStats.hours.datos}
                      x="nombre"
                      y="cantidad"
                      style={{ data: { fill: "#4ade80" } }}
                      labels={({ datum }) => datum.cantidad}
                      labelComponent={<VictoryLabel dy={-5} style={{ fill: "white", fontSize: 10 }} />}
                    />
                  </VictoryChart>
                </div>
              </div>
            ) : (
              <div className="estadistica-card">
                <h3>Distribución Horaria</h3>
                <p>No hay datos para esta categoría</p>
              </div>
            )}

            {categoryStats.provincias ? (
              <div className="estadistica-card">
                <h3>Distribución por Provincia - {selectedCategory}</h3>
                <div className="chart-container">
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={20}
                  >
                    <VictoryAxis 
                      style={{ 
                        tickLabels: { fill: "white", fontSize: 10, angle: -45, textAnchor: 'end' },
                        axis: { stroke: "white" }
                      }} 
                    />
                    <VictoryAxis 
                      dependentAxis 
                      style={{ 
                        tickLabels: { fill: "white", fontSize: 10 },
                        axis: { stroke: "white" },
                        grid: { stroke: "rgba(255,255,255,0.1)" }
                      }} 
                    />
                    <VictoryBar
                      data={categoryStats.provincias.datos}
                      x="nombre"
                      y="cantidad"
                      style={{ data: { fill: "#22d3ee" } }}
                      labels={({ datum }) => datum.cantidad}
                      labelComponent={<VictoryLabel dy={-5} style={{ fill: "white", fontSize: 10 }} />}
                    />
                  </VictoryChart>
                </div>
              </div>
            ) : (
              <div className="estadistica-card">
                <h3>Distribución por Provincia</h3>
                <p>No hay datos para esta categoría</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Collection Specific Stats */}
      {collections.length > 0 && (
        <section className="estadisticas-section">
          <div className="controls-section">
            <label>Seleccionar Colección:</label>
            <select 
              value={selectedCollection} 
              onChange={(e) => setSelectedCollection(e.target.value)}
            >
              {collections.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="estadisticas-grid">
            {collectionStats.provincias ? (
              <div className="estadistica-card">
                <h3>Hechos por Provincia - {selectedCollection}</h3>
                <div className="chart-container">
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={20}
                  >
                    <VictoryAxis 
                      style={{ 
                        tickLabels: { fill: "white", fontSize: 10, angle: -45, textAnchor: 'end' },
                        axis: { stroke: "white" }
                      }} 
                    />
                    <VictoryAxis 
                      dependentAxis 
                      style={{ 
                        tickLabels: { fill: "white", fontSize: 10 },
                        axis: { stroke: "white" },
                        grid: { stroke: "rgba(255,255,255,0.1)" }
                      }} 
                    />
                    <VictoryBar
                      data={collectionStats.provincias.datos}
                      x="nombre"
                      y="cantidad"
                      style={{ data: { fill: "#f472b6" } }}
                      labels={({ datum }) => datum.cantidad}
                      labelComponent={<VictoryLabel dy={-5} style={{ fill: "white", fontSize: 10 }} />}
                    />
                  </VictoryChart>
                </div>
              </div>
            ) : (
              <div className="estadistica-card">
                <h3>Hechos por Provincia</h3>
                <p>No hay datos para esta colección</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
