import Application from '@ember/application';
import { importSync, isDevelopingApp, macroCondition } from '@embroider/macros';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import ENV from 'frontend-verenigingen-loket/config/environment';
import { silenceEmptySyncRelationshipWarnings } from './utils/ember-data';

if (macroCondition(isDevelopingApp())) {
  importSync('./deprecation-workflow');
  silenceEmptySyncRelationshipWarnings();
}

export default class App extends Application {
  modulePrefix = ENV.modulePrefix;
  podModulePrefix = ENV.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, ENV.modulePrefix);
