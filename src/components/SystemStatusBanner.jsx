import { useSystemStatus } from '../context/SystemStatusContext';

export const SystemStatusBanner = () => {
  const { backendUp, online } = useSystemStatus();

  if (online && backendUp) return null;

  let message = '';

  if (!online) {
    message = 'Sin conexión a internet';
  } else if (!backendUp) {
    message = 'Servidor temporalmente no disponible (modo degradado)';
  }

  return (
    <div style={{
      backgroundColor: '#ffcc00',
      padding: '8px',
      textAlign: 'center',
      fontWeight: 'bold'
    }}>
      {message}
    </div>
  );
};
