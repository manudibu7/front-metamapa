import { useEffect, useRef, useState } from "react";
import "./FastFactForm.css";
import { enviarContribucionRapida } from "../../services/contribucionesService";
import { useAuth } from "../../hooks/useAuth";
import { UbicacionSelector } from "../UbicacionSelector/UbicacionSelector";
import { getCategorias } from "../../services/contribucionesService";
import { useNavigate } from "react-router-dom";


 const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const maxDate = today.toISOString().split("T")[0];

const buildDefaultHecho = () => ({
  titulo: "",
  categoria: "",  // ← ahora es solo string
  descripcion: "",
  fecha: maxDate,
  ubicacion: null,
});


//const mockAuth = {
//    isAuthenticated: true,
//    login: () => console.log("login mock ejecutado"),
//    contribuyenteId: "123",
//    token: "mock-token",
//    loading: false,
//    user: { nombre: "Usuario Mock" },
//  };

//  const {
//    isAuthenticated,
//    login,
//    contribuyenteId,
//    token,
//    loading: authLoading,
//    user,
//  } = mockAuth;

export const FastFactForm = () => {
  const { isAuthenticated, login, contribuyenteId, token, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  const [hecho, setHecho] = useState(() => buildDefaultHecho());
  const [archivo, setArchivo] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [anonimo, setAnonimo] = useState(false);

  const [mapKey, setMapKey] = useState(0);


  const handleHechoChange = (event) => {
    const { name, value } = event.target;
    setHecho((prev) => ({ ...prev, [name]: value }));
  };
  const handleUbicacionChange = (coords) => {
    setHecho((prev) => ({ ...prev, ubicacion: coords }));
  };

const handleArchivoChange = (event) => {
  const file = event.target.files?.[0];
  if (file && file.size > 10 * 1024 * 1024) { 
    setStatus("error");
     setError("El archivo es demasiado pesado (Max 10MB)");
     return;
  }
  setArchivo(file);
};

  const resetForm = () => {
    setHecho(buildDefaultHecho());
    setArchivo(null);
    setNuevaCategoria("");
    setStatus("idle"); // Volvemos a estado inicial
    setMapKey(prev => prev + 1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
 ///SI
  const handleSubmit = async (event) => {
    event.preventDefault();
    const categoriaFinal =
    hecho.categoria === "__agregar__"
      ? nuevaCategoria   // Usuario escribió una categoría nueva
      : hecho.categoria; // Categoría ya existente


    if (!hecho.ubicacion) {
      setStatus("error");
      setError("Seleccioná una ubicación desde el mapa o la búsqueda.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      await enviarContribucionRapida({
        contribuyenteId,
         hecho: {
        ...hecho,
        categoria: categoriaFinal, // <-- SOLO STRING
        },
        archivo,
        token,
        anonimo,
      });
      setStatus("success");
      //setTimeout(() => setStatus("idle"), 3500);
    } catch (err) {
      setStatus("error");
      setError(err?.message ?? "No se pudo registrar la contribución.");
    }
  };

  const handleNuevaCarga = () => {
    resetForm(); // Limpia y vuelve al formulario
  };
  const handleIrAInicio = () => {
    navigate("/"); // O la ruta que sea tu home
  };

  useEffect(() => {
  const fetchCategorias = async () => {
    try {
      const categoriasResponse = await getCategorias();

      setCategorias(categoriasResponse.map(c => c.nombre));
    } catch (error) {
      setStatus("error");
      setError(error?.message ?? "No se pudo obtener las categorias.");
    }
  };

  fetchCategorias();
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
           <div style={{ marginBottom: "1rem" }}>
            <button
              type="button"
              className={`btn ${anonimo ? "btn--primary" : "btn--secondary"}`}
              // CORRECCIÓN: Usamos () => función
              onClick={() => setAnonimo(!anonimo)} 
            >
              {anonimo ? "Modo Anónimo Activado" : "Activar Modo Anónimo"}
            </button>
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
                  value={hecho.categoria}
                  onChange={(e) => {
                    const value = e.target.value;

                    setHecho(prev => ({
                      ...prev,
                      categoria: value,
                    }));

                    // Si eligió "otra", limpiamos el input
                    if (value === "__agregar__") {
                      setNuevaCategoria("");
                    }
                  }}
                >
                  <option value="">Seleccioná una categoría</option>

                  {categorias.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}

                  <option value="__agregar__">Otra</option>
                </select>
                  {hecho.categoria === "__agregar__" && (
                  <input
                    type="text"
                    placeholder="Ingresá nueva categoría"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
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
                
                max={maxDate}
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
            key={mapKey}
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
      {status === "success" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-success-icon">✓</div>
            <h3>¡Carga Exitosa!</h3>
            <p style={{ color: '#666' }}>Su contribución ha sido enviada y se encuentra con <b>revisión pendiente</b>.</p>
            
            <div className="modal-summary">
              <h4>Resumen de lo cargado:</h4>
              <p><strong>Título:</strong> {hecho.titulo}</p>
              <p><strong>Categoría:</strong> {hecho.categoria === "__agregar__" ? nuevaCategoria : hecho.categoria}</p>
              <p><strong>Fecha:</strong> {hecho.fecha}</p>
              <p><strong>Archivo:</strong> {archivo ? archivo.name : "Sin adjunto"}</p>
            </div>

            <div className="modal-actions">
              <button className="btn btn--secondary" onClick={handleIrAInicio}>
                Ir a Inicio
              </button>
              <button className="btn btn--primary" onClick={handleNuevaCarga}>
                Cargar nueva contribución
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
