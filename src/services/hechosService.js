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
// Asegúrate de cambiar 'localhost:8080' por la dirección correcta de tu API.

/**
 * Función auxiliar para construir la URL con los parámetros de consulta (Query Params).
 * @param {object} filtros - Los filtros proporcionados por el frontend.
 * @returns {string} URL completa con query parameters.
 */
const buildUrlWithFilters = (filtros) => {
    const params = new URLSearchParams();

    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.fechaDesde) params.append('fecha_acontecimiento_desde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fecha_acontecimiento_hasta', filtros.fechaHasta);
    
    // Aquí mapeamos la 'q' del frontend
    if (filtros.q) params.append('q', filtros.q);

    const queryString = params.toString();
    return `${API_URL}${queryString ? '?' + queryString : ''}`;
};


export const hechosService = {
  async listarHechos(filtros = {}) {
    const url = buildUrlWithFilters(filtros);
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