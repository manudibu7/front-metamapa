import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GestionColecciones } from './GestionColecciones';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  obtenerColeccionesAdmin,
  crearColeccion,
  actualizarColeccion,
  eliminarColeccion,
  obtenerFuentes,
} from '../../services/coleccionesAdminService';
import { getCategorias } from '../../services/contribucionesService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }));

jest.mock('../../services/coleccionesAdminService', () => ({
  obtenerColeccionesAdmin: jest.fn(),
  crearColeccion: jest.fn(),
  actualizarColeccion: jest.fn(),
  eliminarColeccion: jest.fn(),
  obtenerFuentes: jest.fn(),
}));

jest.mock('../../services/contribucionesService', () => ({
  getCategorias: jest.fn(),
}));

// Sub-componentes mockeados con la informacion minima que necesitamos testear
jest.mock('./CollectionCard', () => ({
  CollectionCard: ({ col, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId, loadingDelete }) => (
    <div data-testid={`card-${col.id_coleccion}`}>
      <span>{col.titulo}</span>
      <button onClick={() => onEdit(col)}>Editar {col.titulo}</button>
      <button onClick={() => setConfirmDeleteId(col.id_coleccion)}>Eliminar {col.titulo}</button>
      {confirmDeleteId === col.id_coleccion && (
        <button onClick={() => onDelete(col.id_coleccion)} disabled={loadingDelete}>
          Confirmar eliminacion
        </button>
      )}
    </div>
  ),
}));

jest.mock('./CollectionForm', () => ({
  CollectionForm: ({ form, setForm, onSubmit, onCancel, submitting, errorMsg }) => (
    <form data-testid="collection-form" onSubmit={onSubmit}>
      <input
        data-testid="input-titulo"
        value={form.titulo}
        onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
      />
      <input
        data-testid="input-descripcion"
        value={form.descripcion}
        onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
      />
      {errorMsg && <p data-testid="form-error">{errorMsg}</p>}
      <button type="submit" disabled={submitting}>Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  ),
}));

jest.mock('./SuccessPopup', () => ({
  SuccessPopup: ({ open, summaryData, onClose }) =>
    open ? (
      <div data-testid="success-popup">
        <span data-testid="popup-type">{summaryData?.type}</span>
        <button onClick={onClose}>Cerrar popup</button>
      </div>
    ) : null,
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const COLECCIONES_MOCK = [
  {
    id_coleccion: 1,
    titulo: 'Colección Alfa',
    descripcion: 'Descripción Alfa',
    fuentes: ['fuenteA'],
    criterios: [],
    algoritmoConcenso: 'PROMEDIO',
  },
  {
    id_coleccion: 2,
    titulo: 'Colección Beta',
    descripcion: 'Descripción Beta',
    fuentes: ['fuenteB'],
    criterios: [],
    algoritmoConcenso: 'MAYORIA',
  },
];

const FUENTES_MOCK = [
  { nombre: 'fuenteA', tipoFuente: 'estatica' },
  { nombre: 'fuenteB', tipoFuente: 'dinamica' },
];

const CATEGORIAS_MOCK = [{ nombre: 'Desastre Natural' }, { nombre: 'Incendio' }];

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  window.alert = jest.fn();

  useNavigate.mockReturnValue(jest.fn());
  useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true });

  obtenerColeccionesAdmin.mockResolvedValue(COLECCIONES_MOCK);
  obtenerFuentes.mockResolvedValue(FUENTES_MOCK);
  getCategorias.mockResolvedValue(CATEGORIAS_MOCK);
  crearColeccion.mockResolvedValue({ id_coleccion: 3, titulo: 'Nueva', descripcion: 'Desc' });
  actualizarColeccion.mockResolvedValue(null);
  eliminarColeccion.mockResolvedValue(null);
});

afterEach(() => {
  console.error.mockRestore();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GestionColecciones', () => {

  // ── Acceso y autenticacion ───────────────────────────────────────────────────

  describe('acceso y autenticacion', () => {
    it('muestra pantalla de acceso restringido si no es admin', () => {
      useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false });
      render(<GestionColecciones />);
      expect(screen.getByText('Acceso restringido')).toBeInTheDocument();
    });

    it('muestra pantalla de acceso restringido si no esta autenticado', () => {
      useAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false });
      render(<GestionColecciones />);
      expect(screen.getByText('Acceso restringido')).toBeInTheDocument();
    });

    it('navega al inicio al hacer click en Volver al inicio desde acceso restringido', () => {
      const navigate = jest.fn();
      useNavigate.mockReturnValue(navigate);
      useAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false });
      render(<GestionColecciones />);
      fireEvent.click(screen.getByText('Volver al inicio'));
      expect(navigate).toHaveBeenCalledWith('/');
    });
  });

  // ── Estados de carga y error ─────────────────────────────────────────────────

  describe('estados de carga y error', () => {
    it('muestra el loader mientras carga', () => {
      obtenerColeccionesAdmin.mockReturnValue(new Promise(() => {}));
      render(<GestionColecciones />);
      expect(screen.getByText('Cargando colecciones...')).toBeInTheDocument();
    });

    it('muestra error si falla la carga de colecciones', async () => {
      obtenerColeccionesAdmin.mockRejectedValue(new Error('Error de red'));
      render(<GestionColecciones />);
      await waitFor(() => {
        expect(screen.getByText('No pudimos cargar las colecciones.')).toBeInTheDocument();
      });
    });
  });

  // ── Modal de creacion ────────────────────────────────────────────────────────

  describe('modal de creacion', () => {
    it('abre el modal al hacer click en "Crear nueva colección"', async () => {
      render(<GestionColecciones />);
      await waitFor(() => screen.getByText('Crear nueva colección'));
      fireEvent.click(screen.getByText('Crear nueva colección'));
      expect(screen.getByRole('heading', { name: 'Nueva colección', level: 2 })).toBeInTheDocument();
    });

    it('cierra el modal al hacer click en Cancelar', async () => {
      render(<GestionColecciones />);
      await waitFor(() => screen.getByText('Crear nueva colección'));
      fireEvent.click(screen.getByText('Crear nueva colección'));
      fireEvent.click(screen.getByText('Cancelar'));
      expect(screen.queryByRole('heading', { name: 'Nueva colección', level: 2 })).not.toBeInTheDocument();
    });

    it('cierra el modal al hacer click en el overlay', async () => {
      render(<GestionColecciones />);
      await waitFor(() => screen.getByText('Crear nueva colección'));
      fireEvent.click(screen.getByText('Crear nueva colección'));
      fireEvent.click(document.querySelector('.gestion-colecciones__modal-overlay'));
      expect(screen.queryByTestId('collection-form')).not.toBeInTheDocument();
    });
  });

  // ── Modal de edicion ─────────────────────────────────────────────────────────

  describe('modal de edicion', () => {
    it('abre el modal de edicion con titulo correcto al hacer click en Editar', async () => {
      render(<GestionColecciones />);
      await waitFor(() => screen.getByText('Editar Colección Alfa'));
      fireEvent.click(screen.getByText('Editar Colección Alfa'));
      expect(screen.getByRole('heading', { name: 'Editar colección', level: 2 })).toBeInTheDocument();
    });

    it('pre-carga el titulo de la coleccion en el formulario de edicion', async () => {
      render(<GestionColecciones />);
      await waitFor(() => screen.getByText('Editar Colección Alfa'));
      fireEvent.click(screen.getByText('Editar Colección Alfa'));
      expect(screen.getByTestId('input-titulo')).toHaveValue('Colección Alfa');
    });
  });

  describe('validaciones del formulario', () => {
    const abrirModal = async () => {
      render(<GestionColecciones />);
      await waitFor(() => screen.getByText('Crear nueva colección'));
      fireEvent.click(screen.getByText('Crear nueva colección'));
    };

    it('muestra error si el titulo esta vacio al guardar', async () => {
      await abrirModal();
      fireEvent.click(screen.getByText('Guardar'));
      expect(screen.getByTestId('form-error')).toHaveTextContent('El título es obligatorio.');
    });

    it('muestra error si la descripcion esta vacia al guardar', async () => {
      await abrirModal();
      fireEvent.change(screen.getByTestId('input-titulo'), { target: { value: 'Título válido' } });
      fireEvent.click(screen.getByText('Guardar'));
      expect(screen.getByTestId('form-error')).toHaveTextContent('La descripcion es obligatoria.');
    });
  });

  describe("creacion de coleccion", () => {
    it("muestra error de fuentes si titulo y descripcion son validos pero no hay fuentes", async () => {
      render(<GestionColecciones />);
      await waitFor(() => screen.getByText("Crear nueva colección"));
      fireEvent.click(screen.getByText("Crear nueva colección"));
      fireEvent.change(screen.getByTestId("input-titulo"), { target: { value: "Título válido" } });
      fireEvent.change(screen.getByTestId("input-descripcion"), { target: { value: "Descripción válida" } });
      fireEvent.click(screen.getByText("Guardar"));
      expect(screen.getByTestId("form-error")).toHaveTextContent("Tiene que tener al menos una fuente");
    });

    it("no llama a crearColeccion si el formulario tiene errores de validacion", async () => {
      render(<GestionColecciones />);
      await waitFor(() => screen.getByText("Crear nueva colección"));
      fireEvent.click(screen.getByText("Crear nueva colección"));
      fireEvent.click(screen.getByText("Guardar"));
      expect(crearColeccion).not.toHaveBeenCalled();
    });
  });

  // ── Eliminacion de coleccion ─────────────────────────────────────────────────

  describe('eliminacion de coleccion', () => {
    
    it('elimina la card de la lista tras confirmar la eliminacion', async () => {
      // Primera llamada devuelve las dos, la segunda (background refresh) devuelve solo la que queda
      obtenerColeccionesAdmin
        .mockResolvedValueOnce(COLECCIONES_MOCK)
        .mockResolvedValueOnce([COLECCIONES_MOCK[1]]);

      render(<GestionColecciones />);
      await waitFor(() => screen.getByTestId('card-1'));
      fireEvent.click(screen.getByText('Eliminar Colección Alfa'));
      fireEvent.click(screen.getByText('Confirmar eliminacion'));
      await waitFor(() => {
        expect(screen.queryByTestId('card-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('card-2')).toBeInTheDocument();
      });
    });

    it('muestra alerta si falla la eliminacion', async () => {
      eliminarColeccion.mockRejectedValue(new Error('Fallo'));
      render(<GestionColecciones />);
      await waitFor(() => screen.getByText('Eliminar Colección Alfa'));
      fireEvent.click(screen.getByText('Eliminar Colección Alfa'));
      fireEvent.click(screen.getByText('Confirmar eliminacion'));
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('No pudimos eliminar la colección.');
      });
    });
  });
});