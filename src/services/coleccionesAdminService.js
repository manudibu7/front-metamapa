import { mockCollections } from '../constants/mockCollections';
import { collectionsService } from './collectionsService';

export const fuentesDisponibles = ['loader-estatico', 'loader-dinamico', 'loader-proxy'];

const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const simulateDelay = (data, delay = 350) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(data)), delay);
  });

const ensureCondiciones = (coleccion) =>
  coleccion.Condiciones && coleccion.Condiciones.length
    ? coleccion.Condiciones
    : (coleccion.tags ?? []).map((tag, index) => ({
        id: `${coleccion.id}-tag-${index}`,
        detail: `Tag = ${tag}`,
      }));

const normalizeInput = (coleccionInput) => {
  const tags = coleccionInput.tagsInput
    ? coleccionInput.tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
  const fuentes = (coleccionInput.fuentesInput ?? []).filter((fuente) => fuentesDisponibles.includes(fuente));

  return {
    titulo: coleccionInput.tituloInput?.trim() ?? '',
    descripcion: coleccionInput.descripcionInput?.trim() ?? '',
    consenso: coleccionInput.algoritmoConcenso?.trim() ?? '',
    tags,
    fuentes,
    Condiciones: (coleccionInput.criteriosInput ?? []).map((criterio, index) => ({
      id: `${Date.now()}-${index}`,
      detail: `${criterio.tipo} = ${criterio.valor}`,
    })),
  };
};

let adminCollections = []; // se carga luego de forma ASÍNCRONA

export const cargarAdminCollections = async () => {
  const response = await collectionsService.getCollections();
  const datos = response.data;

  adminCollections = datos.map((coleccion, index) => ({
    ...coleccion,
    id: coleccion.id ?? index + 1,
    Condiciones: ensureCondiciones(coleccion),
  }));
};

export const obtenerColeccionesAdmin = async () => {
  if (adminCollections.length === 0) {
    await cargarAdminCollections();
    
  }
  return adminCollections;
};

export const crearColeccion = async (coleccionInput) => {
  const payload = normalizeInput(coleccionInput);
  const nuevaColeccion = {
    ...payload,
    handle: payload.titulo.toLowerCase().replace(/\s+/g, '-'),
    estado: 'PENDIENTE',
    ultimaActualizacion: new Date().toISOString(),
    totalHechos: 0,
  };
  
  adminCollections.push(nuevaColeccion);
  return simulateDelay(nuevaColeccion);
};

export const actualizarColeccion = async (id, coleccionInput) => {
  const index = adminCollections.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Colección no encontrada');
  }
  const payload = normalizeInput(coleccionInput);
  adminCollections[index] = {
    ...adminCollections[index],
    ...payload,
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
