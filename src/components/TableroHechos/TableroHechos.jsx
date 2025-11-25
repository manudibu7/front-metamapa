import { useMemo, useState } from 'react';
import './TableroHechos.css';
import { FiltrosHechos } from '../FiltrosHechos/FiltrosHechos';
import { MapaHechos } from '../MapaHechos/MapaHechos';
import { useHechos } from '../../hooks/useHechos';

export const TableroHechos = () => {
  const [filtros, setFiltros] = useState({ modo: 'curado' });
  const { hechos, cargando } = useHechos(filtros);

  const categorias = useMemo(() => Array.from(new Set(hechos.map((hecho) => hecho.categoria))), [hechos]);
  const provincias = useMemo(() => Array.from(new Set(hechos.map((hecho) => hecho.provincia))), [hechos]);

  const resumen = useMemo(
    () => ({
      total: hechos.length,
      categorias: categorias.length,
      provincias: provincias.length,
    }),
    [hechos, categorias, provincias]
  );

  return (
    <section className="tablero-hechos" id="mapa-hechos">
      <header className="tablero-hechos__encabezado">
        <p className="section-eyebrow">Explorar hechos</p>
        <h2>Visualización georreferenciada en tiempo real</h2>
        <p>
          Filtrá por categoría, provincia, tipo de fuente y modo de navegación para obtener trazabilidad inmediata
          sobre lo que reportan los loaders conectados.
        </p>
      </header>

      <div className="tablero-hechos__contenido">
        <div className="tablero-hechos__panel">
          <FiltrosHechos categorias={categorias} provincias={provincias} filtros={filtros} onChange={setFiltros} />

          <div className="tablero-hechos__resumen">
            <div>
              <span>{resumen.total}</span>
              <p>hechos coincidentes</p>
            </div>
            <div>
              <span>{resumen.categorias}</span>
              <p>categorías activas</p>
            </div>
            <div>
              <span>{resumen.provincias}</span>
              <p>provincias con alertas</p>
            </div>
          </div>
        </div>

        <div className="tablero-hechos__mapa">
          {cargando ? <div className="tablero-hechos__loader">Cargando hechos...</div> : <MapaHechos hechos={hechos} />}
        </div>
      </div>
    </section>
  );
};
