import { useRef, useState } from 'react';
import './FastFactForm.css';
import { enviarContribucionRapida } from '../../services/contribucionesService';
import { useAuth } from '../../hooks/useAuth';
import { UbicacionSelector } from '../UbicacionSelector/UbicacionSelector';

const buildDefaultHecho = () => ({
  titulo: '',
  categoria: '',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  ubicacion: null,
});

export const FastFactForm = () => {
  const { isAuthenticated, login, contribuyenteId, token, loading: authLoading, user } = useAuth();
  const [hecho, setHecho] = useState(() => buildDefaultHecho());
  const [archivo, setArchivo] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleHechoChange = (event) => {
    const { name, value } = event.target;
    setHecho((prev) => ({ ...prev, [name]: value }));
  };

  const handleUbicacionChange = (coords) => {
    setHecho((prev) => ({ ...prev, ubicacion: coords }));
  };

  const handleArchivoChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setArchivo(file);
  };

  const resetForm = () => {
    setHecho(buildDefaultHecho());
    setArchivo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hecho.ubicacion) {
      setStatus('error');
      setError('Seleccioná una ubicación desde el mapa o la búsqueda.');
      return;
    }
    if (!contribuyenteId) {
      setStatus('error');
      setError('No pudimos leer tu contribuyenteId del token.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      await enviarContribucionRapida({ contribuyenteId, hecho, archivo, token });
      setStatus('success');
      resetForm();
      setTimeout(() => setStatus('idle'), 3500);
    } catch (err) {
      setStatus('error');
      setError(err?.message ?? 'No se pudo registrar la contribución.');
    }
  };

  let bodyContent = null;
  if (authLoading) {
    bodyContent = <div className="fast-fact__locked">Sincronizando con Keycloak...</div>;
  } else if (!isAuthenticated) {
    bodyContent = (
      <div className="fast-fact__locked">
        <p>Necesitás ingresar con Keycloak para registrar contribuciones en el Loader Dinámico.</p>
        <button type="button" className="btn btn--primary" onClick={login}>
          Ingresar ahora
        </button>
      </div>
    );
  } else {
    bodyContent = (
      <form className="fast-fact__form" onSubmit={handleSubmit}>
          <div className="fast-fact__section">
            <div className="fast-fact__section-header">
              <h3>Detalle del hecho</h3>
              <span className="fast-fact__badge">ContribucionInputDTO.hecho</span>
            </div>

            <label>
              Título del hecho
              <input
                name="titulo"
                value={hecho.titulo}
                onChange={handleHechoChange}
                placeholder="Ej. Vertido en Dock Sud"
                required
                maxLength={200}
              />
            </label>

            <div className="fast-fact__grid fast-fact__grid--three">
              <label>
                Categoría
                <select name="categoria" value={hecho.categoria} onChange={handleHechoChange} required>
                  <option value="">Seleccioná una categoría</option>
                  <option value="Incendio forestal">Incendio forestal</option>
                  <option value="Vertido químico">Vertido químico</option>
                  <option value="Violencia policial">Violencia policial</option>
                  <option value="Detención arbitraria">Detención arbitraria</option>
                </select>
              </label>
              <label>
                Fecha del hecho
                <input type="date" name="fecha" value={hecho.fecha} onChange={handleHechoChange} max={new Date().toISOString().split('T')[0]} required />
              </label>
            </div>

            <label>
              Descripción
              <textarea
                name="descripcion"
                rows="4"
                value={hecho.descripcion}
                onChange={handleHechoChange}
                placeholder="Relatá qué ocurrió y actores involucrados."
                required
              />
            </label>
          </div>

          <div className="fast-fact__section">
            <div className="fast-fact__section-header">
              <h3>Ubicación georreferenciada</h3>
              <span className="fast-fact__badge">UbicacionInputDTO</span>
            </div>
            <UbicacionSelector value={hecho.ubicacion} onChange={handleUbicacionChange} />
            <p className="fast-fact__hint">
              Marcá un punto en el mapa o escribí la dirección. La herramienta traduce esa referencia a latitud y
              longitud en WGS84, tal como espera el loader Dinámico.
            </p>
          </div>

          <div className="fast-fact__section">
            <div className="fast-fact__section-header">
              <h3>Adjunto opcional</h3>
              <span className="fast-fact__badge">ArchivoInputDTO</span>
            </div>
            <label className="fast-fact__file">
              Evidencia (foto, video o PDF)
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.mp4,.mov"
                ref={fileInputRef}
                onChange={handleArchivoChange}
              />
            </label>
            {archivo ? (
              <p className="fast-fact__file-info">
                {archivo.name} · {(archivo.size / 1024).toFixed(1)} KB
              </p>
            ) : (
              <p className="fast-fact__hint">
                El archivo se adjunta luego vía <code>{'PATCH /contribuciones/{id}'}</code>.
              </p>
            )}
          </div>

          {status === 'error' && <p className="fast-fact__error">{error}</p>}
          {status === 'success' && <p className="fast-fact__success">Contribución enviada para revisión.</p>}

          <div className="fast-fact__actions">
            <button type="submit" className="btn btn--primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Enviando...' : 'Enviar contribución'}
            </button>
            <span className="fast-fact__legal">El loader asigna la fuente "dinámica" automáticamente según tu token.</span>
          </div>
        </form>
    );
  }

  return (
    <section className="fast-fact" id="carga-hechos">
      <header>
        <p className="section-eyebrow">Carga rápida</p>
        <h2>Subí un hecho en menos de un minuto</h2>
        <p>
          Este formulario replica el flujo del loader dinámico: usa tu sesión de Keycloak para enviar el ID del
          contribuyente y adjunta la ubicación traducida automáticamente a coordenadas.
        </p>
        {isAuthenticated && contribuyenteId && (
          <p className="fast-fact__hint">
            Sesión activa: <strong>{user?.name ?? user?.username ?? 'usuario'}</strong> · ID enviado:{' '}
            <code>{contribuyenteId}</code>
          </p>
        )}
      </header>

      {bodyContent}
    </section>
  );
};
