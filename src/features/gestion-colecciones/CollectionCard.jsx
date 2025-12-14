import React from 'react';

export const CollectionCard = ({ 
  col, 
  onEdit, 
  confirmDeleteId, 
  setConfirmDeleteId, 
  onDelete, 
  loadingDelete 
}) => {
    const listaCriterios = col.criterios || [];
  return (
    <article className="gestion-colecciones__card">
      <div className="gestion-colecciones__card-info">
        <h2>{col.titulo}</h2>
        <p>{col.descripcion}</p>
        <h4 className='gestion-colecciones-titulo-condiciones'>Condiciones: </h4>
        {listaCriterios.length === 0 ? (
          <p>• Ninguna</p>
        ) : (
          <ul className="gestion-colecciones__condiciones">
            {col.criterios.map((cond) => (
              <li key={cond.id}>{cond.tipo} = {cond.valor}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="gestion-colecciones__card-actions">
        <button type="button" className="btn btn--ghost" onClick={() => onEdit(col)}>
          Editar
        </button>
        {confirmDeleteId === col.id_coleccion ? (
          <>
            <button 
              type="button" 
              className="btn btn--danger" 
              onClick={() => onDelete(col.id_coleccion)}
            >
              {loadingDelete ? "Eliminando..." : "¿Confirmar?"}
            </button>
            <button 
              type="button" 
              className="btn btn--ghost" 
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button 
            type="button" 
            className="btn btn--danger-outline" 
            onClick={() => setConfirmDeleteId(col.id_coleccion)}
          >
            Eliminar
          </button>
        )}
      </div>
    </article>
  );
};