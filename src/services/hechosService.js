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
const API_URL = 'http://localhost:8100/hechos';
const API_PUBLICA_URL = 'http://localhost:8100'
const API_ADMI_URL = "http://localhost:8084/hechos";
// Asegúrate de cambiar 'localhost:8080' por la dirección correcta de tu API.

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
    // Aquí mapeamos la 'q' del frontend
    if (filtros.q) params.append('q', filtros.q);

    params.append('page', page);
    params.append('size', size);
    const queryString = params.toString();
    return `${API_URL}${queryString ? '?' + queryString : ''}`;
};


export const hechosService = {

  async obtenerProvincias() {
    try {
        const response = await axios.get(`${API_PUBLICA_URL}/provincias`); 
        return response.data;
    } catch (error) {
        return [];
    }
  },
  async obtenerCategorias() {
    try {
        const response = await axios.get(`${API_PUBLICA_URL}/categorias`); 
        return response.data;
    } catch (error) {
        console.error("Error al cargar categorías", error);
        return [];
    }
  },

  async listarHechos(filtros, page = 0, size = 10) {
    const url = buildUrlWithFilters(filtros, page, size);
    console.log(`Llamando al backend en: ${url}`);

    try {
        const response = await axios.get(url);
        
        return response.data; 

    } catch (error) {
        console.error("Fallo al obtener hechos del backend:", error);
        throw error;
    }
  },
  async obtenerHechoPorId(id) {
    if (!id) {
      throw new Error("Se requiere un ID para obtener los detalles del hecho.");
    }

    // 🌟 URL específica para un hecho: Ejem: /api/v1/hechos/123
    const url = `${API_URL}/${id}`; 

    console.log(`Llamando al backend para detalle en: ${url}`);

    try {
        const response = await axios.get(url);
        
        return response.data; 

    } catch (error) {
        console.error("Fallo al obtener hechos del backend:", error);
        throw error;
    }
  },
};


export const actualizarEtiqueta = async (idHecho, etiqueta) => {
  const response = await fetch(`${API_ADMI_URL}/${idHecho}/etiqueta`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: etiqueta,
  });

  if (!response.ok) {
    throw new Error("Error actualizando etiqueta");
  }

  // No retornamos nada
};

export const obtenerEtiquetas = async () => {
  const res = await fetch(`http://localhost:8084/etiquetas`);
  if (!res.ok) throw new Error("No se pudieron cargar las etiquetas");
  return await res.json();
};