import { useEffect } from 'react';
import './MapaHechos.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { configureLeafletIcon } from '../../utils/leafletIcons';

const CENTRO_POR_DEFECTO = [-34.6, -58.4];

export const MapaHechos = ({ hechos = [] }) => {
  useEffect(() => {
    configureLeafletIcon();
  }, []);

  const limites = hechos.length ? hechos.map((hecho) => [hecho.lat, hecho.lon]) : [CENTRO_POR_DEFECTO];

  return (
    <div className="mapa-hechos">
      <MapContainer
        center={CENTRO_POR_DEFECTO}
        zoom={5}
        scrollWheelZoom
        className="mapa-hechos__contenedor"
        bounds={limites}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hechos.map((hecho) => (
          <Marker key={hecho.id} position={[hecho.ubicacion.latitud, hecho.ubicacion.longitud]}>
            <Popup>
              <strong>{hecho.titulo}</strong>
              <p>{hecho.descripcion}</p>
              <small>
                {hecho.categoria} · {hecho.provincia}
              </small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
