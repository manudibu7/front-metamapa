import './ServiceOverview.css';
import { heroFeatures } from '../../constants/homeContent';

export const ServiceOverview = () => (
  <section className="service-grid">
    <div className="service-grid__intro">
      <p className="section-eyebrow">Arquitectura modular</p>
      <h2>Servicios especializados que se refuerzan entre sí</h2>
      <p>
        Loader estático, loader dinámico, loader proxy, servicio agregador, API pública, API administrativa y
        estadísticas trabajan en paralelo para garantizar disponibilidad.
      </p>
    </div>
    <div className="service-grid__cards">
      {heroFeatures.map((feature) => (
        <article key={feature.title} className="feature-card">
          <span className="feature-card__icon" aria-hidden>
            {feature.icon}
          </span>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </article>
      ))}
    </div>
  </section>
);
