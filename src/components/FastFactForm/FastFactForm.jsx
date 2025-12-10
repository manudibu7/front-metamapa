import { useEffect, useRef, useState } from "react";
import "./FastFactForm.css";
import { enviarContribucionRapida } from "../../services/contribucionesService";
import { useAuth } from "../../hooks/useAuth";
import { UbicacionSelector } from "../UbicacionSelector/UbicacionSelector";

const buildDefaultHecho = () => ({
  titulo: "",
  categoria: "",
  descripcion: "",
  fecha: new Date().toISOString().split("T")[0],
  ubicacion: null,
});

export const FastFactForm = () => {
  // const { isAuthenticated, login, contribuyenteId, token, loading: authLoading, user } = useAuth();
  const mockAuth = {
    isAuthenticated: true,
    login: () => console.log("login mock ejecutado"),
    contribuyenteId: "123",
    token: "mock-token",
    loading: false,
    user: { nombre: "Usuario Mock" },
  };

  const {
    isAuthenticated,
    login,
    contribuyenteId,
    token,
    loading: authLoading,
    user,
  } = mockAuth;

  const [hecho, setHecho] = useState(() => buildDefaultHecho());
  const [archivo, setArchivo] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [categorias, setCategorias] = useState([]);

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
      fileInputRef.current.value = "";
    }
  };
 ///SI
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hecho.ubicacion) {
      setStatus("error");
      setError("Seleccioná una ubicación desde el mapa o la búsqueda.");
      return;
    }
    if (!contribuyenteId) {
      setStatus("error");
      setError("No pudimos leer tu contribuyenteId del token.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      await enviarContribucionRapida({
        contribuyenteId,
        hecho,
        archivo,
        token,
      });
      setStatus("success");
      resetForm();
      setTimeout(() => setStatus("idle"), 3500);
    } catch (err) {
      setStatus("error");
      setError(err?.message ?? "No se pudo registrar la contribución.");
    }
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        //const categorias = await getCategorias();
        //setCategorias(categorias);
        console.log("fetchCategorias mock ejecutado");
      } catch (error) {
        setStatus("error");
        setError(error?.message ?? "No se pudo obtener las categorias.");
      }
    };
  }, []);

  let bodyContent = null;
  if (authLoading) {
    bodyContent = (
      <div className="fast-fact__locked">Sincronizando con Keycloak...</div>
    );
  } else if (!isAuthenticated) {
    bodyContent = (
      <div className="fast-fact__locked">
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
              <select
                name="categoria"
                value={hecho.categoria}
                onChange={handleHechoChange}
                required
              >
                <option value="">Seleccioná una categoría</option>

                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}

                <option value="__agregar__">Otra</option>
              </select>

              {hecho.categoria === "__agregar__" && (
                <input
                  type="text"
                  name="categoriaNueva"
                  placeholder="Ingresá nueva categoría"
                  value={hecho.categoriaNueva  === "__agregar__" ? "" : hecho.categoria}
                  onChange={handleHechoChange}
                  className="input-nueva-categoria"
                />
              )}
            </label>
            <label>
              Fecha del hecho
              <input
                type="date"
                name="fecha"
                value={hecho.fecha}
                onChange={handleHechoChange}
                max={new Date().toISOString().split("T")[0]}
                required
              />
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
          </div>
          <UbicacionSelector
            value={hecho.ubicacion}
            onChange={handleUbicacionChange}
          />
        </div>

        <div className="fast-fact__section">
          <div className="fast-fact__section-header">
            <h3>Adjunto opcional</h3>
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
            <p></p>
          )}
        </div>

        {status === "error" && <p className="fast-fact__error">{error}</p>}
        {status === "success" && (
          <p className="fast-fact__success">
            Contribución enviada para revisión.
          </p>
        )}

        <div className="fast-fact__actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Enviando..." : "Enviar contribución"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="fast-fact" id="carga-hechos">
      <header>
        <p className="section-eyebrow">Carga rápida</p>
        <h2>Subí un hecho en menos de un minuto</h2>
      </header>
      {bodyContent}
    </section>
  );
};
