/**
 * Type declarations for
 *    import config from 'frontend-verenigingen-loket/config/environment'
 */
declare const config: {
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'hash' | 'none';
  rootURL: string;
  APP: Record<string, unknown>;

  // App specific
  pageSize: number;
  controllerLogin: string;
  appName: string;
  appVersion: string;
  contactEmail: string;
  environmentName: string;
  roleClaim: string;
  acmidm: {
    clientId: string;
    scope: string;
    authUrl: string;
    logoutUrl: string;
    authRedirectUrl: string;
    switchRedirectUrl: string;
  };
  announcementMessage: string;
  plausible: {
    domain: string;
    apiHost: string;
  };
};

export default config;
