import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import {obtenerMiPerfil, actualizarMiPerfil,} from '../../services/contribuyentesService';
import './GestorUsuarios.css';

const GestorUsuarios = () => {
  const { isAuthenticated, loading, user, login, updatePerfil } = useAuthContext();

  // 👉 keycloakId real del usuario
  const keycloakId = user?.sub || user?.id;

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    edad: '',
  });

  const [estado, setEstado] = useState({
    cargando: true,
    guardando: false,
    mensaje: '',
    error: '',
  });

  // 🔒 Bloqueo si no hay sesión
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setEstado((e) => ({
        ...e,
        cargando: false,
        error: 'Debés iniciar sesión para editar tu perfil',
      }));
    }
  }, [loading, isAuthenticated]);

  // 📥 Cargar MI perfil (por keycloakId)
  useEffect(() => {
  const fetchPerfil = async () => {
    // ⛔ si está autenticado pero todavía no llegó el user
    if (isAuthenticated && !keycloakId) {
      setEstado((e) => ({ ...e, cargando: true }));
      return;
    }

    // ❌ no autenticado → no cargar
    if (!isAuthenticated) {
      setEstado((e) => ({ ...e, cargando: false }));
      return;
    }

    try {
      const data = await obtenerMiPerfil(keycloakId);
      setForm({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        edad: data.edad ?? '',
      });
    } catch (err) {
      setEstado((e) => ({
        ...e,
        error: 'Error cargando el perfil',
      }));
    } finally {
      setEstado((e) => ({ ...e, cargando: false }));
    }
  };
  fetchPerfil();
}, [isAuthenticated, keycloakId, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // 💾 Guardar cambios (por keycloakId)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setEstado({ cargando: false, guardando: true, mensaje: '', error: '' });

    try {
      const actualizado = await actualizarMiPerfil(keycloakId, {
        nombre: form.nombre,
        apellido: form.apellido,
        edad: form.edad !== '' ? Number(form.edad) : null,
        });
      updatePerfil(actualizado);
      setEstado({
        cargando: false,
        guardando: false,
        mensaje: 'Perfil actualizado correctamente ✔️',
        error: '',
      });
    } catch (err) {
      setEstado({
        cargando: false,
        guardando: false,
        mensaje: '',
        error: 'No se pudo actualizar el perfil',
      });
    }
  };
  
  if (loading || estado.cargando) {
    return <p>Cargando perfil...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p>{estado.error}</p>
        <button onClick={login}>Iniciar sesión</button>
      </div>
    );
  }
  console.log({ loading, isAuthenticated, user, keycloakId });
  return (
    <div className="gestor-usuario">
      <h2>Editar perfil</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Apellido</label>
          <input
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Edad</label>
          <input
            name="edad"
            type="number"
            value={form.edad}
            onChange={handleChange}
            min="0"
          />
        </div>

        <button type="submit" disabled={estado.guardando}>
          {estado.guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {estado.mensaje && <p className="mensaje-exito">{estado.mensaje}</p>}
      {estado.error && <p className="mensaje-error">{estado.error}</p>}
    </div>
  );
};

export default GestorUsuarios;