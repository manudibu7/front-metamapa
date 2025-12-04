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
const API_URL = 'http://localhost:8080/hechos';
// Asegúrate de cambiar 'localhost:8080' por la dirección correcta de tu API.

/**
 * Función auxiliar para construir la URL con los parámetros de consulta (Query Params).
 * @param {object} filtros - Los filtros proporcionados por el frontend.
 * @returns {string} URL completa con query parameters.
 */
const buildUrlWithFilters = (filtros) => {
    const params = new URLSearchParams();

    // Mapeo de Filtros
    if (filtros.categoria) {
        params.append('categoria', filtros.categoria);
    }

    // ⚠️ Mapeo de Fechas: frontend.fechaDesde/Hasta -> backend.fecha_acontecimiento_*
    // Asumimos que quieres filtrar la fecha del acontecimiento.
    if (filtros.fechaDesde) {
        params.append('fecha_acontecimiento_desde', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
        params.append('fecha_acontecimiento_hasta', filtros.fechaHasta);
    }

    // Mapeo del filtro de texto libre 'q'
    if (filtros.q) {
        params.append('q', filtros.q);
    }

    // Los filtros 'provincia', 'fuenteTipo' y 'modo' se IGNORAN ya que no tienen
    // un parámetro @RequestParam coincidente en tu backend.

    const queryString = params.toString();
    // Si hay parámetros, agrega '?' y la cadena de parámetros, si no, solo devuelve la URL base.
    return `${API_URL}${queryString ? '?' + queryString : ''}`;
};


export const hechosService = {
  /**
   * Obtiene la lista de hechos desde el backend.
   * La función ahora devuelve una Promise basada en la llamada 'fetch'.
   * @param {object} filtros - Objeto con los criterios de filtrado.
   * @returns {Promise<Array<Hecho>>} Una promesa que se resuelve con la lista de hechos.
   */
  async listarHechos(filtros = {}) {
    const url = buildUrlWithFilters(filtros);

    console.log(`Llamando al backend en: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // Puedes añadir otros headers como 'Authorization' o 'Content-Type' si son necesarios
                'Accept': 'application/json'
            }
        });

        // Manejar códigos de respuesta HTTP que indican error (4xx, 5xx)
        if (!response.ok) {
            // Intenta leer el mensaje de error del cuerpo de la respuesta si está disponible
            const errorBody = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Error en la API: ${response.status} - ${errorBody.message || 'Error desconocido'}`);
        }

        // Si la respuesta es OK (200), parsear el cuerpo como JSON
        const data = await response.json();

        // El backend devuelve HechoOutputDTO[], que se convertirá en un array de objetos JS
        return data;

    } catch (error) {
        // Capturar errores de red o los errores lanzados arriba
        console.error("Fallo al obtener hechos del backend:", error);
        // Puedes relanzar el error o devolver un array vacío según tu manejo de errores.
        throw error;
    }
  },
};
