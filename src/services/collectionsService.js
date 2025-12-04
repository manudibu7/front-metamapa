import { mockCollections } from "../constants/mockCollections";
import axios from "axios";
const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const simulateLatency = (payload) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(payload)), 550);
  });
//API ADMINISTRATIVA
const API_ADMINISTRATIVA_URL = "http://localhost:8084";

export const obtenerFuentes = async () => {
  try {
    let url = `${API_ADMINISTRATIVA_URL}/fuentes`;
    const response = await axios.get(url, {
      headers: { "Cache-Control": "no-cache" },
    });
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

      return response;
    } catch (error) {
      console.error("Error obteniendo los productos", error);
      throw error;
    }
  },

  async getCollectionById(idOrHandle) {
    //SOLO CONSIDERO PARA ID
    if (idOrHandle.isNumber()) {
      let url = `${API_ADMINISTRATIVA_URL}/coleccion/${idOrHandle}`;

      const response = await axios.get(url, {
        headers: { "Cache-Control": "no-cache" },
      });
      return response;
    }
    /* const found = mockCollections.find(
      (collection) => collection.id === idOrHandle || collection.handle === idOrHandle
    );
    return simulateLatency(found ?? null);*/
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
      return response;
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
      return response;
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
      return response;
    } catch (error) {
      console.error("Error borrando la colleccion", error);
      throw error;
    }
  }
};
