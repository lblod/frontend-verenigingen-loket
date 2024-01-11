import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';

export default class AssociationRecognitionEditRoute extends Route {
  @service store;
  @service router;
  @service toaster;
  @service currentRecognition;
  async model(params) {
    const { recognition_id } = params;

    try {
      const recognition = await this.loadRecognition.perform(recognition_id);
      if (recognition[0] == null) {
        throw new Error(`Recognition data not found for id: ${recognition_id}`);
      }
      this.currentRecognition.setCurrentRecognition(recognition[0]);
    } catch (error) {
      this.router.transitionTo('association.recognition.index');
      this.toaster.error(
        `Er is geen erkenning gevonden met het id: ${recognition_id}`,
        'Niet gevonden',
        {
          timeOut: 4000,
        },
      );
      console.error(`Error loading recognition (${recognition_id}):`, error);
    }
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadRecognition(recognition_id) {
    return yield this.store.query('recognition', {
      filter: {
        id: recognition_id,
        ':has-no:status': true,
      },
      include: ['awarded-by', 'validity-period'].join(','),
    });
  }
}
