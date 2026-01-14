import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { hechosService } from '../../services/hechosService';
import './HechoListNav.css';

export const HechosListNav = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hechos, setHechos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [todasLasCategorias, setTodasLasCategorias] = useState([]);
  const [todasLasProvincias, setTodasLasProvincias] = useState([]);

  const [pagina, setPagina] = useState(0); 
  const [metaData, setMetaData] = useState(null);
  const TAMANO_PAGINA = 10; 

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtrosTemp, setFiltrosTemp] = useState({});

  const opcionesFuente = [
    { value: 'estatica', label: 'Estatica' },
    { value: 'dinamica', label: 'Dinamica' },
    { value: 'proxy', label: 'Proxy' },
  ];

useEffect(() => {
    const cargarMaestros = async () => {
        // Opción A: Si tienes endpoints
        const cats = await hechosService.obtenerCategorias();
        setTodasLasCategorias(cats);
        const provs = await hechosService.obtenerProvincias();
        setTodasLasProvincias(provs);

    };
    cargarMaestros();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const filtros = Object.fromEntries([...searchParams]);
        const data = await hechosService.listarHechos(filtros, pagina, TAMANO_PAGINA);
        if (data.content) {
            setHechos(data.content);
            setMetaData(data.page || data); 
        } else {
            setHechos(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        setError('Ocurrió un error al cargar los hechos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, pagina]);

  const resetFiltros = () => {
    setFiltrosTemp({});
    setSearchParams({});
    setPagina(0); 
    setMostrarFiltros(false);
  };

  const handleAnterior = () => {
      if (pagina > 0) setPagina(prev => prev - 1);
  };

  const handleSiguiente = () => {
      if (metaData && pagina < metaData.totalPages - 1) {
          setPagina(prev => prev + 1);
      }
  };

  const handleCancelar = () => {
    setMostrarFiltros(false);
    setFiltrosTemp(Object.fromEntries([...searchParams]));
  };

  const handleAplicar = () => {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtrosTemp).filter(
          ([_, v]) => v !== '' && v !== null && v !== undefined
        )
      );
      setSearchParams(filtrosLimpios);
      setPagina(0);
      setMostrarFiltros(false);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="hechos-list-nav">

      {/* BOTÓN FILTROS */}
      <button
        className="btn-filtros"
        onClick={() => {
          setFiltrosTemp(Object.fromEntries([...searchParams]));
          setMostrarFiltros(true);
        }}
      >
        🔍 Filtros Avanzados
      </button>

      {hechos.length > 0 ? (
        <div className="hechos-list">
          {hechos.map(h => (
            <article
              key={h.id_hecho}
              className="hecho-card"
              onClick={() => navigate(`/hechos/${h.id_hecho}`)}
            >
              <div className="hecho-card__header">
                <span className="hecho-card__categoria">{h.categoria}</span>
                <span className="hecho-card__fecha">
                  {h.fecha ? new Date(h.fecha).toLocaleDateString() : ''}
                </span>
              </div>
              <h3 className="hecho-card__titulo">{h.titulo}</h3>
              <p className="hecho-card__descripcion">{h.descripcion}</p>
              <div className="hecho-card__footer">
                <span>{h.ubicacion?.provincia}</span>
                <span>Fuente: {h.fuente}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>No hay hechos disponibles.</p>
      )}

      {metaData && metaData.totalPages > 1 && (
        <div className="paginacion-container">
            <button 
                onClick={handleAnterior} 
                disabled={pagina === 0}
                className="btn-paginacion"
            >
                Anterior
            </button>
            
            <span className="info-paginacion">
                Página {metaData.number + 1} de {metaData.totalPages}
            </span>
            
            <button 
                onClick={handleSiguiente} 
                disabled={pagina >= metaData.totalPages - 1}
                className="btn-paginacion"
            >
                Siguiente
            </button>
        </div>
      )}

      {/* POPUP FILTROS */}
      {mostrarFiltros && (
        <div className="filtros-overlay">
          <div className="filtros-panel">

            <header className="filtros-panel__header">
              <h2>Filtros Avanzados</h2>
              <button onClick={() => setMostrarFiltros(false)}>✕</button>
            </header>

            <div className="filtros-panel__content">

              <div className="filtro-field">
                <label>Título</label>
                <input
                  type="text"
                  value={filtrosTemp.q || ''}
                  onChange={e => setFiltrosTemp({ ...filtrosTemp, q: e.target.value })}
                />
              </div>

              <div className="filtro-field">
                <label>Categoría</label>
                <select
                  value={filtrosTemp.categoria || ''}
                  onChange={e => setFiltrosTemp({ ...filtrosTemp, categoria: e.target.value })}
                >
                  <option value="">Todas</option>
                  {todasLasCategorias.map(c => (
                    <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="filtro-field">
                <label>Provincia</label>
                <select
                  value={filtrosTemp.provincia || ''}
                  onChange={e => 
                      setFiltrosTemp({
                        ...filtrosTemp,
                        provincia: e.target.value
                      })
                    }
                >
                  <option value="">Todas</option>
                  {todasLasProvincias.map(p => (
                    <option key={p.nombre} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtro-field">
                <label>Tipo de fuente</label>
                <select
                  value={filtrosTemp.fuenteTipo || ''}
                  onChange={e =>
                    setFiltrosTemp({ ...filtrosTemp, fuenteTipo: e.target.value })
                  }
                >
                  <option value="">Todas</option>
                  {opcionesFuente.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="filtro-field">
                <label>Fecha desde</label>
                <input
                  type="date"
                  value={filtrosTemp.fechaDesde || ''}
                  onChange={e =>
                    setFiltrosTemp({ ...filtrosTemp, fechaDesde: e.target.value })
                  }
                />
              </div>

              <div className="filtro-field">
                <label>Fecha hasta</label>
                <input
                  type="date"
                  value={filtrosTemp.fechaHasta || ''}
                  onChange={e =>
                    setFiltrosTemp({ ...filtrosTemp, fechaHasta: e.target.value })
                  }
                />
              </div>

            </div>

            <footer className="filtros-panel__actions">
              <button onClick={handleCancelar}>Cancelar</button>
              <button onClick={() => {
                  setFiltrosTemp({});
                  // Esto aplica limpieza inmediata, o puedes dejar que solo limpie temp y user deba dar click a "Filtrar"
              }}>Limpiar</button>
              <button
                className="btn-primary"
                onClick={handleAplicar}
              >
                Filtrar
              </button>
            </footer>

          </div>
        </div>
      )}

    </div>
  );
};
