import EmberRouter from '@ember/routing/router';
import config from 'frontend-verenigingen-loket/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('legal', { path: '/legaal' }, function () {
    this.route('accessibilitystatement', {
      path: '/toegangkelijkheidsverklaring',
    });
    this.route('cookiestatement', {
      path: '/cookieverklaring',
    });
    this.route('disclaimer');
  });
  this.route('route-not-found', {
    path: '/*wildcard',
  });
});
