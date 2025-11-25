import './Footer.css';

const sections = [
  {
    title: 'Servicios',
    items: ['Loader estático', 'Loader dinámico', 'Loader proxy', 'Servicio agregador'],
  },
  {
    title: 'APIs',
    items: ['API Pública', 'API Administrativa', 'Servicio Estadísticas', 'Observabilidad'],
  },
  {
    title: 'Recursos',
    items: ['Documentación', 'Diagramas', 'Keycloak Realm', 'Repositorio'],
  },
];

export const Footer = () => (
  <footer className="app-footer">
    <div className="app-footer__brand">
      <div className="app-footer__logo" aria-hidden>
        ⟁
      </div>
      <div>
        <strong>MetaMapa</strong>
        <p>TPA DDSI 2025 · Grupo 01</p>
      </div>
    </div>
    <div className="app-footer__grid">
      {sections.map((section) => (
        <div key={section.title}>
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="app-footer__meta">
      <span>© {new Date().getFullYear()} MetaMapa</span>
      <span>Instancia académica · No producción</span>
    </div>
  </footer>
);
