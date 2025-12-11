import { mockCollections } from '../constants/mockCollections';
import { collectionsService,obtenerFuentes } from './collectionsService';

export let fuentesDisponibles = [];

export const cargarFuentes = async () => {
  fuentesDisponibles = await obtenerFuentes();
  console.log(fuentesDisponibles);
};


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
    criterios: (coleccionInput.criterios ?? []).map((criterio,index) => ({
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
    adminCollections=response;

};

export const obtenerColeccionesAdmin = async () => {
  if (adminCollections.length === 0) {
    await cargarAdminCollections();
    
  }
  return adminCollections;
};

export const crearColeccion = async (coleccionInput) => {
  //const nuevaColeccion = normalizeInput(coleccionInput);
  //console.log("Input dps de a normalizar:", nuevaColeccion);
  await collectionsService.createCollection(coleccionInput);

};

export const actualizarColeccion = async (id, coleccionInput) => {
 
  const coleccionActualizada = normalizeInput(coleccionInput);
  
  await collectionsService.updateCollection(id,coleccionActualizada);
};

export const eliminarColeccion = async (id) => {
  
  await collectionsService.deleteById(id);
};
