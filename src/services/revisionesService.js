import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_DINAMICA_URL;

export const listarPendientes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/revisiones/pendientes`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo pendientes:', error);
    throw new Error('Error obteniendo pendientes');
  }
};

export const getDetalleRevision = async (idContribucion) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/revisiones/${idContribucion}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo detalle de la revisión:', error);
    throw new Error('Error obteniendo detalle de la revisión');
  }
};

export const aceptarRevision = async (idContribucion, comentarios,contribuyenteId) => {
  try {
    await axios.post(`${API_BASE_URL}/revisiones/${idContribucion}/aceptar`, { comentarios,contribuyenteId});
  } catch (error) {
    console.error('Error aceptando contribución:', error);
    throw new Error('Error aceptando contribución');
  }
};

export const aceptarConCambios = async (idContribucion, comentarios,contribuyenteId) => {
  try {
    await axios.post(`${API_BASE_URL}/revisiones/${idContribucion}/aceptar-con-cambios`, { comentarios,contribuyenteId});
  } catch (error) {
    console.error('Error aceptando con cambios:', error);
    throw new Error('Error aceptando con cambios');
  }
};

export const rechazarRevision = async (idContribucion, comentarios,contribuyenteId) => {
  try {
    await axios.post(`${API_BASE_URL}/revisiones/${idContribucion}/rechazar`, { comentarios,contribuyenteId});
  } catch (error) {
    console.error('Error rechazando contribución:', error);
    throw new Error('Error rechazando contribución');
  }
};
