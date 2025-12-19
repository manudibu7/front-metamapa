import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export const Header = ({ onSearch, onLogin, onLogout, isAuthenticated, user }) => {
  const [query, setQuery] = useState(''); 
  const navigate = useNavigate();
  //const [categoria, setCategoria] = useState('');

  const handleSearch = (event) => {
    event.preventDefault(); 
    
    const textoBusqueda = query.trim();
    
    navigate(`/hechos?q=${encodeURIComponent(textoBusqueda)}`);
  };

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
        {isAuthenticated ? (
          <>
            <span className="app-header__user">{user?.name ?? user?.username ?? 'Cuenta'}</span>
            <Link to="/mis-contribuciones" className="btn btn--ghost">
              Mis Contribuciones
            </Link>
            <button type="button" className="btn btn--ghost" onClick={onLogout}>
              Salir
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={onLogin}>
            Ingresar
          </button>
        )}
      </div>
    </header>
  );
};
