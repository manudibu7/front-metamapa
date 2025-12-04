/*const mockEstadisticas = [
  {
    discriminante: { valor: 'Colección: Contaminación industrial', tipo: 'COLECCION' },
    datos: [
      { nombre: 'Buenos Aires', cantidad: 42 },
      { nombre: 'Santa Fe', cantidad: 27 },
      { nombre: 'Córdoba', cantidad: 18 },
      { nombre: 'Chaco', cantidad: 9 },
    ],
    resultado: { nombre: 'Buenos Aires', cantidad: 42 },
  },
  {
    discriminante: { valor: 'Categoría: Incendios forestales', tipo: 'CATEGORIA' },
    datos: [
      { nombre: '08:00', cantidad: 4 },
      { nombre: '12:00', cantidad: 11 },
      { nombre: '16:00', cantidad: 14 },
      { nombre: '20:00', cantidad: 7 },
      { nombre: '00:00', cantidad: 3 },
    ],
    resultado: { nombre: '16:00', cantidad: 14 },
  },
  {
    discriminante: { valor: 'Solicitudes de eliminación', tipo: 'ESTADO' },
    datos: [
      { nombre: 'Aprobadas', cantidad: 12 },
      { nombre: 'Pendientes', cantidad: 6 },
      { nombre: 'Rechazadas', cantidad: 4 },
    ],
    resultado: { nombre: 'Aprobadas', cantidad: 12 },
  },
];
*/
//const simulateDelay = (data, delay = 400) =>
//  new Promise((resolve) => {
//    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay);
//  });

export const obtenerEstadisticas = async () => simulateDelay(mockEstadisticas);

export const exportarEstadisticasCSV = async () => {
  const header = 'discriminante,discriminante_tipo,nombre,cantidad';
  const rows = mockEstadisticas.flatMap((estadistica) =>
    estadistica.datos.map((dato) =>
      [
        JSON.stringify(estadistica.discriminante?.valor ?? 'N/A'),
        JSON.stringify(estadistica.discriminante?.tipo ?? 'N/A'),
        JSON.stringify(dato.nombre ?? ''),
        dato.cantidad ?? 0,
      ].join(',')
    )
  );
  return [header, ...rows].join('\n');
};
