import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'frontend-verenigingen-loket/config/environment';
export default class IndexRoute extends Route {
  @service session;
  @service router;
  @service currentSession;
  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated) {
      await this.currentSession.load();
      if (
        ENV.controllerLogin === 'true' &&
        this.currentSession.roles?.includes(ENV.roleClaim)
      ) {
        this.router.replaceWith('/controller-login');
      } else {
        this.router.transitionTo('associations');
      }
    }
  }
}
