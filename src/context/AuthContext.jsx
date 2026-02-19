import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Keycloak from 'keycloak-js';
import keycloakConfig from '../config/keycloakConfig';
import {syncKeycloakUser , obtenerMiPerfil} from '../services/contribuyentesService';

const AuthContext = createContext({
  isAuthenticated: false,
  loading: true,
  user: null,
  contribuyenteId: null,
  perfil: null,
  token: null,
  roles: [],
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

const extractRoles = (tokenParsed) => {
  if (!tokenParsed) return [];
  // Los roles pueden estar en realm_access.roles o en resource_access.{clientId}.roles
  const realmRoles = tokenParsed.realm_access?.roles ?? [];
  const resourceRoles = Object.values(tokenParsed.resource_access ?? {})
    .flatMap((resource) => resource.roles ?? []);
  return [...new Set([...realmRoles, ...resourceRoles])];
};

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
    perfil: null,
    token: null,
    roles: [],
    isAdmin: false,
  });
  
  const updatePerfil = useCallback((perfilActualizado) => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        name: `${perfilActualizado.nombre} ${perfilActualizado.apellido}`.trim(),
      },
    }));
  }, []);
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
            roles: [],
            isAdmin: false,
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
          const roles = extractRoles(keycloak.tokenParsed);
          const isAdmin = roles.includes('admin') || roles.includes('administrador') || roles.includes('ADMIN');
          console.log('[Auth] 👤 Usuario autenticado:', user);
          
          let contribuyenteId = null;
          let perfil = null;
          try {
            // Sincronizar con backend para obtener idSistema
            const syncResponse = await syncKeycloakUser(
              user.id, 
              keycloak.tokenParsed.given_name, 
              keycloak.tokenParsed.family_name
            );
            contribuyenteId = syncResponse.idSistema;
            perfil = await obtenerMiPerfil(user.id);
            console.log('[Auth] ✅ Usuario sincronizado. ID Sistema:', contribuyenteId);
          } catch (err) {
            console.error('[Auth] ❌ Error sincronizando usuario:', err);
            // Fallback: intentar usar el del token si existe, o null
            contribuyenteId = keycloak.tokenParsed?.contribuyenteId ?? null;
          }

          console.log('[Auth] 🆔 ContribuyenteId final:', contribuyenteId);
          console.log('[Auth] 🎭 Roles:', roles);
          console.log('[Auth] 👑 Es admin:', isAdmin);
          
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
            contribuyenteId,
            perfil,
            token: keycloak.token,
            roles,
            isAdmin,
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
          perfil: null,
          token: null,
          roles: [],
          isAdmin: false,
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
      perfil: null,
      token: null,
      roles: [],
      isAdmin: false,
    });
  }, [keycloak]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      updatePerfil,
    }),
    [state, login, logout, updatePerfil]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
