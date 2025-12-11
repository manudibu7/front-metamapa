import './Footer.css';

export const Footer = () => (
  <footer className="app-footer">
    <div className="app-footer__brand">
      <div className="app-footer__logo" aria-hidden>
        <img src={"/image.png"} alt='logo' height={'20px'} width={'20px'} ></img>
      </div>
      <div>
        <strong>MetaMapa</strong>
      </div>
    </div>
    <div className="app-footer__meta">
      <span>© {new Date().getFullYear()} MetaMapa</span>
      <span>todos los derechos reservados</span>
    </div>
  </footer>
);

//<div className="app-footer__grid">
//      {sections.map((section) => (
//        <div key={section.title}>
//          <h4>{section.title}</h4>
//          <ul>
//            {section.items.map((item) => (
//              <li key={item}>{item}</li>
//            ))}
//          </ul>
//        </div>
//      ))}
//    </div>