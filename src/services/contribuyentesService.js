import axios from 'axios';

const API_BASE_URL = 'http://localhost:8090';

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
