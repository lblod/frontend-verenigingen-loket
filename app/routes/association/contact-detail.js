import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
export default class AssociationContactDetailRoute extends Route {
  @service store;
  async model() {
    return {
      association: this.loadAssociation.perform(),
    };
  }

  loadAssociation = task({ keepLatest: true }, async () => {
    const { id } = this.paramsFor('association');
    const include = ['contact-points', 'primary-site.address'].join(',');
    const query = {
      include,
    };
    return await this.store.findRecord('association', id, query);
  });
}
