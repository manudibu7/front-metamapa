import { render, screen, fireEvent, waitFor } from '@testing-library/react'

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: () => <div data-testid="marker" />,
  useMapEvents: () => {},
}));

jest.mock('../../utils/leafletIcons', () => ({
  configureLeafletIcon: jest.fn(),
}));

import { UbicacionSelector } from './UbicacionSelector';

test('llama onChange cuando se hace click en Limpiar', () => {
  const onChange = jest.fn();

  render(<UbicacionSelector value={{ latitud: 1, longitud: 2 }} onChange={onChange} />);

  fireEvent.click(screen.getByText('Limpiar'));

  expect(onChange).toHaveBeenCalledWith(null);
});
describe('UbicacionSelector', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('renderiza el input y los botones', () => {
    render(<UbicacionSelector value={null} onChange={jest.fn()} />);

    expect(screen.getByPlaceholderText(/plaza de mayo/i)).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByText('Limpiar')).toBeInTheDocument();
  });

  it('limpia la ubicación al hacer click en Limpiar', () => {
    const onChange = jest.fn();

    render(<UbicacionSelector value={{ latitud: 1, longitud: 1 }} onChange={onChange} />);

    fireEvent.click(screen.getByText('Limpiar'));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('busca una dirección y llama a onChange', async () => {
    const onChange = jest.fn();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: '-34.6083',
          lon: '-58.3712',
          display_name: 'Plaza de Mayo, Buenos Aires',
        },
      ],
    });

    render(<UbicacionSelector value={null} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText(/plaza de mayo/i), {
      target: { value: 'Plaza de Mayo' },
    });

    fireEvent.click(screen.getByText('Buscar'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          latitud: -34.6083,
          longitud: -58.3712,
          label: expect.stringContaining('Plaza de Mayo'),
        })
      );
    });
  });

  it('muestra error si no hay resultados', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<UbicacionSelector value={null} onChange={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/plaza de mayo/i), {
      target: { value: 'nada' },
    });

    fireEvent.click(screen.getByText('Buscar'));

    expect(await screen.findByText(/no encontramos coincidencias/i)).toBeInTheDocument();
  });
});