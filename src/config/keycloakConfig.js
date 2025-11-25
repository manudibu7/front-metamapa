const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL ?? 'http://localhost:8180/',
  realm: process.env.REACT_APP_KEYCLOAK_REALM ?? 'metamapa',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID ?? 'metamapa-frontend',
  redirectUri: window.location.origin,
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
};

export default keycloakConfig;
