import { useMemo, useState, useEffect } from 'react';
import './TableroHechos.css';
import { FiltrosHechos } from '../FiltrosHechos/FiltrosHechos';
import { MapaHechos } from '../MapaHechos/MapaHechos';
import { useHechos } from '../../hooks/useHechos';
import { hechosService } from '../../services/hechosService'; 

export const TableroHechos = () => {
  const [filtros, setFiltros] = useState({ modo: 'curado' });
  
  // Renombramos 'hechos' a 'data' porque puede venir el objeto paginado o null
  const { hechos: data, cargando } = useHechos(filtros);

  // --- CORRECCIÓN AQUÍ ---
  // Extraemos el array real. 
  // 1. Si data existe y tiene propiedad .content, usamos data.content (Formato nuevo)
  // 2. Si data es un array, lo usamos directo (Formato viejo o fallback)
  // 3. Si es null/undefined, usamos array vacío [] para que no rompa el .map
  const listaHechos = useMemo(() => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.content) return data.content;
      return [];
  }, [data]);

  const [todasLasCategorias, setTodasLasCategorias] = useState([]);
  const [todasLasProvincias, setTodasLasProvincias] = useState([]);

  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        const cats = await hechosService.obtenerCategorias();
        if (Array.isArray(cats)) {
          setTodasLasCategorias(cats.map(c => c.nombre || c));
        } else {
          console.warn('obtenerCategorias no devolvió un array:', cats);
          setTodasLasCategorias([]);
        }
      
        const provs = await hechosService.obtenerProvincias();
        if (Array.isArray(provs)) {
          setTodasLasProvincias(provs.map(p => p.nombre || p));
        } else {
          console.warn('obtenerProvincias no devolvió un array:', provs);
          setTodasLasProvincias([]);
        }
      } catch (error) {
        console.error("Error cargando maestros:", error);
      }
    };
    cargarMaestros();
  }, []);

  const resumen = useMemo(
    () => ({
      // Usamos 'listaHechos' que garantizamos que es un Array
      total: listaHechos.length,
      categorias: todasLasCategorias.length,
      provincias: todasLasProvincias.length,
    }),
    [listaHechos] // Dependencia actualizada
  );

  return (
    <section className="tablero-hechos" id="mapa-hechos">
      <header className="tablero-hechos__encabezado">
        <p className="section-eyebrow">Explorar hechos</p>
        <h2>Visualización georreferenciada en tiempo real</h2>
        <p>
          Filtrá por categoría, provincia, tipo de fuente y modo de navegación...
        </p>
      </header>

      <div className="tablero-hechos__contenido">
        <div className="tablero-hechos__panel">
          
          <FiltrosHechos 
            categorias={todasLasCategorias} 
            provincias={todasLasProvincias} 
            filtros={filtros} 
            onChange={setFiltros} 
          />

          <div className="tablero-hechos__resumen">
            <div>
              <span>{resumen.total}</span>
              <p>hechos en vista</p>
            </div>
            <div>
              <span>{resumen.categorias}</span>
              <p>categorías visibles</p>
            </div>
            <div>
              <span>{resumen.provincias}</span>
              <p>provincias visibles</p>
            </div>
          </div>
        </div>

        <div className="tablero-hechos__mapa">
          {cargando ? (
            <div className="tablero-hechos__loader">Cargando hechos...</div>
          ) : (
            // Pasamos la lista limpia
            <MapaHechos hechos={listaHechos} />
          )}
        </div>
      </div>
    </section>
  );
};