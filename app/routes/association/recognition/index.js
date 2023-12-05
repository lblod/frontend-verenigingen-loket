import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
export default class AssociationRecognitionCreateRoute extends Route {
  @service store;
  async model() {
    return {
      association: this.loadAssociation.perform(),
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadAssociation() {
    const { id } = this.paramsFor('association');
    return yield this.store.findRecord('association', id, {});
  }
}
