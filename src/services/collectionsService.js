import { mockCollections } from '../constants/mockCollections';

const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const simulateLatency = (payload) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(payload)), 550);
  });
//API ADMINISTRATIVA
const API_ADMINISTRATIVA_URL = 'http://localhost:8081/colecciones';

export const collectionsService = {
  async getCollections() {
    try{
       let url = `${API_ADMINISTRATIVA_URL}/colecciones`
       const response = await axios.get(url, {
      headers: { "Cache-Control": "no-cache" }, });
       
      return response;
     } catch (error) {
    console.error("Error obteniendo los productos", error);
    throw error;
  }

  },


  async getCollectionById(idOrHandle) {
    //SOLO CONSIDERO PARA ID
    if(idOrHandle.isNumber()){
      let url =`${API_BASE_URL}/coleccion/${idOrHandle}`

      const response = await axios.get(url, {
      headers: { "Cache-Control": "no-cache" }, });
       return response;
    }
   /* const found = mockCollections.find(
      (collection) => collection.id === idOrHandle || collection.handle === idOrHandle
    );
    return simulateLatency(found ?? null);*/
  },

  async createCollection(collectionInput){
    
  }
};
