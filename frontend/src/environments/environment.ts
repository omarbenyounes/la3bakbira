export const environment = {
  /** API calls are relative: the dev server (proxy.conf.mjs) or nginx forwards /api to the gateway. */
  apiUrl: '/api',
  keycloak: {
    url: 'http://localhost:8180',
    realm: 'la3bakbira',
    clientId: 'la3bakbira-frontend',
  },
};
