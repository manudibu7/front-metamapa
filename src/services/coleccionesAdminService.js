import { mockCollections } from '../constants/mockCollections';

// Mock sources with IDs to match backend expectation
export const fuentesMock = [
  { id: 1, nombre: 'loader-estatico', tipo: 'INTERNO' },
  { id: 2, nombre: 'loader-dinamico', tipo: 'EXTERNO' },
  { id: 3, nombre: 'loader-proxy', tipo: 'PROXY' },
];

const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const simulateDelay = (data, delay = 350) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(data)), delay);
  });

// Helper to map string sources from mockCollections to IDs
const mapSourcesToIds = (sourceNames) => {
  if (!sourceNames) return [];
  return sourceNames.map(name => {
    const found = fuentesMock.find(f => f.nombre === name);
    return found ? found.id : null;
  }).filter(Boolean);
};

const ensureCondiciones = (coleccion) =>
  coleccion.Condiciones && coleccion.Condiciones.length
    ? coleccion.Condiciones
    : (coleccion.tags ?? []).map((tag, index) => ({
        id: index + 1000, // Mock ID
        detail: `Tag = ${tag}`,
      }));

// Transform mockCollections to match backend ColeccionDto
const adminCollections = deepClone(mockCollections).map((coleccion, index) => ({
  id: coleccion.id ?? index + 1,
  titulo: coleccion.titulo,
  descripcion: coleccion.descripcion,
  Condiciones: ensureCondiciones(coleccion),
  // Extra fields for frontend display that might not be in DTO but useful
  fuentesIds: mapSourcesToIds(coleccion.fuentes), 
  consenso: coleccion.consenso,
  estado: coleccion.estado,
  ultimaActualizacion: coleccion.ultimaActualizacion,
  totalHechos: coleccion.totalHechos
}));

export const obtenerFuentes = async () => simulateDelay(fuentesMock);

export const obtenerColeccionesAdmin = async () => simulateDelay(adminCollections);

export const crearColeccion = async (coleccionInput) => {
  // coleccionInput matches ColeccionInput backend DTO
  // { tituloInput, descripcionInput, fuentesInput: [ids], criteriosInput: [{tipo, valor}], algoritmoConcenso }
  
  const nuevasCondiciones = (coleccionInput.criteriosInput ?? []).map((c, i) => ({
    id: Date.now() + i,
    detail: `${c.tipo} = ${c.valor}`
  }));

  const nuevaColeccion = {
    id: Date.now(),
    titulo: coleccionInput.tituloInput,
    descripcion: coleccionInput.descripcionInput,
    Condiciones: nuevasCondiciones,
    fuentesIds: coleccionInput.fuentesInput,
    consenso: coleccionInput.algoritmoConcenso,
    estado: 'borrador',
    ultimaActualizacion: new Date().toISOString(),
    totalHechos: 0
  };

  adminCollections.push(nuevaColeccion);
  return simulateDelay(nuevaColeccion);
};

export const actualizarColeccion = async (id, coleccionInput) => {
  const index = adminCollections.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Colección no encontrada');
  }

  const nuevasCondiciones = (coleccionInput.criteriosInput ?? []).map((c, i) => ({
    id: Date.now() + i,
    detail: `${c.tipo} = ${c.valor}`
  }));

  adminCollections[index] = {
    ...adminCollections[index],
    titulo: coleccionInput.tituloInput,
    descripcion: coleccionInput.descripcionInput,
    Condiciones: nuevasCondiciones,
    fuentesIds: coleccionInput.fuentesInput,
    consenso: coleccionInput.algoritmoConcenso,
    ultimaActualizacion: new Date().toISOString(),
  };
  
  return simulateDelay(adminCollections[index]);
};

export const eliminarColeccion = async (id) => {
  const index = adminCollections.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Colección no encontrada');
  }
  adminCollections.splice(index, 1);
  return simulateDelay({ success: true });
};
