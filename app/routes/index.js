import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service session;
  @service router;
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated) {
      this.router.transitionTo('associations');
    }
  }
}
