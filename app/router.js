import EmberRouter from '@ember/routing/router';
import config from 'frontend-verenigingen-loket/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // Auth
  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });
  this.route('mock-login');

  // Association
  this.route('associations', { path: '/' }, function () {
    this.route('association', { path: 'vereniging/:id' }, function () {
      this.route('general', { path: '/' });
      this.route('general', { path: '/algemeen' });
      this.route('contact-detail');
      this.route('location');
      this.route('representatives');
    });
  });

  this.route('route-not-found', {
    path: '/*wildcard',
  });
});