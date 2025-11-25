import './MapPreview.css';
import { latToPercent, lonToPercent } from '../../utils/geo';

export const MapPreview = ({ markers = [], highlightedId }) => {
  return (
    <div className="map-preview">
      <div className="map-preview__grid" />
      {markers.map((marker) => (
        <button
          key={marker.id}
          type="button"
          className={`map-preview__marker ${highlightedId === marker.id ? 'is-active' : ''}`}
          style={{
            top: `${latToPercent(marker.lat)}%`,
            left: `${lonToPercent(marker.lon)}%`,
          }}
        >
          <span />
          <strong>{marker.title}</strong>
          <small>{marker.provincia}</small>
        </button>
      ))}
    </div>
  );
};
