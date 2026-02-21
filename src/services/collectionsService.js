import { mockCollections } from "../constants/mockCollections";
import axios from "axios";
const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const API_PUBLICA_URL = process.env.REACT_APP_API_PUBLICA_URL;

export const normalizador= (filtros) => {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.fechaDesde) params.append('fecha_acontecimiento_desde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fecha_acontecimiento_hasta', filtros.fechaHasta);
    if (filtros.provincia) params.append('provincia', filtros.provincia)
    if (filtros.fuenteTipo) params.append('fuenteTipo', filtros.fuenteTipo)
    // Aquí mapeamos la 'q' del frontend
    if (filtros.q) params.append('q', filtros.q);

    if (filtros.modoNavegacion) params.append('modoNavegacion', filtros.modoNavegacion);
    return params.toString();
}

export const collectionsService = {

  async getCollections() {
    console.log('[Colecciones] 📚 Obteniendo todas las colecciones...');
    try {
      let url = `${API_PUBLICA_URL}/colecciones`;
      const response = await axios.get(url, {
        headers: { "Cache-Control": "no-cache" },
      });
      console.log('[Colecciones] ✅ Colecciones obtenidas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('[Colecciones] ❌ Error obteniendo las colecciones:', error);
      throw error;
    }
  },

  async getCollectionById(coleccionID) {
  // Solo permitimos ID numérico
  if (!coleccionID) {
    throw new Error(`ID inválido: ${coleccionID}`);
  }

  const url = `${API_PUBLICA_URL}/colecciones/${coleccionID}`;
  console.log(`[Colecciones] 📖 Obteniendo colección ID: ${coleccionID}`);
  console.log(`[Colecciones] 📡 URL: ${url}`);

  try {
    const response = await axios.get(url);
    console.log('[Colecciones] ✅ Colección obtenida:', response.data.titulo);
    return response.data;
  } catch (error) {
    console.error('[Colecciones] ❌ Error obteniendo colección:', error);
    throw error;
  }
  },
  async getHechosDeColeccion(coleccionID, filtros) {
    try {
      const filtrosAcoplados =normalizador(filtros);
      var url = `${API_PUBLICA_URL}/colecciones/${coleccionID}/hechos`;
      url += `${filtrosAcoplados ? '?' + filtrosAcoplados : ''}`
      console.log(`[Colecciones] 🔍 Buscando hechos para colección ID: ${coleccionID}`);
      console.log(`[Colecciones] 📡 URL: ${url}`);
      
      const response = await axios.get(url);
      console.log('[Colecciones] ✅ Hechos obtenidos:', response.data ? response.data.length : 0);
      return response;
    } catch (error) {
      console.error('[Colecciones] ❌ Error obteniendo hechos de la colección:', error);
      throw error;
    }
  },
};
