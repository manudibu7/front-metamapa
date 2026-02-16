import { render, screen, waitFor } from '@testing-library/react';
import { TableroHechos } from './TableroHechos';
import { useHechos } from '../../hooks/useHechos';
import { hechosService } from '../../services/hechosService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../hooks/useHechos', () => ({
  useHechos: jest.fn(),
}));

jest.mock('../../services/hechosService', () => ({
  hechosService: {
    obtenerCategorias: jest.fn(),
    obtenerProvincias: jest.fn(),
  },
}));

jest.mock('../FiltrosHechos/FiltrosHechos', () => ({
  FiltrosHechos: ({ categorias, provincias }) => (
    <div data-testid="filtros-hechos">
      <span data-testid="cant-categorias">{categorias.length}</span>
      <span data-testid="cant-provincias">{provincias.length}</span>
    </div>
  ),
}));

jest.mock('../MapaHechos/MapaHechos', () => ({
  MapaHechos: ({ hechos }) => (
    <div data-testid="mapa-hechos">
      <span data-testid="cant-hechos-mapa">{hechos.length}</span>
    </div>
  ),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const HECHOS_MOCK = [
  { id: 1, titulo: 'Hecho 1', lat: -34.6, lon: -58.4, ubicacion: { latitud: -34.6, longitud: -58.4 } },
  { id: 2, titulo: 'Hecho 2', lat: -31.4, lon: -64.2, ubicacion: { latitud: -31.4, longitud: -64.2 } },
];

const CATEGORIAS_MOCK = [{ nombre: 'Desastre Natural' }, { nombre: 'Incendio' }];
const PROVINCIAS_MOCK = [{ nombre: 'Buenos Aires' }, { nombre: 'Córdoba' }];

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  hechosService.obtenerCategorias.mockResolvedValue(CATEGORIAS_MOCK);
  hechosService.obtenerProvincias.mockResolvedValue(PROVINCIAS_MOCK);
  useHechos.mockReturnValue({ hechos: HECHOS_MOCK, cargando: false });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TableroHechos', () => {

  // ── Estado de carga ──────────────────────────────────────────────────────────

  describe('estado de carga', () => {
    it('muestra el loader mientras cargando es true', () => {
      useHechos.mockReturnValue({ hechos: null, cargando: true });
      render(<TableroHechos />);
      expect(screen.getByText('Cargando hechos...')).toBeInTheDocument();
      expect(screen.queryByTestId('mapa-hechos')).not.toBeInTheDocument();
    });

    it('oculta el loader y muestra el mapa cuando termina de cargar', () => {
      render(<TableroHechos />);
      expect(screen.queryByText('Cargando hechos...')).not.toBeInTheDocument();
      expect(screen.getByTestId('mapa-hechos')).toBeInTheDocument();
    });
  });

  // ── Resumen de hechos ────────────────────────────────────────────────────────

  describe('resumen', () => {
    it('muestra el total de hechos en vista', async () => {
      render(<TableroHechos />);
      await waitFor(() => {
        // Buscamos el span del resumen que está junto a "hechos en vista"
        const spanTotal = screen.getByText('hechos en vista').previousElementSibling;
        expect(spanTotal.textContent).toBe('2');
      });
    });

    it('muestra 0 hechos cuando la lista está vacía', () => {
      useHechos.mockReturnValue({ hechos: [], cargando: false });
      render(<TableroHechos />);
      expect(screen.getByText('hechos en vista')).toBeInTheDocument();
    });

    it('muestra las etiquetas de categorías y provincias visibles', async () => {
      render(<TableroHechos />);
      await waitFor(() => {
        expect(screen.getByText('categorías visibles')).toBeInTheDocument();
        expect(screen.getByText('provincias visibles')).toBeInTheDocument();
      });
    });
  });

  describe('compatibilidad de formatos de hechos', () => {
    it('maneja el formato paginado con .content', () => {
      useHechos.mockReturnValue({
        hechos: { content: HECHOS_MOCK, totalPages: 1, totalElements: 2 },
        cargando: false,
      });
      render(<TableroHechos />);
      // El mapa recibe los 2 hechos extraídos de .content
      expect(screen.getByTestId('cant-hechos-mapa').textContent).toBe('2');
    });

    it('maneja el formato de array directo', () => {
      useHechos.mockReturnValue({ hechos: HECHOS_MOCK, cargando: false });
      render(<TableroHechos />);
      expect(screen.getByTestId('cant-hechos-mapa').textContent).toBe('2');
    });

    it('maneja hechos null sin romper', () => {
      useHechos.mockReturnValue({ hechos: null, cargando: false });
      expect(() => render(<TableroHechos />)).not.toThrow();
      expect(screen.getByTestId('cant-hechos-mapa').textContent).toBe('0');
    });
  });

  describe('carga de categorías y provincias', () => {
    it('llama a obtenerCategorias y obtenerProvincias al montar', async () => {
      render(<TableroHechos />);
      await waitFor(() => {
        expect(hechosService.obtenerCategorias).toHaveBeenCalledTimes(1);
        expect(hechosService.obtenerProvincias).toHaveBeenCalledTimes(1);
      });
    });

    it('pasa las categorías cargadas a FiltrosHechos', async () => {
      render(<TableroHechos />);
      await waitFor(() => {
        expect(screen.getByTestId('cant-categorias').textContent).toBe('2');
      });
    });

    it('pasa las provincias cargadas a FiltrosHechos', async () => {
      render(<TableroHechos />);
      await waitFor(() => {
        expect(screen.getByTestId('cant-provincias').textContent).toBe('2');
      });
    });

    it('maneja categorías que vienen como strings en lugar de objetos', async () => {
      hechosService.obtenerCategorias.mockResolvedValue(['Desastre Natural', 'Incendio']);
      render(<TableroHechos />);
      await waitFor(() => {
        expect(screen.getByTestId('cant-categorias').textContent).toBe('2');
      });
    });
  });
});