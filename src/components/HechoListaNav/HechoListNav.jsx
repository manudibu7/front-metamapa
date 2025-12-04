import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
// Asegúrate de que la ruta al archivo sea la correcta
import { hechosService } from '../../services/hechosService'; 
import './HechoListNav.css' 

export const HechosListNav = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [hechos, setHechos] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const query = searchParams.get('q');

                const filtros = { q: query || '' };

                const data = await hechosService.listarHechos(filtros);

                setHechos(data);

            } catch (err) {
                console.error(err);
                setError("Ocurrió un error al cargar los hechos.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [searchParams]); 

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {hechos && hechos.length > 0 ? (
                hechos.map(h => (
                    <li key={h.id}>
                              <button
                                type="button"
                                className={`hecho-card ${h.id_hecho ? 'is-active' : ''}`}
                                onClick={() => navigate(`/hechos/${h.id_hecho}`)}
                              >
                                <header>
                                  <p className="hecho-card__category">{h.categoria}</p>
                                  <span>{new Date(h.fecha).toLocaleDateString()}</span>
                                </header>
                                <h4>{h.titulo}</h4>
                                <p className="hecho-card__description">{h.descripcion}</p>
                              </button>
                    </li>
                ))
            ) : (
                <p className="hecho-list__empty">No hay hechos disponibles para esta colección.</p>
            )}
        </div>
    );
};