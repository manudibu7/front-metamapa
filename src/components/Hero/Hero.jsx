import { useNavigate } from 'react-router-dom';
import './Hero.css';
import { useAuth } from '../../hooks/useAuth';

export const Hero = ({ onExplore, onLogin, isAuthenticated }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <section className="hero">
      <div className="hero__badge">Plataforma de hechos georreferenciados</div>
      <h1>MetaMapa</h1>
      <p className="hero__slogan">Hechos bien derechos</p>
      <p>
        MetaMapa es una plataforma colaborativa para registrar, visualizar y gestionar hechos 
        georreferenciados con consenso verificable. Conectamos fuentes de información, 
        contribuciones ciudadanas y colecciones curadas en un único panel descentralizado.
      </p>
      <div className="hero__cta">
        {isAuthenticated ? (
          <button className="btn btn--primary" onClick={onExplore}>
            Explorar colecciones
          </button>
        ) : (
          <button className="btn btn--primary" onClick={onLogin}>
            Ingresar
          </button>
        )}
        <button className="btn btn--ghost" onClick={() => navigate('/contribuir')}>
          Cargar un hecho
        </button>
      </div>
      <button type="button" className="btn btn--ghost" onClick={() => navigate('/hechos')}>
            Busqueda Avanzada de HECHOS
          </button>
      {isAuthenticated && isAdmin && (
        <div className="hero__admin">
          <button className="btn btn--admin" onClick={() => navigate('/admin')}>
            👑 Acciones de administrador
          </button>
        </div>
      )}
    </section>
  );
};
