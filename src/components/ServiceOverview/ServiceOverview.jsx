import './ServiceOverview.css';
import { heroFeatures } from '../../constants/homeContent';

export const ServiceOverview = () => (
  <section className="service-grid">
    <div className="service-grid__intro">
      <p className="section-eyebrow">Servicio especializado</p>
      <h2>Servicios especializados que se refuerzan entre sí</h2>
      <p>
        Desde MetaMapa contamos con una variedad de servicios, ademas de administradores verificados para que los hechos sean lo mas veridicos posibles.
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
