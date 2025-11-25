import { useState } from 'react';
import './Header.css';

export const Header = ({ onSearch, onLogin, onLogout, isAuthenticated, user }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch?.(trimmed);
  };

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden>
          ⟁
        </span>
        <div>
          <strong>MetaMapa</strong>
          <small>Instancia ONG</small>
        </div>
      </div>

      <form className="app-header__search" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Buscar hechos, colecciones o fuentes"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      <div className="app-header__actions">
        {isAuthenticated ? (
          <>
            <span className="app-header__user">{user?.name ?? user?.username ?? 'Cuenta'}</span>
            <button type="button" className="btn btn--ghost" onClick={onLogout}>
              Salir
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={onLogin}>
            Ingresar con Keycloak
          </button>
        )}
      </div>
    </header>
  );
};
