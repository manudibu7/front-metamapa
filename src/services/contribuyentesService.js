import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_DINAMICA_URL;

export const syncKeycloakUser = async (keycloakId, nombre, apellido) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/contribuyentes/sync-keycloak`, {
      keycloakId,
      nombre,
      apellido,
    });
    return response.data;
  } catch (error) {
    console.error('Error sincronizando usuario con el backend', error);
    throw new Error('Error sincronizando usuario con el backend');
  }
  
};
export const obtenerMiPerfil = async (keycloakId) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/contribuyentes/me/${keycloakId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error obteniendo mi perfil", error);
    throw error;
  }
};

export const actualizarMiPerfil = async (keycloakId, data) => {
  try {
    const res = await axios.put(
      `${API_BASE_URL}/contribuyentes/me/${keycloakId}`,
      data
    );
    return res.data;
  } catch (error) {
    console.error("Error actualizando mi perfil", error);
    throw error;
  }
};
/**
 
export const obtenerMiPerfil = async (id) => {
  const response = await axios.get(
    `${API_BASE_URL}/contribuyentes/me/${id}`
  );
  return response.data;
};

export const actualizarMiPerfil = async (id, data) => {
  const response = await axios.put(
    `${API_BASE_URL}/contribuyentes/me/${id}`,
    data
  );
  return response.data;
};
*/