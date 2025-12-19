import { mockCollections } from "../constants/mockCollections";
import axios from "axios";
const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const API_PUBLICA_URL = "http://localhost:8100";

export const normalizador= (filtros) => {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.fechaDesde) params.append('fecha_acontecimiento_desde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fecha_acontecimiento_hasta', filtros.fechaHasta);
    
    // Aquí mapeamos la 'q' del frontend
    if (filtros.q) params.append('q', filtros.q);

    if (filtros.modoNavegacion) params.append('modoNavegacion', filtros.modoNavegacion);
    return params;
}

export const collectionsService = {

  async getCollections() {
    try {
      let url = `${API_PUBLICA_URL}/colecciones`;
      const response = await axios.get(url, {
        headers: { "Cache-Control": "no-cache" },
      });

      return response.data;
    } catch (error) {
      console.error("Error obteniendo las colecciones", error);
      throw error;
    }
  },

  async getCollectionById(coleccionID) {
  // Solo permitimos ID numérico
  if (!coleccionID) {
    throw new Error(`ID inválido: ${coleccionID}`);
  }

  const url = `${API_PUBLICA_URL}/colecciones/${coleccionID}`;

  try {
    const response = await axios.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo la colección", error);
    throw error;
  }
},
  async getHechosDeColeccion(coleccionID, filtros) {
    try {
      const filtrosAcoplados =normalizador(filtros);
      var url = `${API_PUBLICA_URL}/colecciones/${coleccionID}/hechos`;
      console.log(url)
      const response = await axios.get(url, {
        params: filtrosAcoplados,
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error obteniendo hechos de la colección", error);
      throw error;
    }
  },
};
