// services/coleccionesAdminService.js
import axios from "axios";

const API_ADMINISTRATIVA_URL = process.env.REACT_APP_API_ADMINISTRATIVA_URL;

// 1. Obtener Fuentes (Movido aquí para que sea exclusivo de Admin)
export const obtenerFuentes = async () => {
  const response = await axios.get(`${API_ADMINISTRATIVA_URL}/fuentes`);
  return response.data;
};

// 2. Obtener Colecciones Admin
export const obtenerColeccionesAdmin = async () => {
  const response = await axios.get(`${API_ADMINISTRATIVA_URL}/colecciones`);
  return response.data;
};

// 3. Crear
export const crearColeccion = async (payload) => {
  const response = await axios.post(`${API_ADMINISTRATIVA_URL}/colecciones`, payload);
  return response.data;
};

// 4. Actualizar
export const actualizarColeccion = async (id, payload) => {
  const response = await axios.put(`${API_ADMINISTRATIVA_URL}/colecciones/${id}`, payload);
  return response.data;
};

// 5. Eliminar
export const eliminarColeccion = async (id) => {
  return await axios.delete(`${API_ADMINISTRATIVA_URL}/colecciones/${id}`);
};