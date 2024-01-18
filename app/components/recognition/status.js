import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class StatusComponent extends Component {
  get getCurrentRecognitionStatus() {
    return this.recognitionStatus.perform(this.args.recognitions);
  }

  recognitionStatus = task({ drop: true }, async (recognitions) => {
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
          active = 'Erkend';
          resolve(active);
        } else if (active === null && index == recognitions.length - 1) {
          active = 'Niet erkend';
          resolve(active);
        }
      });
    });
    await taskPromise;

    return active;
  });
}
