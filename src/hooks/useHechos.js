import { useEffect, useState } from 'react';
import { hechosService } from '../services/hechosService';

export const useHechos = (filtros) => {
  const [hechos, setHechos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let montado = true;
    setCargando(true);

    hechosService
      .listarHechos(filtros)
      .then((data) => {
        if (montado) {
          setHechos(data);
          setError(null);
        }
      })
      .catch((err) => montado && setError(err))
      .finally(() => montado && setCargando(false));

    return () => {
      montado = false;
    };
  }, [filtros]);

  return { hechos, cargando, error };
};
