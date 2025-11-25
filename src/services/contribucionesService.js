const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));
const API_BASE_URL = process.env.REACT_APP_LOADER_API ?? '';

const sanitizeHecho = (hecho) => {
  if (!hecho) throw new Error('El hecho es obligatorio');
  if (!hecho.titulo?.trim()) throw new Error('El título del hecho es obligatorio');
  if (!hecho.descripcion?.trim()) throw new Error('La descripción del hecho es obligatoria');
  if (!hecho.categoria) throw new Error('Seleccioná una categoría');
  if (!hecho.fecha) throw new Error('La fecha del hecho es obligatoria');
  if (!hecho.ubicacion) throw new Error('Falta la ubicación del hecho');

  const latitud = parseFloat(hecho.ubicacion.latitud);
  const longitud = parseFloat(hecho.ubicacion.longitud);

  if (Number.isNaN(latitud) || Number.isNaN(longitud)) {
    throw new Error('La latitud y longitud deben ser números válidos');
  }

  return {
    titulo: hecho.titulo.trim(),
    descripcion: hecho.descripcion.trim(),
    categoria: hecho.categoria,
    fecha: hecho.fecha,
    provincia: hecho.provincia?.trim() || null,
    ubicacion: {
      latitud,
      longitud,
    },
  };
};

const fileToDataUrl = (archivo) =>
  new Promise((resolve, reject) => {
    if (!archivo) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(archivo);
  });

const postJson = async (url, body, headers) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Error al crear contribución (${response.status})`);
  }
  return response.json();
};

const patchJson = async (url, body, headers) => {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Error al adjuntar archivo (${response.status})`);
  }
  return response.json();
};

export const enviarContribucionRapida = async ({ contribuyenteId, hecho, archivo, token }) => {
  if (!contribuyenteId) {
    throw new Error('No pudimos obtener el contribuyenteId del token.');
  }

  const hechoDto = sanitizeHecho(hecho);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Si no se configuró un backend, simulamos la latencia para no romper la demo.
  if (!API_BASE_URL) {
    console.warn('[Loader Dinámico] REACT_APP_LOADER_API no configurada, se usa flujo simulado.');
    await delay();
    return {
      contribuyenteId,
      contribucionId: Date.now(),
      archivoAdjunto: archivo ? { nombreOriginal: archivo.name, tipo: archivo.type } : null,
      simulated: true,
    };
  }

  const contribucionPayload = {
    idContribuyente: contribuyenteId,
    hecho: hechoDto,
  };

  const { id: contribucionId } = await postJson(`${API_BASE_URL}/contribuciones`, contribucionPayload, headers);

  if (archivo) {
    const dataUrl = await fileToDataUrl(archivo);
    await patchJson(
      `${API_BASE_URL}/contribuciones/${contribucionId}`,
      {
        tipo: archivo.type || 'application/octet-stream',
        url: dataUrl,
        nombreOriginal: archivo.name ?? 'adjunto',
      },
      headers
    );
  }

  return {
    contribuyenteId,
    contribucionId,
    archivoAdjunto: archivo ? { nombreOriginal: archivo.name, tipo: archivo.type } : null,
  };
};
