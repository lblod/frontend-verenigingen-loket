import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
export default class AssociationRecognitionCreateRoute extends Route {
  @service store;
  @service currentRecognition;
  async model(params) {
    const { recognition_id } = params;
    if (recognition_id !== '0') {
      const recognition = await this.loadRecognition.perform(recognition_id);
      this.currentRecognition.setCurrentRecognition(recognition);
    } else {
      this.currentRecognition.setCurrentRecognition(null);
    }
    return {
      association: this.loadAssociation.perform(),
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadAssociation() {
    const { id } = this.paramsFor('association');
    return yield this.store.findRecord('association', id, {});
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadRecognition(recognition_id) {
    return yield this.store.findRecord('recognition', recognition_id, {
      include: ['awarded-by', 'validity-period'].join(','),
    });
  }
}
