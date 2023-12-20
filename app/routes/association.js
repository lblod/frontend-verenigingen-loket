import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AssociationRoute extends Route {
  @service session;
  @service store;
  @service() currentAssociation;
  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'auth.login');
  }
  async model({ id }) {
    const model = await this.store.findRecord('association', id);
    this.currentAssociation.setAssociation(model);

    return model;
  }
}
