import { mockCollections } from '../constants/mockCollections';
import { collectionsService,obtenerFuentes } from './collectionsService';

export const fuentesDisponibles =  await obtenerFuentes();
const deepClone = (payload) => JSON.parse(JSON.stringify(payload));

const simulateDelay = (data, delay = 350) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(data)), delay);
  });

const ensureCondiciones = (coleccion) =>
  coleccion.Condiciones && coleccion.Condiciones.length
    ? coleccion.Condiciones: [];
    /*: (coleccion.tags ?? []).map((tag, index) => ({
        id: `${coleccion.id}-tag-${index}`,
        detail: `Tag = ${tag}`,
      })); */

const normalizeInput = (coleccionInput) => {
 /* const tags = coleccionInput.tagsInput
    ? coleccionInput.tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []; */
  const fuentes = (coleccionInput.fuentes ?? []).filter((fuente) => fuentesDisponibles.includes(fuente));

  return {
    titulo: coleccionInput.titulo?.trim() ?? '',
    descripcion: coleccionInput.descripcion?.trim() ?? '',
    fuentes,
    //tags,
    Condiciones: (coleccionInput.criterios ?? []).map((criterio,index) => ({
      //id: `${Date.now()}-${index}`,
      id : null,
      tipo: `${criterio.tipo}`,
      valor: `${criterio.valor}`,
    })),
     consenso: coleccionInput.algoritmoConcenso?.trim() ?? '',
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
  const nuevaColeccion = normalizeInput(coleccionInput);
  
  await collectionsService.createCollection(nuevaColeccion);

};

export const actualizarColeccion = async (id, coleccionInput) => {
 
  const coleccionActualizada = normalizeInput(coleccionInput);
  
  await collectionsService.updateCollection(id,coleccionActualizada);
};

export const eliminarColeccion = async (id) => {
  
  await collectionsService.deleteById(id);
};
