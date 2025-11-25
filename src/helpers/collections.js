export const buildMarkers = (collection) => {
  if (!collection || !Array.isArray(collection.hechos)) return [];
  return collection.hechos.map((hecho) => ({
    id: hecho.id,
    lat: Number(hecho.ubicacionLat),
    lon: Number(hecho.ubicacionLon),
    title: hecho.titulo,
    provincia: hecho.provincia,
    etiqueta: hecho.etiqueta,
  }));
};

export const formatProvincia = (provincia) => provincia ?? 'Provincia sin dato';

export const formatFuente = (hecho) =>
  hecho?.fuenteNombre ? `${hecho.fuenteNombre} (${hecho.fuente.replace('_', ' ')})` : 'Fuente no informada';
