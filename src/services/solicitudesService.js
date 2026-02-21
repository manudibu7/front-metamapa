import { mockCollections } from '../constants/mockCollections';

// Helper to simulate API delay
const simulateDelay = (data, delay = 400) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay);
  });

//solicitudes mockeadas
const generateMockSolicitudes = () => {
  const solicitudes = [];
  let reqId = 1;

  const collection = mockCollections[0];
  if (collection && collection.hechos) {
    if (collection.hechos[0]) {
      solicitudes.push({
        id: `SOL-${reqId++}`,
        hecho: { ...collection.hechos[0], coleccionTitulo: collection.titulo },
        motivo: 'Información duplicada con el reporte INC-005.',
        usuario: 'usuario_comunidad',
        fechaSolicitud: '2025-11-15T10:30:00Z',
        estado: 'PENDIENTE',
      });
    }
    if (collection.hechos[1]) {
      solicitudes.push({
        id: `SOL-${reqId++}`,
        hecho: { ...collection.hechos[1], coleccionTitulo: collection.titulo },
        motivo: 'La ubicación es incorrecta, corresponde a otro departamento.',
        usuario: 'admin_regional',
        fechaSolicitud: '2025-11-14T16:45:00Z',
        estado: 'PENDIENTE',
      });
    }
  }

  const collection2 = mockCollections[1];
  if (collection2 && collection2.hechos && collection2.hechos[0]) {
    solicitudes.push({
      id: `SOL-${reqId++}`,
      hecho: { ...collection2.hechos[0], coleccionTitulo: collection2.titulo },
      motivo: 'Contenido inapropiado en la descripción.',
      usuario: 'moderador_auto',
      fechaSolicitud: '2025-11-16T09:15:00Z',
      estado: 'RECHAZADA',
    });
  }

  return solicitudes;
};

// In-memory store for the session
/*
let solicitudesStore = generateMockSolicitudes();

export const obtenerSolicitudes = async () => {
  return simulateDelay(solicitudesStore);
};

export const actualizarEstadoSolicitud = async (id, nuevoEstado) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = solicitudesStore.findIndex((s) => s.id === id);
      if (index !== -1) {
        solicitudesStore[index].estado = nuevoEstado;
        resolve(solicitudesStore[index]);
      } else {
        reject(new Error('Solicitud no encontrada'));
      }
    }, 400);
  });
};
*/
const BASE_URL = process.env.REACT_APP_API_PUBLICA_URL + "/solicitudes";
const ADMINISTRATIVA_URL = process.env.REACT_APP_API_ADMINISTRATIVA_URL + "/solicitudes";

// GET /solicitudes
export const obtenerSolicitudes = async () => {
  console.log('[Solicitudes] 📋 Obteniendo solicitudes...');
  try {
    const response = await fetch(BASE_URL);
    console.log(`[Solicitudes] 📡 Estado respuesta: ${response.status}`);
    
    if (!response.ok) {
      throw new Error("Error al obtener solicitudes");
    }

    const data = await response.json();
    console.log('[Solicitudes] ✅ Solicitudes obtenidas:', data.length);
    return data;
  } catch (error) {
    console.error('[Solicitudes] ❌ Error en obtenerSolicitudes:', error);
    throw error;
  }
};

// POST /solicitudes
export const crearSolicitud = async (solicitud) => {
  console.log('[Solicitudes] 🚀 Creando nueva solicitud...', solicitud);
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(solicitud),
    });

    if (!response.ok) {
      const msg = await response.text();
      console.error(`[Solicitudes] ❌ Error del servidor: ${msg}`);
      throw new Error(msg || "Error al crear solicitud");
    }

    const data = await response.json();
    console.log('[Solicitudes] ✅ Solicitud creada con éxito');
    return data;
  } catch (error) {
    console.error('[Solicitudes] ❌ Error en crearSolicitud:', error);
    throw error;
  }
};

export const actualizarEstadoSolicitud = async (id, nuevoEstado) => {
  console.log(`[Solicitudes] ✏️ Actualizando solicitud ID: ${id} -> Estado: ${nuevoEstado}`);
  const response = await fetch(`${ADMINISTRATIVA_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  if (!response.ok) {
    console.error('[Solicitudes] ❌ Fallo al actualizar estado');
    throw new Error("Error al actualizar estado");
  }

  console.log('[Solicitudes] ✅ Estado actualizado con éxito');
  return await response.json(); // ← ahora sí existe y funciona
};
// DELETE solicitudes
export const eliminarSolicitud = async (id) => {
  console.log(`[Solicitudes] 🗑️ Eliminando solicitud ID: ${id}`);
  const response = await fetch(`${ADMINISTRATIVA_URL}/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    console.error('[Solicitudes] ❌ Fallo al eliminar solicitud');
    throw new Error("Error eliminando solicitud");
  }
  console.log('[Solicitudes] ✅ Solicitud eliminada con éxito');
};