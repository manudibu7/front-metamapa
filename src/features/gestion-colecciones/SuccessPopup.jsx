import React from 'react';

export const SuccessPopup = ({ open, summaryData, onClose }) => {
  if (!open || !summaryData) return null;

  const { type, newData, oldData } = summaryData;
  const isUpdate = type === 'UPDATE';
  const hasChanged = (field) => isUpdate && oldData && newData[field] !== oldData[field];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-success-icon">✓</div>
        
        <h3>
          {type === 'CREATE' ? '¡Colección Creada!' : 
           type === 'UPDATE' ? '¡Colección Actualizada!' : 
           '¡Colección Eliminada!'}
        </h3>
        <p style={{ color: '#666' }}>La operación se realizó con éxito.</p>

        {/* Resumen Interno */}
        <div className="modal-summary">
          <p className="summary-row">
            <strong>Título:</strong>{' '}
            <span className={hasChanged('titulo') ? 'value-modified' : ''}>
              {newData.titulo}
            </span>
            {hasChanged('titulo') && <span className="old-value-badge"> (Antes: {oldData.titulo})</span>}
          </p>
          
          <p className="summary-row">
            <strong>Descripción:</strong>{' '}
            <span className={hasChanged('descripcion') ? 'value-modified' : ''}>
              {newData.descripcion || <em>Sin descripción</em>}
            </span>
          </p>

          <p className="summary-row">
            <strong>Algoritmo:</strong>{' '}
            <span className={hasChanged('algoritmoConcenso') ? 'value-modified' : ''}>
              {newData.algoritmoConcenso || <em>No seleccionado</em>}
            </span>
          </p>

          <div className="summary-block">
            <strong>Fuentes ({newData.fuentes.length}):</strong>
            <div className="tags-container">
              {newData.fuentes.map(f => <span key={f} className="tag">{f}</span>)}
            </div>
          </div>

          <div className="summary-block">
            <strong>Criterios ({newData.criterios.length}):</strong>
            <ul className="criteria-list">
              {newData.criterios.map((c, i) => (
                <li key={i}>{c.tipo}: <b>{c.valor}</b></li>
              ))}
            </ul>
          </div>
          
          {isUpdate && (<p className="summary-footer-note"><i>* Los valores resaltados indican cambios recientes.</i></p>)}
          {type === 'DELETE' && (
            <p className="summary-footer-note" style={{color: 'var(--color-danger)'}}>
              <i>* Esta colección ha sido eliminada permanentemente.</i>
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn--primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};