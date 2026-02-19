import {useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { icon } from 'leaflet';
import { collectionsService } from '../../services/collectionsService';
import './ColeccionDetalle.css';
import { useNavigation } from '../../context/NavigationContext';

// ... (markerIcon se queda igual) ...
const markerIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});



export const ColeccionDetalle = () => {

  const { id } = useParams();
  const navigate = useNavigate();

 

  const [coleccion, setColeccion] = useState(null);
  const [hechos, setHechos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHecho, setSelectedHecho] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtrosTemp, setFiltrosTemp] = useState({});

const resetFiltros = () => {
  setFiltrosTemp({}); 
  setSearchParams({}); 
  setMostrarFiltros(false);
};


const opcionesFuente = [
  { value: 'estatica', label: 'Estatica' },
  { value: 'dinamica', label: 'Dinamica' },
  { value: 'proxy', label: 'Proxy' },
];

const updateFilter = (key, value) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      return newParams;
    });
  };

const provinciasUnicas = useMemo(() => {
    const mapa = new Map();
    hechos.forEach((h) => {
      if (h.ubicacion?.provincia) {
        if (!mapa.has(h.ubicacion.provincia)) {
          mapa.set(h.ubicacion.provincia, h.ubicacion);
        }
      }
    });
    return Array.from(mapa.values());
  }, [hechos]);

const categorias = useMemo(() => {
  const lista = hechos.map((h) => h.categoria).filter(Boolean);
  return Array.from(new Set(lista));
}, [hechos]);
  
  // Aún puedes usar searchParams si tienes OTROS filtros, 
  // pero ya no lo necesitamos para 'modoNavegacion'  
  // 1. IMPORTAMOS EL MODO DESDE EL CONTEXTO GLOBAL
  const { modoNavegacion } = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        //const coleccionData = await collectionsService.getCollectionById(id);
        //setColeccion(coleccionData);
        //console.log(coleccionData)
        const filtrosActuales = {
            ...Object.fromEntries([...searchParams]), 
            modoNavegacion: modoNavegacion 
        };
        const coleCompleta = await collectionsService.getHechosDeColeccion(id, filtrosActuales);
        setColeccion(coleCompleta.data)
        setHechos(coleCompleta.data.hechos);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setHechos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 3. CLAVE: AGREGAR 'modoNavegacion' A LAS DEPENDENCIAS
    // Esto hace que al tocar el switch del Header, se dispare fetchData de nuevo.
  }, [id, searchParams, modoNavegacion]); 

  // La dependencia es searchParams: cada vez que cambies la URL, se ejecuta esto.

  const handleHechoClick = (hechoId) => {
    navigate(`/hechos/${hechoId}`);
  };

  const handleMapMarkerClick = (hecho) => {
    setSelectedHecho(hecho);
  };

  if (loading) {
    return (
      <div className="coleccion-detalle coleccion-detalle--loading">
        <p>Cargando colección...</p>
      </div>
    );
  }

  if (!coleccion) {
    return (
      <div className="coleccion-detalle coleccion-detalle--error">
        <p>No se encontró la colección</p>
        <button onClick={() => navigate('/colecciones')}>Volver a colecciones</button>
      </div>
    );
  }

  const center = hechos.length > 0 && hechos[0].ubicacion
    ? [hechos[0].ubicacion.latitud, hechos[0].ubicacion.longitud]
    : [-38.4161, -63.6167];

  return (
    <div className="coleccion-detalle">
      <header className="coleccion-detalle__header">
        <button className="coleccion-detalle__back" onClick={() => navigate('/colecciones')}>
          ← Volver a colecciones
        </button>
        <h1 className='coleccion-titulo'>{coleccion.titulo}</h1>
        <p className="coleccion-detalle__descripcion">{coleccion.descripcion}</p>
        <div className="coleccion-detalle__meta">
          <span>{hechos.length} hechos</span>
        </div>
      </header>
      
      
        <button
          className="btn-filtros"
          onClick={() => {
            const paramsActuales = Object.fromEntries([...searchParams]);
            setFiltrosTemp(paramsActuales);
            setMostrarFiltros(true);
          }}
        >
          🔍 Filtros
        </button>

    

      <div className="coleccion-detalle__content">
        <aside className="coleccion-detalle__hechos-list">
         {/* ... (El resto de tu renderizado sigue igual) ... */}
          <h2>Hechos en esta colección</h2>
          {hechos.length === 0 ? (
            <p className="coleccion-detalle__empty">No hay hechos en esta colección</p>
          ) : (
            <div className="hechos-list">
              {hechos.map((hecho) => (
                <article
                  key={hecho.id_hecho}
                  className={`hecho-card ${selectedHecho?.id_hecho === hecho.id_hecho ? 'hecho-card--selected' : ''}`}
                  onClick={() => handleHechoClick(hecho.id_hecho)}
                  onMouseEnter={() => setSelectedHecho(hecho)}
                  onMouseLeave={() => setSelectedHecho(null)}
                >
                  <div className="hecho-card__header">
                    <span className="hecho-card__categoria">{hecho.categoria}</span>
                    <span className="hecho-card__fecha">{hecho.fecha}</span>
                  </div>
                  <h3 className="hecho-card__titulo">{hecho.titulo}</h3>
                  <p className="hecho-card__descripcion">{hecho.descripcion}</p>
                  <div className="hecho-card__footer">
                    <span className="hecho-card__provincia">{hecho.ubicacion.provincia}</span>
                    <span className="hecho-card__fuente">Fuente: {hecho.fuente}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>

        <div className="coleccion-detalle__map">
          <MapContainer
            center={center}
            zoom={5}
            scrollWheelZoom
            className="coleccion-detalle__map-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hechos
              .filter((h) => h.ubicacion)
              .map((hecho) => (
                <Marker
                  key={hecho.id_hecho}
                  position={[hecho.ubicacion.latitud, hecho.ubicacion.longitud]}
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => handleMapMarkerClick(hecho),
                  }}
                >
                  <Popup>
                    <div className="marker-popup">
                      <h4>{hecho.titulo}</h4>
                      <p>{hecho.descripcion}</p>
                      <button
                        className="marker-popup__btn"
                        onClick={() => handleHechoClick(hecho.id_hecho)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
      
      {mostrarFiltros && (
  <div className="filtros-overlay">
    <div className="filtros-panel">

      <header className="filtros-panel__header">
        <h2>Filtros</h2>
        <button
          className="filtros-panel__close"
          onClick={() => setMostrarFiltros(false)}
        >
          
        </button>
      </header>

      <div className="filtros-panel__content">

        <div className="filtro-field">
          <label>Título</label>
          <input
            type="text"
            placeholder="Buscar por título"
            value={filtrosTemp.q}
            onChange={(e) =>
              setFiltrosTemp({ ...filtrosTemp, q: e.target.value })
            }
          />
        </div>

        <div className="filtro-field">
          <label>Categoría</label>
          <select
            value={filtrosTemp.categoria}
            onChange={(e) =>
              setFiltrosTemp({ ...filtrosTemp, categoria: e.target.value })
            }
          >
            <option value="">Todas las categoria </option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
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
                  <option value="">Todas las provincias</option>
                  {provinciasUnicas.map((ub) => (
                    <option key={ub.provincia} value={ub.provincia}>{ub.provincia}</option>
                  ))}
                </select>
              </div>


        <div className="filtro-field">
          <label>Tipo de fuente</label>
          <select
            value={filtrosTemp.tipoFuente}
            onChange={(e) =>
              setFiltrosTemp({ ...filtrosTemp, fuenteTipo: e.target.value })
            }
          >
            <option value="">Todas las fuentes</option>
            {opcionesFuente.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
          </select>
        </div>

        <div className="filtro-field">
          <label>Fecha desde</label>
          <input
            type="date"
            value={filtrosTemp.fechaDesde}
            onChange={(e) =>
              setFiltrosTemp({ ...filtrosTemp, fechaDesde: e.target.value })
            }
          />
        </div>

        <div className="filtro-field">
          <label>Fecha hasta</label>
          <input
            type="date"
            value={filtrosTemp.fechaHasta}
            onChange={(e) =>
              setFiltrosTemp({ ...filtrosTemp, fechaHasta: e.target.value })
            }
          />
        </div>

      </div>

      <footer className="filtros-panel__actions">
        <button onClick={() => resetFiltros()}>
          Limpiar
        </button>

        <button
          className="btn-primary"
          onClick={() => {
            // 1. Convertimos el estado a una lista de entradas [llave, valor]
            // 2. Filtramos para quitar valores vacíos, null o undefined
            // 3. Lo convertimos de nuevo a un objeto limpio
            const filtrosLimpios = Object.fromEntries(
              Object.entries(filtrosTemp).filter(([_, value]) => 
                value !== "" && value !== null && value !== undefined
              )
            );

            setSearchParams(filtrosLimpios); // Reemplaza todo lo anterior por lo nuevo y limpio
            setMostrarFiltros(false);
          }}
          >
            Filtrar
        </button>
      </footer>

    </div>
  </div>
)}


    </div>
  );
}