import { mockHechos } from '../constants/mockHechos';

const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

export const hechosService = {
  async listarHechos(filtros = {}) {
    const data = deepClone(mockHechos);

    const normalizados = data.filter((hecho) => {
      if (filtros.categoria && hecho.categoria !== filtros.categoria) return false;
      if (filtros.provincia && hecho.provincia !== filtros.provincia) return false;
      if (filtros.fuenteTipo && hecho.fuenteTipo !== filtros.fuenteTipo) return false;
      if (filtros.modo && hecho.modo !== filtros.modo) return false;
      if (filtros.fechaDesde && new Date(hecho.fecha) < new Date(filtros.fechaDesde)) return false;
      if (filtros.fechaHasta && new Date(hecho.fecha) > new Date(filtros.fechaHasta)) return false;
      return true;
    });

    return new Promise((resolve) => setTimeout(() => resolve(normalizados), 450));
  },
};
