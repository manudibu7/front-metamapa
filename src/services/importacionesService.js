import axios from "axios";

const LOADER_ESTATICA_URL = process.env.REACT_APP_ESTATICA_URL;

export const importacionesService = async (payload) => {
  const response = await axios.post(`${LOADER_ESTATICA_URL}/subirDataSet`, payload);
  return response.data;
}

export const obtenerDataSetsAdmin = async() => {
    const response = await axios.get(`${LOADER_ESTATICA_URL}/fuentes`);
    return response.data;
}