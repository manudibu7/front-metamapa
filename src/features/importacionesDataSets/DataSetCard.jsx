export const DataSetCard = ({ ds }) => {
    const esProcesado = ds.estadoProcesado === 'PROCESADO';

    return (
        <article className="dataset-card">
            <div className="dataset-card__content">
                <div className="dataset-card__icon">
                    📂
                </div>
                <div className="dataset-card__info">
                    <h2 className="dataset-card__title">{ds.nombre}</h2>
                    <span className="dataset-card__subtext">ruta: {ds.ruta || 'N/A'}</span>
                </div>
            </div>
            
            <div className={`status-badge ${esProcesado ? 'status-success' : 'status-pending'}`}>
                <span className="status-dot"></span>
                {ds.estadoProcesado.replace('_', ' ')}
            </div>
        </article>
    )
}