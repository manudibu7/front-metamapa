import { useEffect, useMemo, useState } from 'react';
import './UbicacionSelector.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { configureLeafletIcon } from '../../utils/leafletIcons';

const DEFAULT_POSITION = [-34.6037, -58.3816];

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(event) {
      onSelect({
        latitud: Number(event.latlng.lat.toFixed(6)),
        longitud: Number(event.latlng.lng.toFixed(6)),
        label: `Coordenadas ${event.latlng.lat.toFixed(4)}, ${event.latlng.lng.toFixed(4)}`,
      });
    },
  });
  return null;
};

export const UbicacionSelector = ({ value, onChange }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    configureLeafletIcon();
  }, []);

  const position = useMemo(() => {
    if (value?.latitud && value?.longitud) {
      return [Number(value.latitud), Number(value.longitud)];
    }
    return DEFAULT_POSITION;
  }, [value]);

  const markerPosition = value?.latitud && value?.longitud ? [value.latitud, value.longitud] : null;

  const handleSelect = (coords) => {
    setError('');
    onChange?.(coords);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!search.trim()) return;

    setStatus('loading');
    setError('');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(search.trim())}`,
        {
          headers: {
            'Accept-Language': 'es',
            // 'User-Agent': 'MetaMapa' // Nominatim requiere identificación, pero los navegadores bloquean este header en fetch client-side.
            // Si sigue fallando, la solución ideal es usar un proxy o backend propio.
          },
        }
      );
      if (!response.ok) {
        throw new Error('No se pudo traducir la dirección.');
      }
      const results = await response.json();
      if (!results.length) {
        throw new Error('No encontramos coincidencias para esa descripción.');
      }
      const [match] = results;
      handleSelect({
        latitud: Number(match.lat),
        longitud: Number(match.lon),
        label: match.display_name,
      });
    } catch (err) {
      setError(err.message ?? 'Fallo la búsqueda geográfica.');
    } finally {
      setStatus('idle');
    }
  };

  const handleClear = () => {
    setSearch('');
    handleSelect(null);
  };

  return (
    <div className="ubicacion-selector">
      <div className="ubicacion-selector__search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Ej. Plaza de Mayo, Buenos Aires"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(e);
            }
          }}
        />
        <button type="button" onClick={handleSearch} disabled={status === 'loading'}>
          {status === 'loading' ? 'Buscando...' : 'Buscar' }
        </button>
        <button type="button" onClick={handleClear} className="ubicacion-selector__clear">
          Limpiar
        </button>
      </div>

      <div className="ubicacion-selector__map">
        <MapContainer center={position} zoom={value ? 11 : 5} scrollWheelZoom className="ubicacion-selector__map-frame">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={handleSelect} />
          {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>
        {value ? (
          <p className="ubicacion-selector__details">
            {value.label ?? 'Ubicación seleccionada'} · Lat {Number(value.latitud).toFixed(5)} / Lon {Number(value.longitud).toFixed(5)}
          </p>
        ) : (
          <p className="ubicacion-selector__details">Click en el mapa o buscá una dirección para generar las coordenadas.</p>
        )}
        {error && <p className="ubicacion-selector__error">{error}</p>}
      </div>
    </div>
  );
};
