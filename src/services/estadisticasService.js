/*const mockEstadisticas = [
  {
    discriminante: { valor: 'Colección: Contaminación industrial', tipo: 'COLECCION' },
    datos: [
      { nombre: 'Buenos Aires', cantidad: 42 },
      { nombre: 'Santa Fe', cantidad: 27 },
      { nombre: 'Córdoba', cantidad: 18 },
      { nombre: 'Chaco', cantidad: 9 },
    ],
    resultado: { nombre: 'Buenos Aires', cantidad: 42 },
  },
  {
    discriminante: { valor: 'Categoría: Incendios forestales', tipo: 'CATEGORIA' },
    datos: [
      { nombre: '08:00', cantidad: 4 },
      { nombre: '12:00', cantidad: 11 },
      { nombre: '16:00', cantidad: 14 },
      { nombre: '20:00', cantidad: 7 },
      { nombre: '00:00', cantidad: 3 },
    ],
    resultado: { nombre: '16:00', cantidad: 14 },
  },
  {
    discriminante: { valor: 'Solicitudes de eliminación', tipo: 'ESTADO' },
    datos: [
      { nombre: 'Aprobadas', cantidad: 12 },
      { nombre: 'Pendientes', cantidad: 6 },
      { nombre: 'Rechazadas', cantidad: 4 },
    ],
    resultado: { nombre: 'Aprobadas', cantidad: 12 },
  },
];

//const simulateDelay = (data, delay = 400) =>
//  new Promise((resolve) => {
//    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay);
//  });

export const obtenerEstadisticas = async () => simulateDelay(mockEstadisticas);

export const exportarEstadisticasCSV = async () => {
  const header = 'discriminante,discriminante_tipo,nombre,cantidad';
  const rows = mockEstadisticas.flatMap((estadistica) =>
    estadistica.datos.map((dato) =>
      [
        JSON.stringify(estadistica.discriminante?.valor ?? 'N/A'),
        JSON.stringify(estadistica.discriminante?.tipo ?? 'N/A'),
        JSON.stringify(dato.nombre ?? ''),
        dato.cantidad ?? 0,
      ].join(',')
    )
  );
  return [header, ...rows].join('\n');
};

////TODO INTEGRACIOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOON


*/

// 💡 URL base de tu backend para el controlador /estadisticas
const API_URL_BASE = 'http://localhost:8200/estadisticas';

/*
 * Función genérica para manejar respuestas HTTP, verificando el estado 'ok'.
 * @param {Response} response - Objeto Response de la API Fetch.
 * @returns {Promise<any>} El cuerpo de la respuesta parseado o null/texto.
 * @throws {Error} Si el estado de la respuesta es un código de error (4xx, 5xx).
 */
const handleResponse = async (response) => {
    // 204: No Content (Devuelve una lista vacía de forma limpia)
    if (response.status === 204) {
        return null;
    }

    // 200 OK con contenido CSV
    if (response.headers.get('Content-Type')?.includes('text/csv')) {
        return response.text();
    }

    // Si no es OK, lanza un error con el detalle
    if (!response.ok) {
        // Intenta leer el JSON de error, si falla, usa el texto de estado.
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        const errorMessage = `Error en la API: ${response.status} - ${errorBody.message || response.statusText}`;
        throw new Error(errorMessage);
    }

    // 200 OK con contenido JSON (para la lista de estadísticas)
    return response.json();
};

// ---------------------------------------------------------------------------------

export const obtenerEstadisticas = async () => {
    // Llama a GET /estadisticas.
    // Como el @GetMapping en el backend NO tiene @RequestParam, no se envían filtros.
    const url = API_URL_BASE;

    try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                    // 'Authorization': 'Bearer ...' // Si usas token
                }
            });

            // 1. Manejo explícito del 204 (No Content)
            // Si el backend dice "no hay nada", devolvemos array vacío y NO hacemos .json()
            if (response.status === 204) {
                return []; 
            }

            // 2. Manejo de errores (4xx, 5xx)
            if (!response.ok) {
                const textoError = await response.text();
                throw new Error(`Error ${response.status}: ${textoError || response.statusText}`);
            }

            // 3. Éxito (200 OK) -> Parseamos el JSON
            const data = await response.json();
            return data;

        } catch (error) {
            console.error("[Estadisticas] Error en servicio:", error);
            throw error;
        }
};

export const exportarEstadisticasCSV = async () => {
    // Llama a GET /estadisticas/exportar
    const url = `${API_URL_BASE}/exportar`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/csv' // Le decimos que esperamos un CSV
            }
        });

        // Espera recibir un String (CSV content) o un error (404)
        const csvContent = await handleResponse(response);

        // Devuelve el contenido del archivo CSV como una cadena de texto
        return csvContent;

    } catch (error) {
        console.error("Fallo al exportar estadísticas a CSV:", error);
        throw error;
    }
};

// ---------------------------------------------------------------------------------

/**
 * ⚠️ Función auxiliar para obtener una estadística por ID (basada en tu endpoint /{id_estadistica})
 * Nota: Si esta función no se usa en tu frontend, puedes eliminarla.
 * @param {string} idEstadistica - El ID de la estadística a obtener.
 */
export const obtenerEstadisticaPorID = async (idEstadistica) => {
    // Llama a GET /estadisticas/{id_estadistica}
    const url = `${API_URL_BASE}/${encodeURIComponent(idEstadistica)}`;

    try {
        const response = await fetch(url);
        // Espera recibir EstadisticaOutputDTO o 404
        const estadistica = await handleResponse(response);
        return estadistica;
    } catch (error) {
        console.error(`Fallo al obtener estadística con ID ${idEstadistica}:`, error);
        throw error;
    }
};
