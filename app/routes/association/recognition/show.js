import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';

export default class AssociationRecognitionShowRoute extends Route {
  @service store;
  async model(params) {
    const { recognition_id } = params;

    try {
      return {
        recognition: this.loadRecognition.perform(recognition_id),
      };
    } catch (error) {
      console.error(`Error loading recognition (${recognition_id}):`, error);
    }
  }
  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadRecognition(recognition_id) {
    return yield this.store.findRecord('recognition', recognition_id, {
      include: ['awarded-by', 'validity-period'].join(','),
    });
  }
}
