'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'frontend-verenigingen-loket',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    pageSize: 50,
    controllerLogin: '{{CONTROLLER_LOGIN}}',
    appName: 'Verenigingen',
    contactEmail: 'verenigingen.abb@vlaanderen.be',
    environmentName: '{{ENVIRONMENT_NAME}}',
    roleClaim: '{{CONTROLLER_ROLECLAIM}}',
    acmidm: {
      clientId: '{{OAUTH_API_KEY}}',
      scope: '{{OAUTH_API_SCOPE}}',
      authUrl: '{{OAUTH_API_BASE_URL}}',
      logoutUrl: '{{OAUTH_API_LOGOUT_URL}}',
      authRedirectUrl: '{{OAUTH_API_REDIRECT_URL}}',
      switchRedirectUrl: '{{OAUTH_SWITCH_URL}}',
    },
    announcementMessage: '{{ANNOUNCEMENT_MESSAGE}}',
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
