import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
export default class AssociationContactDetailRoute extends Route {
  @service store;
  async model() {
    return {
      association: this.loadAssociation.perform(),
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadAssociation() {
    const { id } = this.paramsFor('association');
    const include = ['contact-points', 'primary-site.address'].join(',');
    const query = {
      include,
    };
    return yield this.store.findRecord('association', id, query);
  }
}
