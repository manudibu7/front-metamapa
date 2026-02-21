import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_DINAMICA_URL;

export const listarPendientes = async () => {
  console.log('[Revisiones] 📋 Obteniendo revisiones pendientes...');
  try {
    const response = await axios.get(`${API_BASE_URL}/revisiones/pendientes`);
    console.log('[Revisiones] ✅ Pendientes obtenidas:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('[Revisiones] ❌ Error obteniendo pendientes:', error);
    throw new Error('Error obteniendo pendientes');
  }
};

export const getDetalleRevision = async (idContribucion) => {
  console.log(`[Revisiones] 🔍 Obteniendo detalle de revisión para Contribución ID: ${idContribucion}`);
  try {
    const response = await axios.get(`${API_BASE_URL}/revisiones/${idContribucion}`);
    console.log('[Revisiones] ✅ Detalle obtenido');
    return response.data;
  } catch (error) {
    console.error('[Revisiones] ❌ Error obteniendo detalle de la revisión:', error);
    throw new Error('Error obteniendo detalle de la revisión');
  }
};

export const aceptarRevision = async (idContribucion, comentarios, contribuyenteId) => {
  console.log(`[Revisiones] ✅ Aceptando revisión ID: ${idContribucion}`);
  try {
    await axios.post(`${API_BASE_URL}/revisiones/${idContribucion}/aceptar`, { comentarios, contribuyenteId });
    console.log('[Revisiones] 🎉 Revisión aceptada con éxito');
  } catch (error) {
    console.error('[Revisiones] ❌ Error aceptando contribución:', error);
    throw new Error('Error aceptando contribución');
  }
};

export const aceptarConCambios = async (idContribucion, comentarios, contribuyenteId) => {
  console.log(`[Revisiones] ⚠️ Aceptando con cambios revisión ID: ${idContribucion}`);
  try {
    await axios.post(`${API_BASE_URL}/revisiones/${idContribucion}/aceptar-con-cambios`, { comentarios, contribuyenteId });
    console.log('[Revisiones] ✅ Revisión aceptada con cambios');
  } catch (error) {
    console.error('[Revisiones] ❌ Error aceptando con cambios:', error);
    throw new Error('Error aceptando con cambios');
  }
};

export const rechazarRevision = async (idContribucion, comentarios, contribuyenteId) => {
  console.log(`[Revisiones] ⛔ Rechazando revisión ID: ${idContribucion}`);
  try {
    await axios.post(`${API_BASE_URL}/revisiones/${idContribucion}/rechazar`, { comentarios, contribuyenteId });
    console.log('[Revisiones] ✅ Revisión rechazada');
  } catch (error) {
    console.error('[Revisiones] ❌ Error rechazando contribución:', error);
    throw new Error('Error rechazando contribución');
  }
};
