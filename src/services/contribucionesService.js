import axios from 'axios';

const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));
const API_BASE_URL = 'http://localhost:8090';
const API_ADMINISTRATIVA_URL = 'http://localhost:8084';

const sanitizeHecho = (hecho) => {
  if (!hecho) throw new Error('El hecho es obligatorio');
  if (!hecho.titulo?.trim()) throw new Error('El título del hecho es obligatorio');
  if (!hecho.descripcion?.trim()) throw new Error('La descripción del hecho es obligatoria');
  if (!hecho.categoria) throw new Error('Seleccioná una categoría');
  if (!hecho.fecha) throw new Error('La fecha del hecho es obligatoria');
  if (!hecho.ubicacion) throw new Error('Falta la ubicación del hecho');

  const latitud = parseFloat(hecho.ubicacion.latitud);
  const longitud = parseFloat(hecho.ubicacion.longitud);

  if (Number.isNaN(latitud) || Number.isNaN(longitud)) {
    throw new Error('La latitud y longitud deben ser números válidos');
  }

  return {
    titulo: hecho.titulo.trim(),
    descripcion: hecho.descripcion.trim(),
    categoria: hecho.categoria,
    fecha: hecho.fecha,
    provincia: hecho.provincia?.trim() || null,
    ubicacion: {
      latitud,
      longitud,
    },
  };
};

const fileToDataUrl = (archivo) =>
  new Promise((resolve, reject) => {
    if (!archivo) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(archivo);
  });

export const enviarContribucionRapida = async ({ contribuyenteId, hecho, archivo, token,anonimo }) => {
  if (!contribuyenteId) {
    throw new Error('No pudimos obtener el contribuyenteId del token.');
  }

  const hechoDto = sanitizeHecho(hecho);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const contribucionPayload = {
    idContribuyente: contribuyenteId,
    hecho: hechoDto,
  };

  try {
    // The backend returns the ID directly, e.g. 10
    const response = await axios.post(`${API_BASE_URL}/contribuciones`, 
      {idContribuyente: contribuyenteId,
        hecho:hechoDto,
        anonimo: anonimo
    },{ headers });
    const contribucionId = response.data;

    if (archivo) {
      let tipo = 'TEXTO';
      if (archivo.type.startsWith('image/')) tipo = 'IMAGEN';
      else if (archivo.type.startsWith('video/')) tipo = 'VIDEO';
      else if (archivo.type.startsWith('audio/')) tipo = 'AUDIO';

      const formData = new FormData();
      formData.append('file', archivo)
      formData.append('tipo', tipo)

      await axios.patch(
        `${API_BASE_URL}/contribuciones/${contribucionId}`,formData,
        { headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        } }
      );
    }

    return {
      contribuyenteId,
      contribucionId,
      archivoAdjunto: archivo ? { nombreOriginal: archivo.name, tipo: archivo.type } : null,
    };
  } catch (error) {
    console.error('Error enviando contribución:', error);
    throw new Error(error.response?.data?.message || 'Error al enviar la contribución');
  }
};

export const getContribucionesByContribuyente = async (idSistema, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await axios.get(`${API_BASE_URL}/contribuciones/contribuyente/${idSistema}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo contribuciones:', error);
    throw new Error('Error obteniendo contribuciones');
  }
};

export const getContribucionesByKeycloakId = async (keycloakId, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await axios.get(`${API_BASE_URL}/contribuciones/keycloak/${keycloakId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo contribuciones:', error);
    throw new Error('Error obteniendo contribuciones');
  }
};

export const getCategorias = async () => {
  try {
      let url = `${API_ADMINISTRATIVA_URL}/categorias`;
      const response = await axios.get(url, {
        headers: { "Cache-Control": "no-cache" },
      });

      return response.data;
    } catch (error) {
      console.error("Error obteniendo las categorias", error);
      throw error;
    }
 
};

