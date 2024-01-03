import Route from '@ember/routing/route';
import { keepLatestTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import dateFormat from '../../helpers/date-format';
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
    const today = dateFormat.compute([new Date(), 'YYY-MM-DD']);
    const [currentRecognition, lastRecognition] = yield Promise.all([
      this.getRecognition(id, today),
      this.getRecognition(id),
    ]);
    if (currentRecognition.length > 0) return currentRecognition;
    return lastRecognition;
  }
  async getRecognition(id, date) {
    const query = {
      include: ['awarded-by', 'validity-period'].join(','),
      filter: {
        association: {
          id,
        },
      },
      sort: `-validity-period.end-time`,
    };
    if (date) {
      query.filter['validity-period'] = {
        ':lte:start-time': date,
        ':gte:end-time': date,
      };
    }
    return await this.store.query('recognition', query);
  }
}
