import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
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

  loadRecognition = task({ keepLatest: true }, async (id, params) => {
    return await this.store.query('recognition', {
      include: ['awarded-by', 'validity-period', 'file'].join(','),
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
  });
}
