import { mockCollections } from "../constants/mockCollections";
import axios from "axios";
const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const simulateLatency = (payload) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(payload)), 550);
  });
//API ADMINISTRATIVA
const API_ADMINISTRATIVA_URL = "http://localhost:8084";
const API_PUBLICA_URL = "http://localhost:8100";

export const obtenerFuentes = async () => {
  try {
    let url = `${API_ADMINISTRATIVA_URL}/fuentes`;
    const response = await axios.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo los productos", error);
    throw error;
  }
};

export const collectionsService = {
  async getCollections() {
    try {
      let url = `${API_ADMINISTRATIVA_URL}/colecciones`;
      const response = await axios.get(url, {
        headers: { "Cache-Control": "no-cache" },
      });

      return response.data;
    } catch (error) {
      console.error("Error obteniendo los productos", error);
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
  async getCollectionByIdADMIN(idOrHandle) {
    //SOLO CONSIDERO PARA ID
    if (idOrHandle) {
      let url = `${API_ADMINISTRATIVA_URL}/colecciones/${idOrHandle}`;

      const response = await axios.get(url, {
        headers: { "Cache-Control": "no-cache" },
      });
      return response.data;
    }
  },
  async createCollection(collectionInput) {
    try {
      const response = await axios.post(
        `${API_ADMINISTRATIVA_URL}/colecciones`,
        collectionInput,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creando el Coleccion", error);
      throw error;
    }
  },
    async updateCollection(id ,collection) {
    try {
      const response = await axios.put(
        `${API_ADMINISTRATIVA_URL}/colecciones/${id}`,
        collection,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error actualizando el Coleccion", error);
      throw error;
    }


  },

  async deleteById(id) {
    try {
      const response = await axios.delete(
        `${API_ADMINISTRATIVA_URL}/colecciones/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error borrando la colleccion", error);
      throw error;
    }
  },
  async getHechosDeColeccion(coleccionID) {
    try {
      const url = `${API_PUBLICA_URL}/colecciones/${coleccionID}/hechos`;

      const response = await axios.get(url, {
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
