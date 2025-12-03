import { mockCollections } from '../constants/mockCollections';

// Helper to simulate API delay
const simulateDelay = (data, delay = 400) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay);
  });

// Generate some mock requests based on existing facts
const generateMockSolicitudes = () => {
  const solicitudes = [];
  let reqId = 1;

  // Pick a few facts from the first collection
  const collection = mockCollections[0];
  if (collection && collection.hechos) {
    // Request 1
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
    // Request 2
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

  // Pick a fact from another collection if available
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
