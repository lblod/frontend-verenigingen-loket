import Route from '@ember/routing/route';
import { keepLatestTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
export default class AssociationGeneralRoute extends Route {
  @service session;
  @service store;
  async model() {
    const { id } = this.paramsFor('association');
    const association = await this.store.findRecord('association', id);
    return {
      association,
      recognitions: this.loadRecognition.perform(id),
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadRecognition(id) {
    return yield this.store.query('recognition', {
      include: ['awarded-by', 'validity-period'].join(','),
      filter: {
        association: {
          id: id,
        },
      },
      sort: `-validity-period.end-time`,
    });
  }
}
