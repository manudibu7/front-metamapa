import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Estadisticas } from './Estadisticas';
import { obtenerEstadisticas, exportarEstadisticasCSV } from '../../services/estadisticasService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../services/estadisticasService', () => ({
  obtenerEstadisticas: jest.fn(),
  exportarEstadisticasCSV: jest.fn(),
}));

jest.mock('../../components/Estadistica/EstadisticaTorta/estadisticaTorta', () =>
  ({ data }) => <div data-testid="torta" data-count={data.length} />
);

jest.mock('../../components/Estadistica/EstadisticaBarra/estadisticaBarra', () =>
  ({ data }) => <div data-testid="barra" data-count={data.length} />
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeEstadistica = (tipo, valor, cantDatos = 3, conResultado = true) => ({
  descripcion: `Estadística de ${tipo}`,
  discriminante: { tipo, valor },
  resultado: conResultado ? { nombre: `Lider ${tipo}`, cantidad: 10 } : null,
  datos: Array.from({ length: cantDatos }, (_, i) => ({
    nombre: `Item ${i + 1}`,
    cantidad: i + 1,
  })),
});

const ESTADISTICAS_MOCK = [
  makeEstadistica('CATEGORIA', 'Desastre Natural'),
  makeEstadistica('CATEGORIA', 'Incendio'),
  makeEstadistica('COLECCION', 'Colección A'),
  makeEstadistica('SIN', 'General'),
];

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Silenciamos console.error para no ensuciar la salida de tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
  window.scrollTo = jest.fn();
  obtenerEstadisticas.mockResolvedValue(ESTADISTICAS_MOCK);
});

afterEach(() => {
  console.error.mockRestore();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Estadisticas', () => {

  // ── Estados de carga y error ─────────────────────────────────────────────────

  describe('estados de carga y error', () => {
    it('muestra el loader mientras carga', () => {
      obtenerEstadisticas.mockReturnValue(new Promise(() => {}));
      render(<Estadisticas />);
      expect(screen.getByText('Cargando estadísticas...')).toBeInTheDocument();
    });

    it('muestra el mensaje de error si el servicio falla', async () => {
      obtenerEstadisticas.mockRejectedValue(new Error('Error de red'));
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getByText('No pudimos cargar las estadísticas.')).toBeInTheDocument();
      });
    });

    it('oculta el loader cuando los datos cargan', async () => {
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
      });
    });
  });

  // ── Grupos de estadisticas ───────────────────────────────────────────────────

  describe('grupos de estadisticas', () => {
    it('renderiza el grupo "Por Categoría"', async () => {
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getByText('Por Categoría')).toBeInTheDocument();
      });
    });

    it('renderiza el grupo "Por Colección"', async () => {
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getByText('Por Colección')).toBeInTheDocument();
      });
    });

    it('renderiza el grupo "Generales"', async () => {
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getByText('Generales')).toBeInTheDocument();
      });
    });

    it('no renderiza un grupo si no tiene estadisticas', async () => {
      obtenerEstadisticas.mockResolvedValue([
        makeEstadistica('CATEGORIA', 'Desastre Natural'),
      ]);
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.queryByText('Por Colección')).not.toBeInTheDocument();
        expect(screen.queryByText('Generales')).not.toBeInTheDocument();
      });
    });

    it('renderiza una card por cada estadistica', async () => {
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(ESTADISTICAS_MOCK.length);
      });
    });
  });

  // ── Contenido de las cards ───────────────────────────────────────────────────

  describe('contenido de las cards', () => {
    it('muestra el resultado con mas hechos cuando existe', async () => {
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getAllByText(/Lider CATEGORIA con 10 hechos/)).toHaveLength(2);
      });
    });

    it('no muestra el resumen si resultado es null', async () => {
      obtenerEstadisticas.mockResolvedValue([
        makeEstadistica('CATEGORIA', 'Desastre Natural', 3, false),
      ]);
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.queryByText(/Resultado con más hechos/)).not.toBeInTheDocument();
      });
    });

    it('muestra "Sin datos disponibles" para estadistica sin datos', async () => {
      obtenerEstadisticas.mockResolvedValue([
        makeEstadistica('CATEGORIA', 'Vacia', 0),
      ]);
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getByText('Sin datos disponibles.')).toBeInTheDocument();
      });
    });
  });

  // ── Seleccion de grafico ─────────────────────────────────────────────────────

  describe('seleccion de grafico según cantidad de datos', () => {
    it('usa EstadisticaTorta cuando hay 5 datos o menos', async () => {
      obtenerEstadisticas.mockResolvedValue([
        makeEstadistica('CATEGORIA', 'Test', 5),
      ]);
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getByTestId('torta')).toBeInTheDocument();
        expect(screen.queryByTestId('barra')).not.toBeInTheDocument();
      });
    });

    it('usa EstadisticaBarra cuando hay más de 5 datos', async () => {
      obtenerEstadisticas.mockResolvedValue([
        makeEstadistica('CATEGORIA', 'Test', 6),
      ]);
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getByTestId('barra')).toBeInTheDocument();
        expect(screen.queryByTestId('torta')).not.toBeInTheDocument();
      });
    });

    it('usa Torta con 1 dato y Barra con 6 datos en la misma lista', async () => {
      obtenerEstadisticas.mockResolvedValue([
        makeEstadistica('CATEGORIA', 'Chica', 1),
        makeEstadistica('CATEGORIA', 'Grande', 6),
      ]);
      render(<Estadisticas />);
      await waitFor(() => {
        expect(screen.getByTestId('torta')).toBeInTheDocument();
        expect(screen.getByTestId('barra')).toBeInTheDocument();
      });
    });
  });

  // ── Descarga de CSV ──────────────────────────────────────────────────────────

  describe('descarga de CSV', () => {
    beforeEach(() => {
      // Mockeamos las APIs del DOM que usa handleDownload
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    it('deshabilita el boton mientras descarga', async () => {
      exportarEstadisticasCSV.mockReturnValue(new Promise(() => {}));
      render(<Estadisticas />);
      await waitFor(() => screen.getByText('Descargar CSV'));

      fireEvent.click(screen.getByText('Descargar CSV'));
      expect(screen.getByText('Generando CSV...')).toBeDisabled();
    });

    it('llama a exportarEstadisticasCSV al hacer click', async () => {
      exportarEstadisticasCSV.mockResolvedValue('col1,col2\nval1,val2');
      render(<Estadisticas />);
      await waitFor(() => screen.getByText('Descargar CSV'));

      fireEvent.click(screen.getByText('Descargar CSV'));
      await waitFor(() => {
        expect(exportarEstadisticasCSV).toHaveBeenCalledTimes(1);
      });
    });

    it('vuelve a habilitar el boton luego de descargar', async () => {
      exportarEstadisticasCSV.mockResolvedValue('col1,col2\nval1,val2');
      render(<Estadisticas />);
      await waitFor(() => screen.getByText('Descargar CSV'));

      fireEvent.click(screen.getByText('Descargar CSV'));
      await waitFor(() => {
        expect(screen.getByText('Descargar CSV')).not.toBeDisabled();
      });
    });

    it('muestra alerta si la descarga falla', async () => {
      window.alert = jest.fn();
      exportarEstadisticasCSV.mockRejectedValue(new Error('Fallo'));
      render(<Estadisticas />);
      await waitFor(() => screen.getByText('Descargar CSV'));

      fireEvent.click(screen.getByText('Descargar CSV'));
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'No pudimos generar el CSV. Intentá nuevamente.'
        );
      });
    });
  });
});