import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getContribucionesByContribuyente } from '../../services/contribucionesService';
import './MisContribuciones.css';

export const MisContribuciones = () => {
  const { contribuyenteId, token, isAuthenticated } = useAuth();
  const [contribuciones, setContribuciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !contribuyenteId) {
      setLoading(false);
      return;
    }

    const fetchContribuciones = async () => {
      try {
        const data = await getContribucionesByContribuyente(contribuyenteId, token);
        setContribuciones(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar tus contribuciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchContribuciones();
  }, [isAuthenticated, contribuyenteId, token]);

  if (!isAuthenticated) {
    return <div className="mis-contribuciones__msg">Debes iniciar sesión para ver tus contribuciones.</div>;
  }

  if (loading) {
    return <div className="mis-contribuciones__loading">Cargando...</div>;
  }

  if (error) {
    return <div className="mis-contribuciones__error">{error}</div>;
  }

  return (
    <div className="mis-contribuciones">
      <h2>Mis Contribuciones</h2>
      {contribuciones.length === 0 ? (
        <p>No has realizado ninguna contribución aún.</p>
      ) : (
        <div className="mis-contribuciones__list">
          {contribuciones.map((c) => (
            <div key={c.idContribucion} className="contribucion-card">
              <div className="contribucion-card__header">
                <h3>{c.hecho.titulo}</h3>
                <span className="contribucion-card__date">{c.hecho.fecha}</span>
              </div>
              <p className="contribucion-card__desc">{c.hecho.descripcion}</p>
              <div className="contribucion-card__meta">
                <span className="badge">{c.hecho.categoria}</span>
                <span className="badge">{c.hecho.tipoDeHecho}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
