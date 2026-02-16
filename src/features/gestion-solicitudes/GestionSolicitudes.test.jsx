import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GestionSolicitudes } from './GestionSolicitudes';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  obtenerSolicitudes,
  actualizarEstadoSolicitud,
  eliminarSolicitud,
} from '../../services/solicitudesService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/solicitudesService', () => ({
  obtenerSolicitudes: jest.fn(),
  actualizarEstadoSolicitud: jest.fn(),
  eliminarSolicitud: jest.fn(),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const SOLICITUD_1 = {
  id_solicitud: 10,
  estadoSolicitud: 'PENDIENTE',
  motivo: 'Informacion incorrecta',
  fechaSolicitud: '2024-03-01T10:00:00Z',
  hecho: {
    id_hecho: 55,
    titulo: 'Inundacion en el sur',
    descripcion: 'Graves inundaciones',
    fecha: '2024-01-15',
    fuente: 'estatica',
    ubicacion: { provincia: 'Buenos Aires', pais: 'Argentina' },
  },
};

const SOLICITUD_2 = {
  id_solicitud: 20,
  estadoSolicitud: 'PENDIENTE',
  motivo: 'Datos duplicados',
  fechaSolicitud: '2024-03-05T12:00:00Z',
  hecho: {
    id_hecho: 66,
    titulo: 'Incendio forestal',
    descripcion: 'Incendio de magnitud',
    fecha: '2024-02-20',
    fuente: 'dinamica',
    ubicacion: { provincia: 'Cordoba', pais: 'Argentina' },
  },
};

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true); // Por defecto confirma los dialogs

  useNavigate.mockReturnValue(jest.fn());
  useAuth.mockReturnValue({ isAdmin: true });

  obtenerSolicitudes.mockResolvedValue([SOLICITUD_1, SOLICITUD_2]);
  actualizarEstadoSolicitud.mockResolvedValue(null);
  eliminarSolicitud.mockResolvedValue(null);
});

afterEach(() => {
  console.error.mockRestore();
  console.log.mockRestore();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GestionSolicitudes', () => {

  // ── Estado de carga y error ──────────────────────────────────────────────────

  describe('estado de carga y error', () => {
    it('muestra el loader mientras carga', () => {
      obtenerSolicitudes.mockReturnValue(new Promise(() => {}));
      render(<GestionSolicitudes />);
      expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument();
    });

    it('oculta el loader cuando los datos cargan', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => {
        expect(screen.queryByText('Cargando solicitudes...')).not.toBeInTheDocument();
      });
    });

    it('muestra el mensaje de error si falla la carga', async () => {
      obtenerSolicitudes.mockRejectedValue(new Error('fallo'));
      render(<GestionSolicitudes />);
      await waitFor(() => {
        expect(screen.getByText('Error al cargar las solicitudes')).toBeInTheDocument();
      });
    });
  });

  // ── Contenido de las cards ───────────────────────────────────────────────────

  describe('contenido de las cards', () => {
    it('muestra el numero de solicitud', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => {
        expect(screen.getByText('Nro de Solicitud: 10')).toBeInTheDocument();
      });
    });

    it('muestra el motivo de eliminacion', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => {
        expect(screen.getByText('Informacion incorrecta')).toBeInTheDocument();
      });
    });

    it('muestra la provincia y el pais del hecho', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => {
        expect(screen.getByText(/Buenos Aires/)).toBeInTheDocument();
        expect(screen.getAllByText(/Argentina/)).toHaveLength(2); // una por cada card
      });
    });

    it('muestra los botones de aceptar y rechazar para solicitudes PENDIENTE', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => {
        // getAllByText porque hay dos cards con botones
        expect(screen.getAllByText('✅ Aceptar Eliminación')).toHaveLength(2);
        expect(screen.getAllByText('❌ Rechazar Solicitud')).toHaveLength(2);
      });
    });
  });

  // ── Accion: aceptar ──────────────────────────────────────────────────────────

  describe('accion aceptar', () => {
    it('muestra dialogo de confirmacion al aceptar', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('✅ Aceptar Eliminación'));
      fireEvent.click(screen.getAllByText('✅ Aceptar Eliminación')[0]);
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('aceptar esta solicitud')
      );
    });

    it('llama a actualizarEstadoSolicitud con ACEPTADA al confirmar', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('✅ Aceptar Eliminación'));
      fireEvent.click(screen.getAllByText('✅ Aceptar Eliminación')[0]);
      await waitFor(() => {
        expect(actualizarEstadoSolicitud).toHaveBeenCalledWith(10, 'ACEPTADA');
      });
    });

    it('no llama al servicio si cancela el dialogo de aceptar', async () => {
      window.confirm.mockReturnValueOnce(false);
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('✅ Aceptar Eliminación'));
      fireEvent.click(screen.getAllByText('✅ Aceptar Eliminación')[0]);
      expect(actualizarEstadoSolicitud).not.toHaveBeenCalled();
    });

    it('elimina la card tras aceptar', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('✅ Aceptar Eliminación'));
      fireEvent.click(screen.getAllByText('✅ Aceptar Eliminación')[0]);
      await waitFor(() => {
        expect(screen.queryByText('Inundacion en el sur')).not.toBeInTheDocument();
        expect(screen.getByText('Incendio forestal')).toBeInTheDocument();
      });
    });

    it('no llama a eliminarSolicitud al aceptar (solo al rechazar)', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('✅ Aceptar Eliminación'));
      fireEvent.click(screen.getAllByText('✅ Aceptar Eliminación')[0]);
      await waitFor(() => expect(actualizarEstadoSolicitud).toHaveBeenCalled());
      expect(eliminarSolicitud).not.toHaveBeenCalled();
    });
  });

  // ── Accion: rechazar ─────────────────────────────────────────────────────────

  describe('accion rechazar', () => {
    it('muestra dialogo de confirmacion al rechazar', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('❌ Rechazar Solicitud'));
      fireEvent.click(screen.getAllByText('❌ Rechazar Solicitud')[0]);
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('rechazar esta solicitud')
      );
    });

    it('llama a actualizarEstadoSolicitud con RECHAZADA al confirmar', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('❌ Rechazar Solicitud'));
      fireEvent.click(screen.getAllByText('❌ Rechazar Solicitud')[0]);
      await waitFor(() => {
        expect(actualizarEstadoSolicitud).toHaveBeenCalledWith(10, 'RECHAZADA');
      });
    });

    it('llama a eliminarSolicitud ademas de actualizar al rechazar', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('❌ Rechazar Solicitud'));
      fireEvent.click(screen.getAllByText('❌ Rechazar Solicitud')[0]);
      await waitFor(() => {
        expect(eliminarSolicitud).toHaveBeenCalledWith(10);
      });
    });

    it('no llama al servicio si cancela el dialogo de rechazar', async () => {
      window.confirm.mockReturnValueOnce(false);
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('❌ Rechazar Solicitud'));
      fireEvent.click(screen.getAllByText('❌ Rechazar Solicitud')[0]);
      expect(actualizarEstadoSolicitud).not.toHaveBeenCalled();
    });

    it('elimina la card tras rechazar', async () => {
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('❌ Rechazar Solicitud'));
      fireEvent.click(screen.getAllByText('❌ Rechazar Solicitud')[0]);
      await waitFor(() => {
        expect(screen.queryByText('Inundacion en el sur')).not.toBeInTheDocument();
      });
    });
  });

  // ── Estado de procesamiento ──────────────────────────────────────────────────

  describe('estado de procesamiento', () => {
    it('muestra "Procesando..." y deshabilita botones durante la accion', async () => {
      actualizarEstadoSolicitud.mockReturnValue(new Promise(() => {}));
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('✅ Aceptar Eliminación'));
      fireEvent.click(screen.getAllByText('✅ Aceptar Eliminación')[0]);
      // Los dos botones de la primera card muestran "Procesando..." y quedan deshabilitados
      expect(screen.getAllByText('Procesando...')).toHaveLength(2);
      screen.getAllByText('Procesando...').forEach(btn => {
        expect(btn).toBeDisabled();
      });
    });

    it('muestra alerta si falla la accion', async () => {
      actualizarEstadoSolicitud.mockRejectedValue(new Error('fallo'));
      render(<GestionSolicitudes />);
      await waitFor(() => screen.getAllByText('✅ Aceptar Eliminación'));
      fireEvent.click(screen.getAllByText('✅ Aceptar Eliminación')[0]);
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('No se pudo actualizar la solicitud');
      });
    });
  });
});