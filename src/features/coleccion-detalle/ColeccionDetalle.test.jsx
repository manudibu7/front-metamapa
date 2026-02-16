import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ColeccionDetalle } from './ColeccionDetalle';
import { collectionsService } from '../../services/collectionsService';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useNavigation } from '../../context/NavigationContext';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('../../context/NavigationContext', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../services/collectionsService', () => ({
  collectionsService: {
    getHechosDeColeccion: jest.fn(),
  },
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="mapa">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children, eventHandlers }) => (
    <div data-testid="marker" onClick={eventHandlers?.click}>{children}</div>
  ),
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
}));

jest.mock('leaflet', () => ({
  icon: jest.fn(() => ({})),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const HECHOS_MOCK = [
  {
    id_hecho: 1,
    titulo: 'Inundación en el sur',
    descripcion: 'Descripción del hecho 1',
    categoria: 'Desastre Natural',
    fecha: '2024-01-15',
    fuente: 'estatica',
    ubicacion: { provincia: 'Buenos Aires', latitud: -34.6, longitud: -58.4 },
  },
  {
    id_hecho: 2,
    titulo: 'Incendio forestal',
    descripcion: 'Descripción del hecho 2',
    categoria: 'Incendio',
    fecha: '2024-02-20',
    fuente: 'dinamica',
    ubicacion: { provincia: 'Córdoba', latitud: -31.4, longitud: -64.2 },
  },
];

const COLECCION_MOCK = {
  titulo: 'Colección de prueba',
  descripcion: 'Descripción de la colección',
  hechos: HECHOS_MOCK,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockSearchParams(params = {}) {
  const setSearchParams = jest.fn();
  useSearchParams.mockReturnValue([new URLSearchParams(params), setSearchParams]);
  return setSearchParams;
}

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  useParams.mockReturnValue({ id: '42' });
  useNavigate.mockReturnValue(jest.fn());
  useNavigation.mockReturnValue({ modoNavegacion: 'curado' });
  mockSearchParams();
  collectionsService.getHechosDeColeccion.mockResolvedValue({ data: COLECCION_MOCK });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ColeccionDetalle', () => {

  // ── Estados de carga y error ─────────────────────────────────────────────────

  describe('estados de carga y error', () => {
    it('muestra el loader mientras carga', () => {
      collectionsService.getHechosDeColeccion.mockReturnValue(new Promise(() => {}));
      render(<ColeccionDetalle />);
      expect(screen.getByText('Cargando colección...')).toBeInTheDocument();
    });

    it('muestra error cuando la coleccion no se encuentra', async () => {
      collectionsService.getHechosDeColeccion.mockRejectedValue(new Error('No encontrado'));
      render(<ColeccionDetalle />);
      await waitFor(() => {
        expect(screen.getByText('No se encontró la colección')).toBeInTheDocument();
      });
    });

    it('muestra boton para volver cuando no hay coleccion', async () => {
      collectionsService.getHechosDeColeccion.mockRejectedValue(new Error('Error'));
      render(<ColeccionDetalle />);
      await waitFor(() => {
        expect(screen.getByText('Volver a colecciones')).toBeInTheDocument();
      });
    });
  });

  // ── Llamada al servicio ──────────────────────────────────────────────────────

  describe('llamada al servicio', () => {
    it('llama a getHechosDeColeccion con el id correcto', async () => {
      render(<ColeccionDetalle />);
      await waitFor(() => {
        expect(collectionsService.getHechosDeColeccion).toHaveBeenCalledWith(
          '42',
          expect.objectContaining({ modoNavegacion: 'curado' })
        );
      });
    });

    it('vuelve a llamar al servicio cuando cambia modoNavegacion', async () => {
      const { rerender } = render(<ColeccionDetalle />);
      await waitFor(() => expect(collectionsService.getHechosDeColeccion).toHaveBeenCalledTimes(1));

      useNavigation.mockReturnValue({ modoNavegacion: 'exploratorio' });
      rerender(<ColeccionDetalle />);

      await waitFor(() => {
        expect(collectionsService.getHechosDeColeccion).toHaveBeenCalledTimes(2);
        expect(collectionsService.getHechosDeColeccion).toHaveBeenLastCalledWith(
          '42',
          expect.objectContaining({ modoNavegacion: 'exploratorio' })
        );
      });
    });
  });

  // ── Interaccion con cards ─────────────────────────────────────────────────────

  describe('interaccion con cards', () => {
    it('marca la card como selected al hacer hover', async () => {
      render(<ColeccionDetalle />);
      await waitFor(() => screen.getByRole('heading', { name: 'Inundación en el sur', level: 3 }));
      const card = screen.getByRole('heading', { name: 'Inundación en el sur', level: 3 }).closest('article');
      fireEvent.mouseEnter(card);
      expect(card).toHaveClass('hecho-card--selected');
    });

    it('desmarca la card al salir el mouse', async () => {
      render(<ColeccionDetalle />);
      await waitFor(() => screen.getByRole('heading', { name: 'Inundación en el sur', level: 3 }));
      const card = screen.getByRole('heading', { name: 'Inundación en el sur', level: 3 }).closest('article');
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      expect(card).not.toHaveClass('hecho-card--selected');
    });
  });

  // ── Panel de filtros ─────────────────────────────────────────────────────────

  describe('panel de filtros', () => {
    it('llama a setSearchParams con objeto vacio al limpiar', async () => {
      const setSearchParams = mockSearchParams({ q: 'algo' });
      render(<ColeccionDetalle />);
      await waitFor(() => screen.getByText('🔍 Filtros'));
      fireEvent.click(screen.getByText('🔍 Filtros'));
      fireEvent.click(screen.getByText('Limpiar'));
      expect(setSearchParams).toHaveBeenCalledWith({});
    });

    it('aplica filtros y cierra el panel al hacer click en Filtrar', async () => {
      const setSearchParams = mockSearchParams();
      render(<ColeccionDetalle />);
      await waitFor(() => screen.getByText('🔍 Filtros'));
      fireEvent.click(screen.getByText('🔍 Filtros'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'inundación' } });
      fireEvent.click(screen.getByText('Filtrar'));
      expect(setSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'inundación' })
      );
      expect(screen.queryByRole('heading', { name: 'Filtros' })).not.toBeInTheDocument();
    });

    it('no incluye campos vacios al aplicar filtros', async () => {
      const setSearchParams = mockSearchParams();
      render(<ColeccionDetalle />);
      await waitFor(() => screen.getByText('🔍 Filtros'));
      fireEvent.click(screen.getByText('🔍 Filtros'));
      fireEvent.click(screen.getByText('Filtrar'));
      expect(setSearchParams).toHaveBeenCalledWith({});
    });

    it('muestra las categorias de los hechos como opciones', async () => {
      render(<ColeccionDetalle />);
      await waitFor(() => screen.getByText('🔍 Filtros'));
      fireEvent.click(screen.getByText('🔍 Filtros'));
      expect(screen.getByRole('option', { name: 'Desastre Natural' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Incendio' })).toBeInTheDocument();
    });

    it('muestra las provincias unicas de los hechos como opciones', async () => {
      render(<ColeccionDetalle />);
      await waitFor(() => screen.getByText('🔍 Filtros'));
      fireEvent.click(screen.getByText('🔍 Filtros'));
      expect(screen.getByRole('option', { name: 'Buenos Aires' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Córdoba' })).toBeInTheDocument();
    });
  });
});