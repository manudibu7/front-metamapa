import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../context/NavigationContext';
import { useAuthContext } from '../../context/AuthContext';
import './Header.css';


export const Header = ({ onSearch, onLogin, onLogout, isAuthenticated, user}) => {
  const { perfil } = useAuthContext();
  const [query, setQuery] = useState(''); 
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado del menú
  const menuRef = useRef(null); // Referencia para detectar clics fuera

  const { modoNavegacion, toggleModo } = useNavigation();
  
  const handleSearch = (event) => {
    event.preventDefault(); 
    
    const textoBusqueda = query.trim();
    
    navigate(`/hechos?q=${encodeURIComponent(textoBusqueda)}`);
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

  return (
    <header className="app-header">
      <Link to="/" className="app-header__brand">
        <span className="app-header__logo" aria-hidden>
          <img src={"/image.png"} alt='logo' width={'20px'} height={'20px'}></img>
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
        <button onClick={handleSearch}  type="submit">Buscar</button>
      </form>      
      <div className="app-header__actions">
        <div className="toggle-wrapper">
             <span className="toggle-label">
                Navegacion Curada: 
            </span>
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
                 {perfil? `${perfil.nombre} ${perfil.apellido}`: user?.name || user?.username || 'Usuario'}
              </span>
              <span className="arrow-icon">▼</span>
            </button>

            {/* El Dropdown (solo se renderiza si isMenuOpen es true) */}
            {isMenuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header-mobile">
                  {perfil? `${perfil.nombre} ${perfil.apellido}`: user?.name}
                </div>
                <Link 
                  to="/mis-contribuciones" 
                  className="dropdown-item"
                  onClick={() => setIsMenuOpen(false)} // Cerrar al navegar
                >
                  Mis Contribuciones
                </Link>
                <Link 
                  to="/perfil" 
                  className="dropdown-item"
                  onClick={() => setIsMenuOpen(false)} // Cerrar al navegar
                >
                  Editar perfil
                </Link>
                <button 
                  type="button" 
                  className="dropdown-item dropdown-item--danger" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={onLogin}>
            Ingresar
          </button>
        )}
      </div>
      
    </header>
  );
};
