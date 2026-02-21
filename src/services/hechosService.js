import axios from "axios";

/*import { mockHechos } from '../constants/mockHechos';

const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

export const hechosService = {
  async listarHechos(filtros = {}) {
    const data = deepClone(mockHechos);

    const normalizados = data.filter((hecho) => {
      if (filtros.categoria && hecho.categoria !== filtros.categoria) return false;
      if (filtros.provincia && hecho.provincia !== filtros.provincia) return false;
      if (filtros.fuenteTipo && hecho.fuenteTipo !== filtros.fuenteTipo) return false;
      if (filtros.modo && hecho.modo !== filtros.modo) return false;
      if (filtros.fechaDesde && new Date(hecho.fecha) < new Date(filtros.fechaDesde)) return false;
      if (filtros.fechaHasta && new Date(hecho.fecha) > new Date(filtros.fechaHasta)) return false;
      return true;
    });

    return new Promise((resolve) => setTimeout(() => resolve(normalizados), 450));
  },
};*/
// hecho.service.js

// 💡 URL base de tu backend
const API_URL = process.env.REACT_APP_API_PUBLICA_URL + "/hechos";
const API_PUBLICA_URL = process.env.REACT_APP_API_PUBLICA_URL 
const API_ADMI_URL = process.env.REACT_APP_API_ADMINISTRATIVA_URL + "/hechos";

/**
 * Función auxiliar para construir la URL con los parámetros de consulta (Query Params).
 * @param {object} filtros - Los filtros proporcionados por el frontend.
 * @returns {string} URL completa con query parameters.
 */
const buildUrlWithFilters = (filtros, page, size) => {
    const params = new URLSearchParams();

    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.fechaDesde) params.append('fecha_acontecimiento_desde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fecha_acontecimiento_hasta', filtros.fechaHasta);
    if (filtros.provincia) params.append('provincia', filtros.provincia)
    if (filtros.fuenteTipo) params.append('tipoFuente', filtros.fuenteTipo)
    // Aquí mapeamos la 'q' del frontend
    if (filtros.q) params.append('q', filtros.q);

    params.append('page', page);
    params.append('size', size);
    const queryString = params.toString();
    return `${API_URL}${queryString ? '?' + queryString : ''}`;
};


export const hechosService = {

  async obtenerProvincias() {
    console.log('[Hechos] 🌍 Obteniendo provincias...');
    try {
        const response = await axios.get(`${API_PUBLICA_URL}/provincias`); 
        console.log('[Hechos] ✅ Provincias obtenidas:', response.data.length);
        return response.data;
    } catch (error) {
        console.error('[Hechos] ❌ Error al obtener provincias:', error);
        return [];
    }
  },
  async obtenerCategorias() {
    console.log('[Hechos] 🏷️ Obteniendo categorías...');
    try {
        const response = await axios.get(`${API_PUBLICA_URL}/categorias`); 
        console.log('[Hechos] ✅ Categorías obtenidas:', response.data.length);
        return response.data;
    } catch (error) {
        console.error("[Hechos] ❌ Error al cargar categorías", error);
        return [];
    }
  },

  async listarHechos(filtros, page = 0, size = 52) {
    const url = buildUrlWithFilters(filtros, page, size);
    console.log(`[Hechos] 🔍 Listando hechos. Page: ${page}, Filtros:`, filtros);
    console.log(`[Hechos] 📡 URL: ${url}`);

    try {
        const response = await axios.get(url);
        console.log('[Hechos] ✅ Hechos obtenidos:', response.data.content ? response.data.content.length : 'Formato desconocido');
        return response.data; 

    } catch (error) {
        console.error("[Hechos] ❌ Fallo al obtener hechos del backend:", error);
        throw error;
    }
  },
  async obtenerHechoPorId(id) {
    if (!id) {
      throw new Error("Se requiere un ID para obtener los detalles del hecho.");
    }

    // 🌟 URL específica para un hecho: Ejem: /api/v1/hechos/123
    const url = `${API_URL}/${id}`; 

    console.log(`[Hechos] 🔍 Obteniendo detalle hecho ID: ${id}`);
    console.log(`[Hechos] 📡 URL: ${url}`);

    try {
        const response = await axios.get(url);
        console.log('[Hechos] ✅ Detalle obtenido correctamente');
        return response.data; 

    } catch (error) {
        console.error("[Hechos] ❌ Fallo al obtener detalle hecho:", error);
        throw error;
    }
  },
};


export const actualizarEtiqueta = async (idHecho, etiqueta) => {
  console.log(`[Hechos] 🏷️ Buscando actualizar etiqueta hecho ID: ${idHecho} -> ${etiqueta}`);
  const response = await fetch(`${API_ADMI_URL}/${idHecho}/etiqueta`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: etiqueta,
  });

  if (!response.ok) {
    console.error(`[Hechos] ❌ Error actualizando etiqueta: ${response.status}`);
    throw new Error("Error actualizando etiqueta");
  }
  console.log('[Hechos] ✅ Etiqueta actualizada');

  // No retornamos nada
};

export const obtenerEtiquetas = async () => {
  console.log('[Hechos] 🏷️ Obteniendo etiquetas disponibles...');
  const res = await fetch(`${API_PUBLICA_URL}/etiquetas`);
  if (!res.ok) {
     console.error('[Hechos] ❌ Error obteniendo etiquetas');
     throw new Error("No se pudieron cargar las etiquetas");
  }
  const data = await res.json();
  console.log('[Hechos] ✅ Etiquetas obtenidas:', data.length);
  return data;
};