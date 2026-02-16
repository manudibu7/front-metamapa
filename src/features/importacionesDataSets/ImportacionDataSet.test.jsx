import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportacionDataSet } from './ImportacionDataSet';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { obtenerDataSetsAdmin } from '../../services/importacionesService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../../services/importacionesService', () => ({
  obtenerDataSetsAdmin: jest.fn(),
}));

jest.mock('./DataSetCard', () => {
  const DataSetCard = ({ ds }) => <div data-testid={`dataset-card-${ds.ruta}`}>{ds.ruta}</div>;
  return {
    __esModule: true,
    default: DataSetCard,
    DataSetCard,
  };
});

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const DATASETS_MOCK = [
  { ruta: 'datos/archivo1.csv', nombre: 'Archivo 1' },
  { ruta: 'datos/archivo2.pdf', nombre: 'Archivo 2' },
];

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});

  useNavigate.mockReturnValue(jest.fn());
  useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true });
  obtenerDataSetsAdmin.mockResolvedValue(DATASETS_MOCK);
});

afterEach(() => {
  console.error.mockRestore();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ImportacionDataSet', () => {
  describe('seleccion de archivo', () => {
    it('muestra el nombre del archivo seleccionado en el label', async () => {
      render(<ImportacionDataSet />);
      await waitFor(() => screen.getByText((_, el) => el?.tagName === 'LABEL' && el.textContent.includes('Subir Archivo')));

      const input = document.querySelector('input[type="file"]');
      const archivo = new File(['contenido'], 'datos.csv', { type: 'text/csv' });
      fireEvent.change(input, { target: { files: [archivo] } });

      expect(screen.getByText('datos.csv')).toBeInTheDocument();
    });

    it('acepta archivos csv y pdf segun el atributo accept', async () => {
      render(<ImportacionDataSet />);
      await waitFor(() => screen.getByText((_, el) => el?.tagName === 'LABEL' && el.textContent.includes('Subir Archivo')));
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', '.csv,.pdf');
    });

    it('muestra error si el archivo supera los 10MB', async () => {
      render(<ImportacionDataSet />);
      await waitFor(() => screen.getByText((_, el) => el?.tagName === 'LABEL' && el.textContent.includes('Subir Archivo')));

      const input = document.querySelector('input[type="file"]');
      // Creamos un archivo de 11MB
      const archivoGrande = new File(
        [new ArrayBuffer(11 * 1024 * 1024)],
        'grande.csv',
        { type: 'text/csv' }
      );
      fireEvent.change(input, { target: { files: [archivoGrande] } });

      await waitFor(() => {
        expect(screen.getByText('El archivo es demasiado pesado (Max 10MB)')).toBeInTheDocument();
      });
    });

    it('no actualiza el archivo si supera los 10MB', async () => {
      render(<ImportacionDataSet />);
      // Esperamos a que el label esté visible antes de seleccionar el archivo
      const labelMatcher = (_, el) =>
        el?.tagName === 'LABEL' && el.textContent.includes('Subir Archivo');
      await waitFor(() => screen.getByText(labelMatcher));

      const input = document.querySelector('input[type="file"]');
      const archivoGrande = new File(
        [new ArrayBuffer(11 * 1024 * 1024)],
        'grande.csv',
        { type: 'text/csv' }
      );
      fireEvent.change(input, { target: { files: [archivoGrande] } });

      // El nombre del archivo grande no debe aparecer
      expect(screen.queryByText('grande.csv')).not.toBeInTheDocument();
    });

    it('acepta archivo de exactamente 10MB sin error', async () => {
      render(<ImportacionDataSet />);
      await waitFor(() => screen.getByText((_, el) => el?.tagName === 'LABEL' && el.textContent.includes('Subir Archivo')));

      const input = document.querySelector('input[type="file"]');
      const archivo10mb = new File(
        [new ArrayBuffer(10 * 1024 * 1024)],
        'justo.csv',
        { type: 'text/csv' }
      );
      fireEvent.change(input, { target: { files: [archivo10mb] } });

      expect(screen.getByText('justo.csv')).toBeInTheDocument();
      expect(screen.queryByText('El archivo es demasiado pesado (Max 10MB)')).not.toBeInTheDocument();
    });
  });
});