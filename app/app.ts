import '@warp-drive/ember/install';
import Application from '@ember/application';
import { importSync, isDevelopingApp, macroCondition } from '@embroider/macros';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'frontend-verenigingen-loket/config/environment';
import { silenceEmptySyncRelationshipWarnings } from './utils/ember-data';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';

if (macroCondition(isDevelopingApp())) {
  importSync('./deprecation-workflow');
  silenceEmptySyncRelationshipWarnings();
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;

  inspector = setupInspector(this);
}

loadInitializers(App, config.modulePrefix);
