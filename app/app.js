import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import ENV from 'frontend-verenigingen-loket/config/environment';
export default class App extends Application {
  modulePrefix = ENV.modulePrefix;
  podModulePrefix = ENV.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, ENV.modulePrefix);
