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
      recognitions: this.loadRecognition.perform(id, params),
    };
  }
  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadRecognition(id, params) {
    return yield this.store.query('recognition', {
      include: ['awarded-by', 'validity-period'].join(','),
      filter: {
        ':has-no:status': true,
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
