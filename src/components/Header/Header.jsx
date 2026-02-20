import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../context/NavigationContext';
import { useAuthContext } from '../../context/AuthContext';
import './Header.css';

export const Header = ({ onSearch, onLogin, onLogout, isAuthenticated, user }) => {
  const { perfil } = useAuthContext();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Dropdown de usuario (escritorio)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Menú hamburguesa (móvil)
  
  const menuRef = useRef(null);

  const { modoNavegacion, toggleModo } = useNavigation();

  const handleSearch = (event) => {
    event.preventDefault();
    const textoBusqueda = query.trim();
    navigate(`/hechos?q=${encodeURIComponent(textoBusqueda)}`);
    setIsMobileMenuOpen(false); // Cerrar menú móvil al buscar
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  useEffect(() => {
      if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
  }, [isMobileMenuOpen]);

  return (

     <>
     <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
    <header className="app-header">
      
      <Link to="/" className="app-header__brand">
        <span className="app-header__logo" aria-hidden>
          <img src={"/image.png"} alt='logo' width={'20px'} height={'20px'} />
        </span>
        <div>
          <strong>MetaMapa</strong>
        </div>
      </Link>

      <form className="app-header__search" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Buscar hechos"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button onClick={handleSearch} type="submit">Buscar</button>
      </form>

      {/* Botón de Hamburguesa (Solo visible en móviles) */}
      <button 
        className="hamburger-menu" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Menú"
      >
        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
      </button>

      {/* Contenedor de Acciones (Oculto en móvil a menos que se abra el menú) */}
      <div className={`app-header__actions ${isMobileMenuOpen ? 'app-header__actions--mobile-open' : ''}`}>
        <div className="toggle-wrapper">
          <span className="toggle-label">Navegacion Curada:</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={modoNavegacion === 'CURADA'}
              onChange={toggleModo}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {isAuthenticated ? (
          <div className="user-menu-container" ref={menuRef}>
            <button
              className="user-menu-trigger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="app-header__user">
                {perfil ? `${perfil.nombre} ${perfil.apellido}` : user?.name || user?.username || 'Usuario'}
              </span>
              <span className="arrow-icon">▼</span>
            </button>

            {/* El Dropdown */}
            {(isMenuOpen || isMobileMenuOpen) && (
              <div className="dropdown-menu">
                <div className="dropdown-header-mobile">
                  {perfil ? `${perfil.nombre} ${perfil.apellido}` : user?.name}
                </div>
                <Link
                  to="/mis-contribuciones"
                  className="dropdown-item"
                  onClick={() => { setIsMenuOpen(false); setIsMobileMenuOpen(false); }}
                >
                  Mis Contribuciones
                </Link>
                <Link
                  to="/perfil"
                  className="dropdown-item"
                  onClick={() => { setIsMenuOpen(false); setIsMobileMenuOpen(false); }}
                >
                  Editar perfil
                </Link>
                <button
                  type="button"
                  className="dropdown-item dropdown-item--danger"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            type="button" 
            className="btn btn--ghost" 
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogin();
            }}
          >
            Ingresar
          </button>
        )}
      </div>
    </header>
    </>
  );
};