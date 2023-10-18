import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AssociationRoute extends Route {
  @service store;
  model({ id }) {
    return this.store.findRecord('association', id);
  }
}
