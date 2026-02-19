import { render, screen } from '@testing-library/react';
import { MapaHechos } from './MapaHechos';
import { configureLeafletIcon } from '../../utils/leafletIcons';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="mapa-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
}));

jest.mock('leaflet/dist/leaflet.css', () => {});

jest.mock('../../utils/leafletIcons', () => ({
  configureLeafletIcon: jest.fn(),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const HECHOS_MOCK = [
  {
    id: 1,
    titulo: 'Inundación en el sur',
    descripcion: 'Graves inundaciones en la región sur',
    categoria: 'Desastre Natural',
    provincia: 'Buenos Aires',
    lat: -34.6,
    lon: -58.4,
    ubicacion: { latitud: -34.6, longitud: -58.4 },
  },
  {
    id: 2,
    titulo: 'Incendio forestal',
    descripcion: 'Incendio de gran magnitud',
    categoria: 'Incendio',
    provincia: 'Córdoba',
    lat: -31.4,
    lon: -64.2,
    ubicacion: { latitud: -31.4, longitud: -64.2 },
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MapaHechos', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Contenido de los popups ──────────────────────────────────────────────────

  describe('contenido de los popups', () => {
    it('muestra el título de cada hecho en su popup', () => {
      render(<MapaHechos hechos={HECHOS_MOCK} />);
      expect(screen.getByText('Inundación en el sur')).toBeInTheDocument();
      expect(screen.getByText('Incendio forestal')).toBeInTheDocument();
    });

    it('muestra la descripción de cada hecho en su popup', () => {
      render(<MapaHechos hechos={HECHOS_MOCK} />);
      expect(screen.getByText('Graves inundaciones en la región sur')).toBeInTheDocument();
      expect(screen.getByText('Incendio de gran magnitud')).toBeInTheDocument();
    });

    it('muestra la categoría y provincia de cada hecho en su popup', () => {
      render(<MapaHechos hechos={HECHOS_MOCK} />);
      // Buscamos el texto exacto del <small> que combina categoría · provincia
      expect(screen.getByText((_, el) =>
        el?.tagName === 'SMALL' && el.textContent.includes('Desastre Natural')
      )).toBeInTheDocument();
      expect(screen.getByText((_, el) =>
        el?.tagName === 'SMALL' && el.textContent.includes('Buenos Aires')
      )).toBeInTheDocument();
      expect(screen.getByText((_, el) =>
        el?.tagName === 'SMALL' && el.textContent.includes('Incendio')
      )).toBeInTheDocument();
      expect(screen.getByText((_, el) =>
        el?.tagName === 'SMALL' && el.textContent.includes('Córdoba')
      )).toBeInTheDocument();
    });
  });

  // ── Inicialización de Leaflet ────────────────────────────────────────────────

  describe('inicialización de leaflet', () => {
    it('llama a configureLeafletIcon al montar el componente', () => {
      render(<MapaHechos />);
      expect(configureLeafletIcon).toHaveBeenCalledTimes(1);
    });

    it('llama a configureLeafletIcon solo una vez aunque haya hechos', () => {
      render(<MapaHechos hechos={HECHOS_MOCK} />);
      expect(configureLeafletIcon).toHaveBeenCalledTimes(1);
    });
  });

});