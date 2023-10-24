import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AssociationRoute extends Route {
  @service session;
  @service store;
  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'auth.login');
  }
  model({ id }) {
    return this.store.findRecord('association', id);
  }
}
