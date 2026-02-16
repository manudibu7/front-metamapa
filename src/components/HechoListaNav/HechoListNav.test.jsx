import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Al principio del test, antes de los otros imports
jest.mock('../../services/hechosService', () => ({
  hechosService: {
    listarHechos: jest.fn(),
    obtenerCategorias: jest.fn(),
    obtenerProvincias: jest.fn(),
  },
}));
import { HechosListNav } from './HechoListNav';
import { useQuery } from '@apollo/client';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  gql: (query) => query,
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(),
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
    ubicacion: { provincia: 'Buenos Aires' },
  },
  {
    id_hecho: 2,
    titulo: 'Incendio forestal',
    descripcion: 'Descripción del hecho 2',
    categoria: 'Incendio',
    fecha: '2024-02-20',
    fuente: 'dinamica',
    ubicacion: { provincia: 'Córdoba' },
  },
];

const CATEGORIAS_MOCK = [{ nombre: 'Desastre Natural' }, { nombre: 'Incendio' }];
const PROVINCIAS_MOCK = [{ nombre: 'Buenos Aires' }, { nombre: 'Córdoba' }];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Configura useSearchParams con los parámetros indicados.
 * Devuelve el spy de setSearchParams para poder hacer aserciones sobre él.
 */
function mockSearchParams(params = {}) {
  const setSearchParams = jest.fn();
  useSearchParams.mockReturnValue([new URLSearchParams(params), setSearchParams]);
  return setSearchParams;
}

/**
 * Configura useQuery para devolver distintas respuestas según la query recibida.
 * Acepta overrides parciales para el resultado de GET_HECHOS_FILTRADOS.
 */
function mockUseQuery({ hechosOverride = {}, loading = false, error = undefined } = {}) {
  useQuery.mockImplementation((query) => {
    const queryStr = String(query);

    if (queryStr.includes('GET_CATEGORIAS') || queryStr.includes('listarCategorias')) {
      return { data: { listarCategorias: CATEGORIAS_MOCK } };
    }
    if (queryStr.includes('GET_PROVINCIAS') || queryStr.includes('listarProvincias')) {
      return { data: { listarProvincias: PROVINCIAS_MOCK } };
    }

    // GET_HECHOS_FILTRADOS — respuesta por defecto con posibilidad de override
    return {
      loading,
      error,
      data: {
        listarHechosSegun: {
          content: HECHOS_MOCK,
          totalPages: 3,
          totalElements: 25,
          ...hechosOverride,
        },
      },
      ...hechosOverride,
    };
  });
}


beforeEach(() => {
  jest.clearAllMocks();
  useNavigate.mockReturnValue(jest.fn());
  mockSearchParams();
  mockUseQuery();
});


// ─── Tests ────────────────────────────────────────────────────────────────────

describe('HechosListNav', () => {

  // ── Estados de carga y error ─────────────────────────────────────────────────

  describe('estados de carga y error', () => {
    it('muestra "Cargando..." mientras se obtienen los datos', () => {
      mockUseQuery({ loading: true });
      render(<HechosListNav />);
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('muestra el mensaje de error cuando falla la query', () => {
      mockUseQuery({ error: { message: 'Error de red' } });
      render(<HechosListNav />);
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
  });

  // ── Paginación ───────────────────────────────────────────────────────────────

  describe('paginación', () => {
    it('muestra los botones Anterior y Siguiente cuando hay más de una página', () => {
      render(<HechosListNav />);
      expect(screen.getByText('Anterior')).toBeInTheDocument();
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    it('el botón Anterior está deshabilitado en la primera página', () => {
      render(<HechosListNav />);
      expect(screen.getByText('Anterior')).toBeDisabled();
    });

    it('el botón Siguiente está habilitado cuando no es la última página', () => {
      render(<HechosListNav />);
      expect(screen.getByText('Siguiente')).not.toBeDisabled();
    });

    it('avanza a la siguiente página al hacer click en Siguiente', () => {
      render(<HechosListNav />);
      fireEvent.click(screen.getByText('Siguiente'));
      // Tras avanzar, el botón Anterior debe habilitarse
      expect(screen.getByText('Anterior')).not.toBeDisabled();
    });

    it('no muestra la paginación si solo hay una página', () => {
      mockUseQuery({ hechosOverride: { totalPages: 1 } });
      render(<HechosListNav />);
      expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
      expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();
    });
  });

  // ── Panel de filtros ─────────────────────────────────────────────────────────

  describe('panel de filtros', () => {
    it('abre el panel al hacer click en "Filtros Avanzados"', () => {
      render(<HechosListNav />);
      fireEvent.click(screen.getByText('🔍 Filtros Avanzados'));
      expect(screen.getByText('Filtros Avanzados', { selector: 'h2' })).toBeInTheDocument();
    });

    it('cierra el panel al hacer click en el botón ✕', () => {
      render(<HechosListNav />);
      fireEvent.click(screen.getByText('🔍 Filtros Avanzados'));
      fireEvent.click(screen.getByText('✕'));
      expect(screen.queryByRole('heading', { name: 'Filtros Avanzados' })).not.toBeInTheDocument();
    });

    it('cierra el panel al hacer click en Cancelar', () => {
      render(<HechosListNav />);
      fireEvent.click(screen.getByText('🔍 Filtros Avanzados'));
      fireEvent.click(screen.getByText('Cancelar'));
      expect(screen.queryByRole('heading', { name: 'Filtros Avanzados' })).not.toBeInTheDocument();
    });

    it('muestra las categorías y provincias en los selectores', () => {
      render(<HechosListNav />);
      fireEvent.click(screen.getByText('🔍 Filtros Avanzados'));

      expect(screen.getByRole('option', { name: 'Desastre Natural' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Incendio' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Buenos Aires' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Córdoba' })).toBeInTheDocument();
    });

    it('aplica los filtros y cierra el panel al hacer click en Filtrar', () => {
      const setSearchParams = mockSearchParams();
      render(<HechosListNav />);

      fireEvent.click(screen.getByText('🔍 Filtros Avanzados'));

      // Usamos getByRole('textbox') porque el label no tiene for/id asociado
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'inundación' },
      });

      fireEvent.click(screen.getByText('Filtrar'));

      expect(setSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'inundación' })
      );
      expect(screen.queryByRole('heading', { name: 'Filtros Avanzados' })).not.toBeInTheDocument();
    });

    it('no incluye campos vacíos al aplicar filtros', () => {
      const setSearchParams = mockSearchParams();
      render(<HechosListNav />);

      fireEvent.click(screen.getByText('🔍 Filtros Avanzados'));
      // No completamos ningún campo y aplicamos
      fireEvent.click(screen.getByText('Filtrar'));

      // setSearchParams debe recibir un objeto vacío (sin claves con valor vacío)
      expect(setSearchParams).toHaveBeenCalledWith({});
    });

    it('limpia los filtros temporales al hacer click en Limpiar (dentro del panel)', () => {
      render(<HechosListNav />);
      fireEvent.click(screen.getByText('🔍 Filtros Avanzados'));

      const inputTitulo = screen.getByRole('textbox');

      fireEvent.change(inputTitulo, {
        target: { value: 'algo' },
      });
      expect(inputTitulo).toHaveValue('algo');

      fireEvent.click(screen.getByText('Limpiar'));

      expect(inputTitulo).toHaveValue('');
    });
  });
});