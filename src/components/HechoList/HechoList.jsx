import './HechoList.css';
import { formatFuente, formatProvincia } from '../../helpers/collections';

export const HechoList = ({ hechos = [], selectedId, onSelect }) => {
  if (!hechos.length) {
    return <p className="hecho-list__empty">No hay hechos disponibles para esta colección.</p>;
  }

  return (
    <ul className="hecho-list">
      {hechos.map((hecho) => (
        <li key={hecho.id}>
          <button
            type="button"
            className={`hecho-card ${selectedId === hecho.id ? 'is-active' : ''}`}
            onClick={() => onSelect?.(hecho.id)}
          >
            <header>
              <p className="hecho-card__category">{hecho.categoria}</p>
              <span>{new Date(hecho.fecha).toLocaleDateString()}</span>
            </header>
            <h4>{hecho.titulo}</h4>
            <p className="hecho-card__description">{hecho.descripcion}</p>
            <footer>
              <span>{formatProvincia(hecho.provincia)}</span>
              <span>{formatFuente(hecho)}</span>
            </footer>
          </button>
        </li>
      ))}
    </ul>
  );
};
