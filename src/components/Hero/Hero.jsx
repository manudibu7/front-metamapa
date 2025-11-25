import './Hero.css';

export const Hero = ({ onExplore, onLogin, isAuthenticated }) => {
  return (
    <section className="hero">
      <div className="hero__badge">MetaMapa · ONG Data Mesh</div>
      <h1>
        Información geolocalizada
        <span> con consenso verificable</span>
      </h1>
      <p>
        Panel unificado para visualizar hechos, gestionar colecciones y gobernar solicitudes en cada instancia
        descentralizada.
      </p>
      <div className="hero__cta">
        {isAuthenticated ? (
          <button className="btn btn--primary" onClick={onExplore}>
            Ir al tablero
          </button>
        ) : (
          <button className="btn btn--primary" onClick={onLogin}>
            Ingresar con Keycloak
          </button>
        )}
        <button className="btn btn--ghost" onClick={onExplore}>
          Explorar colecciones
        </button>
      </div>
    </section>
  );
};
