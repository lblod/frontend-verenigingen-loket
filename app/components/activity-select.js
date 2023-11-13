import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';

export default class ActivityMultipleSelectComponent extends Component {
  @service store;

  activities = trackedTask(this, this.loadActivities);

  get selectedActivities() {
    let selectionArray = [];

    if (typeof this.args.selected === 'string' && this.args.selected.length) {
      const ids = this.args.selected.split(',');
      ids.forEach((id) => {
        const activity = this.findActivityById(id);
        if (activity) {
          selectionArray.push(activity);
        }
      });
    }
    if (selectionArray.length) {
      return selectionArray;
    }

    return this.args.selected;
  }

  findActivityById(id) {
    if (this.activities.isRunning) {
      return null;
    }

    const activities = this.activities.value;
    return activities.find((activity) => activity.id === id);
  }

  @task
  *loadActivities() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    return yield this.store.query('activity', {
      sort: 'label',
    });
  }
}
