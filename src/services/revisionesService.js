// Mock data based on ContribucionOutputDTO structure
const mockPendientes = [
  {
    idContribucion: 101,
    idContribuyente: 55,
    hecho: {
      titulo: 'Bache peligroso en Av. Libertador',
      descripcion: 'Hay un bache profundo en el carril derecho, casi provoca un accidente.',
      fecha: '2025-12-01',
      ubicacion: { latitud: -34.5827, longitud: -58.4016 },
      categoria: 'Infraestructura',
      tipoDeHecho: 'TEXTO',
      adjuntos: [],
    },
  },
  {
    idContribucion: 102,
    idContribuyente: 12, // Anonimo or registered ID
    hecho: {
      titulo: 'Árbol caído tras tormenta',
      descripcion: 'Un árbol bloquea la calle Salguero al 2000.',
      fecha: '2025-12-02',
      ubicacion: { latitud: -34.5789, longitud: -58.4055 },
      categoria: 'Incidente',
      tipoDeHecho: 'MULTIMEDIA',
      adjuntos: [
        { url: 'https://example.com/arbol.jpg', tipo: 'imagen' } // Mock adjunto
      ],
    },
  },
  {
    idContribucion: 103,
    idContribuyente: 88,
    hecho: {
      titulo: 'Semáforo fuera de servicio',
      descripcion: 'Intersección de Callao y Santa Fe sin semáforos funcionando.',
      fecha: '2025-12-03',
      ubicacion: { latitud: -34.5955, longitud: -58.3912 },
      categoria: 'Tránsito',
      tipoDeHecho: 'TEXTO',
      adjuntos: [],
    },
  },
];

// Helper to simulate API delay
const simulateDelay = (data, delay = 400) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay);
  });

// In-memory store for the session
let pendientesStore = [...mockPendientes];

export const listarPendientes = async () => {
  return simulateDelay(pendientesStore);
};

export const aceptarRevision = async (idContribucion, comentarios) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      pendientesStore = pendientesStore.filter((p) => p.idContribucion !== idContribucion);
      console.log(`Aceptada ${idContribucion} con comentarios: ${comentarios}`);
      resolve();
    }, 400);
  });
};

export const aceptarConCambios = async (idContribucion, comentarios) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      pendientesStore = pendientesStore.filter((p) => p.idContribucion !== idContribucion);
      console.log(`Aceptada con cambios ${idContribucion}: ${comentarios}`);
      resolve();
    }, 400);
  });
};

export const rechazarRevision = async (idContribucion, comentarios) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      pendientesStore = pendientesStore.filter((p) => p.idContribucion !== idContribucion);
      console.log(`Rechazada ${idContribucion}: ${comentarios}`);
      resolve();
    }, 400);
  });
};
