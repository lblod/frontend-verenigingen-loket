import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { STATUS } from 'frontend-verenigingen-loket/models/recognition';

export default class StatusComponent extends Component {
  @service store;
  get getCurrentRecognitionStatus() {
    return this.recognitionStatus.perform(this.args.association);
  }

  recognitionStatus = task({ drop: true }, async (association) => {
    const recognitions = await this.store.query('recognition', {
      include: 'validity-period',
      filter: {
        ':has-no:status': true,
        association: {
          id: association.id,
        },
      },
    });
    let active = null;
    if (!recognitions) return active;
    const today = new Date();
    const taskPromise = new Promise((resolve) => {
      recognitions.forEach(async (recognition, index) => {
        const startTime = await recognition.validityPeriod.get('startTime');
        const endTime = await recognition.validityPeriod.get('endTime');
        if (!startTime || !endTime) {
          resolve(active);
        } else if (today >= new Date(startTime) && today <= new Date(endTime)) {
          active = STATUS.RECOGNIZED;
          resolve(active);
        } else if (
          active === null &&
          index == recognitions.length - 1 &&
          new Date(endTime) < today
        ) {
          active = STATUS.EXPIRED;
          resolve(active);
        }
      });
    });
    await taskPromise;
    return active;
  });
}
