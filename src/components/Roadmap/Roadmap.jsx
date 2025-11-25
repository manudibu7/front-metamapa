import './Roadmap.css';
import { roadmapSteps } from '../../constants/homeContent';

export const Roadmap = () => (
  <section className="roadmap" id="roadmap">
    <div className="roadmap__header">
      <p className="section-eyebrow">Roadmap del TP Anual</p>
      <h2>Estado por entrega</h2>
    </div>
    <div className="roadmap__steps">
      {roadmapSteps.map((step) => (
        <article key={step.stage} className="roadmap-card">
          <header>
            <span>{step.stage}</span>
            <h3>{step.title}</h3>
          </header>
          <p>{step.details}</p>
        </article>
      ))}
    </div>
  </section>
);
