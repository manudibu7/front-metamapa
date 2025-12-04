import { API_URL } from '../config/api';

// Mock data matching the ORIGINAL EstadisticaOutputDTO (no tipoEstadistica)
const mockEstadisticas = [
  {
    // MAXCATEGORIACONHECHOS
    discriminante: { tipo: 'SIN', valor: '' },
    resultado: { nombre: 'Incendio forestal', cantidad: 150 },
    datos: [
      { nombre: 'Incendio forestal', cantidad: 150 },
      { nombre: 'Inundación', cantidad: 80 },
      { nombre: 'Accidente', cantidad: 45 },
      { nombre: 'Contaminación', cantidad: 30 }
    ]
  },
  {
    // CANTSOLICITUDESSPAM
    discriminante: { tipo: 'SIN', valor: '' },
    resultado: { nombre: 'cantidad spam', cantidad: 12 },
    datos: [
      { nombre: 'cantidad total', cantidad: 120 },
      { nombre: 'cantidad spam', cantidad: 12 }
    ]
  },
  {
    // MAXHORASEGUNCATEGORIA
    discriminante: { tipo: 'CATEGORIA', valor: 'Incendio forestal' },
    resultado: { nombre: '14:00', cantidad: 25 },
    datos: [
      { nombre: '10:00', cantidad: 5 },
      { nombre: '11:00', cantidad: 10 },
      { nombre: '12:00', cantidad: 15 },
      { nombre: '13:00', cantidad: 20 },
      { nombre: '14:00', cantidad: 25 },
      { nombre: '15:00', cantidad: 22 },
      { nombre: '16:00', cantidad: 18 }
    ]
  },
  {
    // MAXHORASEGUNCATEGORIA
    discriminante: { tipo: 'CATEGORIA', valor: 'Inundación' },
    resultado: { nombre: '09:00', cantidad: 12 },
    datos: [
      { nombre: '08:00', cantidad: 8 },
      { nombre: '09:00', cantidad: 12 },
      { nombre: '10:00', cantidad: 10 }
    ]
  },
  {
    // MAXPROVINCIASEGUNCONCATEGORIA
    discriminante: { tipo: 'CATEGORIA', valor: 'Incendio forestal' },
    resultado: { nombre: 'Córdoba', cantidad: 50 },
    datos: [
      { nombre: 'Córdoba', cantidad: 50 },
      { nombre: 'Río Negro', cantidad: 40 },
      { nombre: 'Chubut', cantidad: 30 }
    ]
  },
  {
    // MAXPROVINCIADEUNACOLECCION
    discriminante: { tipo: 'COLECCION', valor: 'incendios-argentina-2025' },
    resultado: { nombre: 'Córdoba', cantidad: 100 },
    datos: [
      { nombre: 'Córdoba', cantidad: 100 },
      { nombre: 'San Luis', cantidad: 50 }
    ]
  }
];

export const getEstadisticas = async () => {
  // In a real app, this would be:
  // const response = await fetch(`${API_URL}/estadisticas`);
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEstadisticas);
    }, 500);
  });
};

export const downloadCSV = () => {
  window.location.href = `${API_URL}/estadisticas/exportar`;
};
