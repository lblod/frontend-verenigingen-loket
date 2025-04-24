import EmberRouter from '@ember/routing/router';
import ENV from 'frontend-verenigingen-loket/config/environment';
export default class Router extends EmberRouter {
  location = ENV.locationType;
  rootURL = ENV.rootURL;
}

Router.map(function () {
  // Auth
  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('login');
    this.route('logout');
    if (ENV.controllerLogin !== 'true') {
      this.route('switch');
    }
  });
  this.route('login');
  if (ENV.controllerLogin !== 'true') {
    if (ENV.acmidm.clientId === '{{OAUTH_API_KEY}}') {
      this.route('mock-login');
    }
    this.route('switch-login');
  } else {
    this.route('controller-login');
  }

  this.route('legal', { path: '/legaal' }, function () {
    this.route('accessibilitystatement', {
      path: '/toegangkelijkheidsverklaring',
    });
    this.route('cookiestatement', {
      path: '/cookieverklaring',
    });
    this.route('disclaimer');
  });

  // Association
  this.route('associations', { path: 'verenigingen' });
  this.route('association', { path: 'vereniging/:id' }, function () {
    this.route('general', { path: '/' });
    this.route('general', { path: '/algemeen' });
    this.route('contact-detail', { path: '/contactgegevens' });
    this.route('contact-edit', { path: '/contactgegevens/bewerk' });
    this.route('location');
    this.route('representatives');
    this.route('recognition', { path: 'erkenningen' }, function () {
      this.route('index', { path: '/' });
      this.route('show', { path: '/:recognition_id' });
      this.route('create', { path: '/aanmaken' });
      this.route('edit', { path: '/bewerk/:recognition_id' });
    });
  });

  this.route('404', {
    path: '/*wildcard',
  });
});
