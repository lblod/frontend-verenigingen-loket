import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';

export default class PostalCodeMultipleSelectComponent extends Component {
  @service store;

  postalCodes = trackedTask(this, this.loadPostalCodes);

  get selectedActivities() {
    let selectionArray = [];

    if (typeof this.args.selected === 'string' && this.args.selected.length) {
      const codes = this.args.selected.split(',');
      codes.forEach((code) => {
        const postalCode = this.findPostalByCode(code);
        if (postalCode) {
          selectionArray.push(postalCode);
        }
      });
    }
    if (selectionArray.length) {
      return selectionArray;
    }

    return this.args.selected;
  }

  findClassificationById(id) {
    if (this.activities.isRunning) {
      return null;
    }

    const activities = this.activities.value;
    return activities.find((activity) => activity.id === id);
  }

  @task
  *loadPostalCodes() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    return yield this.store.query('postal-code');
  }
}
