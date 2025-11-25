import './CallToAction.css';

export const CallToAction = ({ onExplore }) => (
  <section className="cta">
    <h2>Listo para conectar los loaders y publicar la instancia</h2>
    <p>Configurá tus fuentes, definí los criterios de consenso y habilitá el SSO con un par de clicks.</p>
    <div className="cta__actions">
      <button className="btn btn--primary">Ir al Panel Administrativo</button>
      <button className="btn btn--ghost" onClick={onExplore}>
        Ver colecciones
      </button>
    </div>
  </section>
);
