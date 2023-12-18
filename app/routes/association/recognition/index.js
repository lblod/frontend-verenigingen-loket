import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
export default class AssociationRecognitionRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model(params) {
    const { id } = this.paramsFor('association');
    return {
      association: this.loadAssociation.perform(id),
      recognitions: this.loadRecognition.perform(id, params),
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadAssociation(id) {
    return yield this.store.findRecord('association', id);
  }
  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadRecognition(id, params) {
    return yield this.store.query('recognition', {
      include: ['awarded-by', 'validity-period'].join(','),
      filter: {
        association: {
          id: id,
        },
      },
      sort: params.sort
        ? `${params.sort},-validity-period.end-time`
        : '-validity-period.end-time',
    });
  }
}
