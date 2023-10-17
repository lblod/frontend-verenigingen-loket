import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class AssociationContactDetailRoute extends Route {
  @service store;
  async model() {
    const { id } = this.paramsFor('association');
    const include = ['contact-point', 'primary-site.address'].join(',');
    const query = {
      include,
    };
    return this.store.findRecord('association', id, query);
  }
}
