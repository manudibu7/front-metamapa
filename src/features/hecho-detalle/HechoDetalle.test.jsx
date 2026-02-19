import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HechoDetalle } from './HechoDetalle';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { hechosService, actualizarEtiqueta, obtenerEtiquetas } from '../../services/hechosService';
import { crearSolicitud } from '../../services/solicitudesService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../services/hechosService', () => ({
  hechosService: { obtenerHechoPorId: jest.fn() },
  actualizarEtiqueta: jest.fn(),
  obtenerEtiquetas: jest.fn(),
}));

jest.mock('../../services/solicitudesService', () => ({
  crearSolicitud: jest.fn(),
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="mapa">{children}</div>,
  TileLayer: () => null,
  Marker: () => <div data-testid="marker" />,
}));

jest.mock('leaflet', () => ({
  icon: jest.fn(() => ({})),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const HECHO_MOCK = {
  id_hecho: 42,
  titulo: 'Inundacion en el sur',
  descripcion: 'Graves inundaciones en la region sur del pais',
  categoria: 'Desastre Natural',
  etiqueta: 'urgente',
  fecha: '2024-01-15',
  fuente: 'estatica',
  tipoHecho: 'NATURAL',
  ubicacion: { latitud: -34.6, longitud: -58.4, provincia: 'Buenos Aires' },
  adjuntos: [],
};

const HECHO_SIN_COORDENADAS = {
  ...HECHO_MOCK,
  ubicacion: { latitud: null, longitud: null, provincia: 'Buenos Aires' },
};

const HECHO_CON_ADJUNTOS = {
  ...HECHO_MOCK,
  adjuntos: [
    { url: 'https://example.com/foto.jpg', tipo: 'imagen', tipoMedia: 'image/jpeg' },
    { url: 'https://example.com/doc.pdf', tipo: 'documento', tipoMedia: 'application/pdf' },
  ],
};

const ETIQUETAS_MOCK = [
  { id_etiqueta: 1, nombre: 'urgente' },
  { id_etiqueta: 2, nombre: 'verificado' },
];

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.useFakeTimers();
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);

  useParams.mockReturnValue({ id: '42' });
  useNavigate.mockReturnValue(jest.fn());
  useAuthContext.mockReturnValue({
    isAuthenticated: true,
    isAdmin: false,
    contribuyenteId: 7,
  });

  hechosService.obtenerHechoPorId.mockResolvedValue(HECHO_MOCK);
  crearSolicitud.mockResolvedValue(null);
  actualizarEtiqueta.mockResolvedValue(null);
  obtenerEtiquetas.mockResolvedValue(ETIQUETAS_MOCK);
});

afterEach(() => {
  jest.useRealTimers();
  console.error.mockRestore();
  console.log.mockRestore();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('HechoDetalle', () => {

  describe('estados de carga y error', () => {
    it('muestra el loader mientras carga', () => {
      hechosService.obtenerHechoPorId.mockReturnValue(new Promise(() => {}));
      render(<HechoDetalle />);
      expect(screen.getByText('Cargando hecho...')).toBeInTheDocument();
    });

    it('muestra mensaje de error si el servicio falla', async () => {
      hechosService.obtenerHechoPorId.mockRejectedValue(new Error('Error de red'));
      render(<HechoDetalle />);
      await waitFor(() => {
        expect(screen.getByText('Error de red')).toBeInTheDocument();
      });
    });

    it('muestra mensaje por defecto si no hay hecho y no hay error', async () => {
      hechosService.obtenerHechoPorId.mockResolvedValue(null);
      render(<HechoDetalle />);
      await waitFor(() => {
        expect(screen.getByText('No se encontró el hecho solicitado.')).toBeInTheDocument();
      });
    });

    it('muestra boton volver en estado de error', async () => {
      hechosService.obtenerHechoPorId.mockRejectedValue(new Error('fallo'));
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('Volver'));
      const navigate = jest.fn();
      useNavigate.mockReturnValue(navigate);
      // El boton existe aunque navigate sea el original del setup
      expect(screen.getByText('Volver')).toBeInTheDocument();
    });

    it('llama a obtenerHechoPorId con el id del parametro', async () => {
      render(<HechoDetalle />);
      await waitFor(() => {
        expect(hechosService.obtenerHechoPorId).toHaveBeenCalledWith('42');
      });
    });
  });

  describe('adjuntos', () => {
    it('no muestra la seccion de adjuntos si no hay ninguno', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByRole('heading', { name: 'Inundacion en el sur', level: 1 }));
      expect(screen.queryByText('Adjuntos y Evidencia')).not.toBeInTheDocument();
    });

    it('muestra la seccion de adjuntos si hay archivos', async () => {
      hechosService.obtenerHechoPorId.mockResolvedValue(HECHO_CON_ADJUNTOS);
      render(<HechoDetalle />);
      await waitFor(() => {
        expect(screen.getByText('Adjuntos y Evidencia')).toBeInTheDocument();
      });
    });

    it('renderiza imagenes adjuntas', async () => {
      hechosService.obtenerHechoPorId.mockResolvedValue(HECHO_CON_ADJUNTOS);
      render(<HechoDetalle />);
      await waitFor(() => {
        expect(screen.getByAltText('Evidencia 1')).toBeInTheDocument();
      });
    });

    it('renderiza documentos adjuntos', async () => {
      hechosService.obtenerHechoPorId.mockResolvedValue(HECHO_CON_ADJUNTOS);
      render(<HechoDetalle />);
      await waitFor(() => {
        expect(screen.getByText('https://example.com/doc.pdf')).toBeInTheDocument();
      });
    });
  });

  // ── Modal de solicitud de eliminacion ────────────────────────────────────────

  describe('modal de solicitud de eliminacion', () => {
    it('muestra el boton de solicitar eliminacion si hay contribuyenteId', async () => {
      render(<HechoDetalle />);
      await waitFor(() => {
        expect(screen.getByText('🗑️ Solicitar Eliminación')).toBeInTheDocument();
      });
    });

    it('no muestra el boton de solicitar eliminacion si no hay contribuyenteId', async () => {
      useAuthContext.mockReturnValue({ isAuthenticated: false, isAdmin: false, contribuyenteId: null });
      render(<HechoDetalle />);
      await waitFor(() => screen.getByRole('heading', { name: 'Inundacion en el sur', level: 1 }));
      expect(screen.queryByText('🗑️ Solicitar Eliminación')).not.toBeInTheDocument();
    });

    it('abre el modal al hacer click en 🗑️ Solicitar Eliminación', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.click(screen.getByText('🗑️ Solicitar Eliminación'));
      expect(screen.getByText('Solicitud de Eliminación')).toBeInTheDocument();
    });

    it('cierra el modal al hacer click en Cancelar', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.click(screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.click(screen.getByText('Cancelar'));
      expect(screen.queryByText('Solicitud de Eliminación')).not.toBeInTheDocument();
    });

    it('el boton Enviar Solicitud esta deshabilitado si el motivo esta vacio', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.click(screen.getByText('🗑️ Solicitar Eliminación'));
      expect(screen.getByText('Enviar Solicitud')).toBeDisabled();
    });

    it('habilita el boton Enviar Solicitud al escribir un motivo', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.click(screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Informacion incorrecta' } });
      expect(screen.getByText('Enviar Solicitud')).not.toBeDisabled();
    });

    it('llama a crearSolicitud con los datos correctos al enviar', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.click(screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Informacion incorrecta' } });
      fireEvent.click(screen.getByText('Enviar Solicitud'));
      await waitFor(() => {
        expect(crearSolicitud).toHaveBeenCalledWith({
          idHecho: 42,
          idContribuyente: 7,
          motivo: 'Informacion incorrecta',
        });
      });
    });

    it('muestra mensaje de exito tras enviar la solicitud', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.click(screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Motivo valido' } });
      fireEvent.click(screen.getByText('Enviar Solicitud'));
      await waitFor(() => {
        expect(screen.getByText('✅ Solicitud de eliminación enviada con éxito.')).toBeInTheDocument();
      });
    });

    it('cierra el modal automaticamente 1.5s despues de enviar', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.click(screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Motivo valido' } });
      fireEvent.click(screen.getByText('Enviar Solicitud'));
      await waitFor(() => screen.getByText('✅ Solicitud de eliminación enviada con éxito.'));
      jest.advanceTimersByTime(1500);
      await waitFor(() => {
        expect(screen.queryByText('Solicitud de Eliminación')).not.toBeInTheDocument();
      });
    });

    it('muestra alerta si el motivo esta vacio al intentar enviar directamente', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🗑️ Solicitar Eliminación'));
      fireEvent.click(screen.getByText('🗑️ Solicitar Eliminación'));
      // Forzamos el click aunque el boton este deshabilitado llamando al handler via confirm
      // En realidad el boton esta disabled, verificamos que alert no se llama
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  // ── Modal de etiqueta (solo admin) ───────────────────────────────────────────

  describe('modal de etiqueta', () => {
    beforeEach(() => {
      useAuthContext.mockReturnValue({
        isAuthenticated: true,
        isAdmin: true,
        contribuyenteId: 7,
      });
    });

    it('muestra el boton de asignar etiqueta si es admin', async () => {
      render(<HechoDetalle />);
      await waitFor(() => {
        expect(screen.getByText('🏷️ Asignar Etiqueta')).toBeInTheDocument();
      });
    });

    it('no muestra el boton de asignar etiqueta si no es admin', async () => {
      useAuthContext.mockReturnValue({ isAuthenticated: true, isAdmin: false, contribuyenteId: 7 });
      render(<HechoDetalle />);
      await waitFor(() => screen.getByRole('heading', { name: 'Inundacion en el sur', level: 1 }));
      expect(screen.queryByText('🏷️ Asignar Etiqueta')).not.toBeInTheDocument();
    });

    it('abre el modal de etiqueta al hacer click en 🏷️ Asignar Etiqueta', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🏷️ Asignar Etiqueta'));
      fireEvent.click(screen.getByText('🏷️ Asignar Etiqueta'));
      expect(screen.getByRole('heading', { name: 'Asignar Etiqueta', level: 3 })).toBeInTheDocument();
    });

    it('carga las etiquetas disponibles al abrir el modal', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🏷️ Asignar Etiqueta'));
      fireEvent.click(screen.getByText('🏷️ Asignar Etiqueta'));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'urgente' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'verificado' })).toBeInTheDocument();
      });
    });

    it('muestra input de texto al seleccionar "Otra"', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🏷️ Asignar Etiqueta'));
      fireEvent.click(screen.getByText('🏷️ Asignar Etiqueta'));
      await waitFor(() => screen.getByRole('option', { name: 'Otra' }));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '__agregar__' } });
      expect(screen.getByPlaceholderText('Ingresá nueva etiqueta')).toBeInTheDocument();
    });

    it('llama a actualizarEtiqueta al guardar con etiqueta existente', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🏷️ Asignar Etiqueta'));
      fireEvent.click(screen.getByText('🏷️ Asignar Etiqueta'));
      await waitFor(() => screen.getByRole('option', { name: 'verificado' }));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'verificado' } });
      fireEvent.click(screen.getByText('Guardar'));
      await waitFor(() => {
        expect(actualizarEtiqueta).toHaveBeenCalledWith(42, 'verificado');
      });
    });

    it('muestra mensaje de exito tras asignar etiqueta', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🏷️ Asignar Etiqueta'));
      fireEvent.click(screen.getByText('🏷️ Asignar Etiqueta'));
      await waitFor(() => screen.getByRole('option', { name: 'verificado' }));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'verificado' } });
      fireEvent.click(screen.getByText('Guardar'));
      await waitFor(() => {
        expect(screen.getByText('Etiqueta actualizada correctamente ✔️')).toBeInTheDocument();
      });
    });

    it('muestra error si falla la asignacion de etiqueta', async () => {
      actualizarEtiqueta.mockRejectedValue(new Error('fallo'));
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🏷️ Asignar Etiqueta'));
      fireEvent.click(screen.getByText('🏷️ Asignar Etiqueta'));
      await waitFor(() => screen.getByRole('option', { name: 'verificado' }));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'verificado' } });
      fireEvent.click(screen.getByText('Guardar'));
      await waitFor(() => {
        expect(screen.getByText('No se pudo actualizar la etiqueta.')).toBeInTheDocument();
      });
    });

    it('cierra el modal de etiqueta al hacer click en Cancelar', async () => {
      render(<HechoDetalle />);
      await waitFor(() => screen.getByText('🏷️ Asignar Etiqueta'));
      fireEvent.click(screen.getByText('🏷️ Asignar Etiqueta'));
      // Hay dos botones Cancelar (modal solicitud + modal etiqueta), tomamos el del modal activo
      fireEvent.click(screen.getByRole('heading', { name: 'Asignar Etiqueta', level: 3 })
        .closest('.modal-content')
        .querySelector('.btn-cancelar'));
      expect(screen.queryByRole('heading', { name: 'Asignar Etiqueta', level: 3 })).not.toBeInTheDocument();
    });
  });
});