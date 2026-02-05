import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { RECOGNITION_STATUS, RECOGNITION_STATUS_URIS } from 'frontend-verenigingen-loket/models/recognition';

export default class StatusComponent extends Component {
  @service store;
  get getCurrentRecognitionStatus() {
    return this.recognitionStatus.perform(this.args.association);
  }

  recognitionStatus = task({ drop: true }, async (association) => {
    const recognitions = await this.store.query('recognition', {
      filter: {
        association: {
          id: association.id,
        },
      },
    });
    const isActive = recognitions.find((recognition) => recognition.status === RECOGNITION_STATUS_URIS.ACTIVE);
    if (isActive) {
      return RECOGNITION_STATUS.RECOGNIZED;
    }
    const isExpired = recognitions.find((recognition) => recognition.status === RECOGNITION_STATUS_URIS.EXPIRED);
    if (isExpired) {
      return RECOGNITION_STATUS.EXPIRED;
    }
    return;
  });
}
