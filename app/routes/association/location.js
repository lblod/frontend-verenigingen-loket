import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AssociationLocationRoute extends Route {
  @service store;
  async model() {
    const { id } = this.paramsFor('association');
    const include = [
      'primary-site.site-type',
      'primary-site.address',
      'identifiers.structured-identifier',
      'sites.site-type',
      'sites.address',
    ].join(',');
    const query = {
      include,
    };
    return this.store.findRecord('association', id, query);
  }
}
