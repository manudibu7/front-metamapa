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
const BASE_URL = "http://localhost:8100/solicitudes";
const ADMINISTRATIVA_URL = "http://localhost:8084/solicitudes";

// GET /solicitudes
export const obtenerSolicitudes = async () => {
  try {
    const response = await fetch(BASE_URL);
    console.log("Código de estado recibido:", response.status);
    if (!response.ok) {
      throw new Error("Error al obtener solicitudes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en obtenerSolicitudeees:", error);
    throw error;
  }
};

// POST /solicitudes
export const crearSolicitud = async (solicitud) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(solicitud),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "Error al crear solicitud");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en crearSolicitud:", error);
    throw error;
  }
};

export const actualizarEstadoSolicitud = async (id, nuevoEstado) => {
  const response = await fetch(`${ADMINISTRATIVA_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  if (!response.ok) throw new Error("Error al actualizar estado");

  return await response.json(); // ← ahora sí existe y funciona
};
// DELETE solicitudes
export const eliminarSolicitud = async (id) => {
  const response = await fetch(`${ADMINISTRATIVA_URL}/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Error eliminando solicitud");
  }
};