import { mockCollections } from "../constants/mockCollections";
import axios from "axios";
const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const simulateLatency = (payload) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(payload)), 550);
  });
const API_PUBLICA_URL = "http://localhost:8100";

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

  const url = `${API_PUBLICA_URL}/colecciones/${coleccionID}/hechos`;

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
  async getHechosDeColeccion(coleccionID, filtros= {}) {
    try {
      var url = `${API_PUBLICA_URL}/colecciones/${coleccionID}/hechos`;
      console.log(url)
      const response = await axios.get(url, {
        params: filtros,
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
