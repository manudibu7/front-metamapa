import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GestionRevisiones } from './GestionRevisiones';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  listarPendientes,
  aceptarRevision,
  aceptarConCambios,
  rechazarRevision,
} from '../../services/revisionesService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/revisionesService', () => ({
  listarPendientes: jest.fn(),
  aceptarRevision: jest.fn(),
  aceptarConCambios: jest.fn(),
  rechazarRevision: jest.fn(),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const PENDIENTE_1 = {
  idContribucion: 101,
  anonimo: false,
  nombreContribuyente: 'Juan Perez',
  hecho: {
    titulo: 'Inundacion en el sur',
    descripcion: 'Graves inundaciones',
    fecha: '2024-01-15',
    categoria: 'Desastre Natural',
    tipoDeHecho: 'NATURAL',
    ubicacion: { latitud: -34.6, longitud: -58.4 },
    adjuntos: [],
  },
};

const PENDIENTE_2 = {
  idContribucion: 202,
  anonimo: true,
  nombreContribuyente: null,
  hecho: {
    titulo: 'Incendio forestal',
    descripcion: 'Incendio de magnitud',
    fecha: '2024-02-20',
    categoria: 'Incendio',
    tipoDeHecho: 'AMBIENTAL',
    ubicacion: { latitud: -31.4, longitud: -64.2 },
    adjuntos: [{ nombre: 'foto.jpg' }],
  },
};

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.useFakeTimers();
  window.alert = jest.fn();

  useNavigate.mockReturnValue(jest.fn());
  useAuth.mockReturnValue({ isAdmin: true, contribuyenteId: 99 });

  listarPendientes.mockResolvedValue([PENDIENTE_1, PENDIENTE_2]);
  aceptarRevision.mockResolvedValue(null);
  aceptarConCambios.mockResolvedValue(null);
  rechazarRevision.mockResolvedValue(null);
});

afterEach(() => {
  jest.useRealTimers();
  console.error.mockRestore();
  console.log.mockRestore();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GestionRevisiones', () => {

  // ── Acceso y redireccion ─────────────────────────────────────────────────────

  describe('acceso y redireccion', () => {
    it('redirige a "/" si el usuario no es admin', async () => {
      const navigate = jest.fn();
      useNavigate.mockReturnValue(navigate);
      useAuth.mockReturnValue({ isAdmin: false, contribuyenteId: null });

      render(<GestionRevisiones />);

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/');
      });
    });

    it('no redirige si el usuario es admin', async () => {
      const navigate = jest.fn();
      useNavigate.mockReturnValue(navigate);

      render(<GestionRevisiones />);

      await waitFor(() => {
        expect(navigate).not.toHaveBeenCalledWith('/');
      });
    });
  });

  // ── Lista de revisiones ──────────────────────────────────────────────────────

  describe('lista de revisiones', () => {
    it('renderiza una card por cada pendiente', async () => {
      render(<GestionRevisiones />);
      await waitFor(() => {
        // Buscamos por los titulos de los hechos — cada uno aparece en su card
        expect(screen.getByText('Inundacion en el sur')).toBeInTheDocument();
        expect(screen.getByText('Incendio forestal')).toBeInTheDocument();
      });
    });

    it('muestra el nombre del contribuyente si no es anonimo', async () => {
      render(<GestionRevisiones />);
      await waitFor(() => {
        expect(screen.getByText(/Juan Perez/)).toBeInTheDocument();
      });
    });

    it('muestra texto anonimo si la contribucion es anonima', async () => {
      render(<GestionRevisiones />);
      await waitFor(() => {
        expect(screen.getByText(/ANONIMA/)).toBeInTheDocument();
      });
    });

    it('muestra la cantidad de adjuntos cuando los hay', async () => {
      render(<GestionRevisiones />);
      await waitFor(() => {
        expect(screen.getByText(/1 adjunto/)).toBeInTheDocument();
      });
    });

    it('no muestra adjuntos cuando la lista esta vacia', async () => {
      listarPendientes.mockResolvedValue([PENDIENTE_1]);
      render(<GestionRevisiones />);
      await waitFor(() => {
        expect(screen.queryByText(/adjunto/)).not.toBeInTheDocument();
      });
    });

    it('navega al detalle al hacer click en el hecho', async () => {
      const navigate = jest.fn();
      useNavigate.mockReturnValue(navigate);
      render(<GestionRevisiones />);
      await waitFor(() => screen.getByText('Inundacion en el sur'));
      fireEvent.click(screen.getByText('Inundacion en el sur'));
      expect(navigate).toHaveBeenCalledWith(
        '/admin/revisiones/detalle',
        expect.objectContaining({ state: { hecho: PENDIENTE_1.hecho } })
      );
    });
  });

  // ── Acciones sobre revisiones ────────────────────────────────────────────────

  describe('acciones sobre revisiones', () => {
    // Helper: renderiza y espera a que carguen los datos
    const setup = async () => {
      render(<GestionRevisiones />);
      await waitFor(() => screen.getByText('Inundacion en el sur'));
    };

    it('llama a aceptarRevision con id y contribuyenteId al aceptar', async () => {
      await setup();
      fireEvent.click(screen.getAllByText('✅ Aceptar')[0]);
      await waitFor(() => {
        expect(aceptarRevision).toHaveBeenCalledWith(101, '', 99);
      });
    });

    it('llama a aceptarConCambios con el comentario ingresado', async () => {
      await setup();
      // Escribimos en el textarea de la primera card
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: 'Revisar la fecha' },
      });
      fireEvent.click(screen.getAllByText('⚠️ Con cambios')[0]);
      await waitFor(() => {
        expect(aceptarConCambios).toHaveBeenCalledWith(101, 'Revisar la fecha', 99);
      });
    });

    it('llama a rechazarRevision al rechazar', async () => {
      await setup();
      fireEvent.click(screen.getAllByText('❌ Rechazar')[0]);
      await waitFor(() => {
        expect(rechazarRevision).toHaveBeenCalledWith(101, '', 99);
      });
    });

    it('elimina la card de la lista tras aceptar', async () => {
      await setup();
      fireEvent.click(screen.getAllByText('✅ Aceptar')[0]);
      await waitFor(() => {
        expect(screen.queryByText('Inundacion en el sur')).not.toBeInTheDocument();
        // La segunda card sigue visible
        expect(screen.getByText('Incendio forestal')).toBeInTheDocument();
      });
    });

    it('elimina la card de la lista tras rechazar', async () => {
      await setup();
      fireEvent.click(screen.getAllByText('❌ Rechazar')[0]);
      await waitFor(() => {
        expect(screen.queryByText('Inundacion en el sur')).not.toBeInTheDocument();
      });
    });

    it('deshabilita los botones mientras se procesa una accion', async () => {
      aceptarRevision.mockReturnValue(new Promise(() => {}));
      await setup();
      fireEvent.click(screen.getAllByText('✅ Aceptar')[0]);
      // Los botones de esa card quedan deshabilitados
      expect(screen.getAllByText('✅ Aceptar')[0]).toBeDisabled();
      expect(screen.getAllByText('⚠️ Con cambios')[0]).toBeDisabled();
      expect(screen.getAllByText('❌ Rechazar')[0]).toBeDisabled();
    });

    it('muestra alerta si falla el procesamiento', async () => {
      aceptarRevision.mockRejectedValue(new Error('Error'));
      await setup();
      fireEvent.click(screen.getAllByText('✅ Aceptar')[0]);
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Ocurrió un error al procesar la solicitud.');
      });
    });
  });
});