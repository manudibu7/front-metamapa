import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Keycloak from 'keycloak-js';
import keycloakConfig from '../config/keycloakConfig';

const AuthContext = createContext({
  isAuthenticated: false,
  loading: true,
  user: null,
  contribuyenteId: null,
  token: null,
  login: () => {},
  logout: () => {},
});

const buildUserProfile = (tokenParsed) => {
  if (!tokenParsed) return null;
  return {
    id: tokenParsed.sub,
    username: tokenParsed.preferred_username ?? tokenParsed.email ?? tokenParsed.name ?? tokenParsed.sub,
    name:
      tokenParsed.name ??
      ((`${tokenParsed.given_name ?? ''} ${tokenParsed.family_name ?? ''}`.trim() || tokenParsed.preferred_username)),
    email: tokenParsed.email ?? null,
  };
};

export const AuthProvider = ({ children }) => {
  const keycloakRef = useRef(null);
  if (!keycloakRef.current) {
    keycloakRef.current = new Keycloak(keycloakConfig);
  }
  const keycloak = keycloakRef.current;
  const hasInitializedRef = useRef(false);
  const [state, setState] = useState({
    isAuthenticated: false,
    loading: true,
    user: null,
    contribuyenteId: null,
    token: null,
  });

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;
    let isActive = true;

    const initKeycloak = async () => {
      console.log('[Auth] 🔐 Iniciando Keycloak...');
      console.log('[Auth] Config:', {
        url: keycloakConfig.url,
        realm: keycloakConfig.realm,
        clientId: keycloakConfig.clientId,
      });
      console.log('[Auth] 🌐 URL actual:', window.location.href);
      console.log('[Auth] 🔍 Query params:', window.location.search);

      // Detectar si venimos del redirect de Keycloak
      const hasCodeInUrl = window.location.search.includes('code=') || window.location.hash.includes('code=');
      const onLoadStrategy = hasCodeInUrl ? 'login-required' : 'check-sso';
      
      console.log('[Auth] 🎯 Estrategia:', onLoadStrategy, '(hasCode:', hasCodeInUrl, ')');

      // Timeout de seguridad: si en 15 segundos no termina, forzar loading=false
      const timeoutId = setTimeout(() => {
        console.warn('[Auth] ⏱️ Timeout: Keycloak no respondió en 15s, desbloqueando UI');
        if (isActive) {
          setState({
            isAuthenticated: false,
            loading: false,
            user: null,
            contribuyenteId: null,
            token: null,
          });
        }
      }, 15000);

      try {
        console.log('[Auth] 🚀 Llamando a keycloak.init()...');
        const authenticated = await keycloak.init({
          onLoad: onLoadStrategy,
          flow: 'standard',
          pkceMethod: 'S256',
          responseMode: 'query',
          checkLoginIframe: false,
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
          enableLogging: true,
        });

        console.log('[Auth] 🎉 keycloak.init() completado!');
        console.log('[Auth] 🔍 isActive:', isActive);
        console.log('[Auth] 🔍 authenticated:', authenticated);
        
        clearTimeout(timeoutId);

        if (!isActive) {
          console.warn('[Auth] ⚠️ Componente inactivo, abortando');
          return;
        }

        console.log('[Auth] ✅ Keycloak inicializado, authenticated:', authenticated);
        console.log('[Auth] 🎫 Token presente:', !!keycloak.token);
        console.log('[Auth] 📋 Token parsed:', keycloak.tokenParsed);

        if (authenticated) {
          const user = buildUserProfile(keycloak.tokenParsed);
          console.log('[Auth] 👤 Usuario autenticado:', user);
          console.log('[Auth] 🆔 ContribuyenteId:', keycloak.tokenParsed?.contribuyenteId ?? keycloak.tokenParsed?.sub);
          
          // Limpiar la URL si tiene parámetros de Keycloak
          if (hasCodeInUrl) {
            console.log('[Auth] 🧹 Limpiando URL...');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          
          console.log('[Auth] 💾 Actualizando estado a autenticado...');
          setState({
            isAuthenticated: true,
            loading: false,
            user,
            contribuyenteId: keycloak.tokenParsed?.contribuyenteId ?? keycloak.tokenParsed?.sub ?? null,
            token: keycloak.token,
          });
          console.log('[Auth] ✨ Estado actualizado correctamente');
        } else {
          console.log('[Auth] 🔓 No hay sesión activa');
          setState((prev) => ({ ...prev, loading: false }));
        }

        keycloak.onTokenExpired = async () => {
          console.log('[Auth] 🔄 Token expirado, refrescando...');
          try {
            await keycloak.updateToken(30);
            if (!isActive) return;
            console.log('[Auth] ✅ Token refrescado');
            setState((prev) => ({
              ...prev,
              token: keycloak.token,
              contribuyenteId: keycloak.tokenParsed?.contribuyenteId ?? keycloak.tokenParsed?.sub ?? null,
              user: buildUserProfile(keycloak.tokenParsed),
            }));
          } catch (error) {
            console.error('[Auth] ❌ Token refresh failed', error);
            keycloak.login();
          }
        };
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('[Auth] ❌ Error inicializando Keycloak', error);
        setState({
          isAuthenticated: false,
          loading: false,
          user: null,
          contribuyenteId: null,
          token: null,
        });
      }
    };

    initKeycloak();

    return () => {
      isActive = false;
    };
  }, [keycloak]);

  const login = useCallback(() => {
    console.log('[Auth] 🔑 Redirigiendo a login de Keycloak...');
    keycloak.login({ redirectUri: window.location.href });
  }, [keycloak]);

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: window.location.origin });
    setState({
      isAuthenticated: false,
      loading: false,
      user: null,
      contribuyenteId: null,
      token: null,
    });
  }, [keycloak]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
