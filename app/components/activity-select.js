import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ActivityMultipleSelectComponent extends Component {
  @service router;
  @service store;

  @tracked activitiesQuery = '';
  @tracked selected = [];
  @tracked activities;

  constructor() {
    super(...arguments);
    this.activitiesQuery = this.router.currentRoute.queryParams.activities;
    this.loadActivities.perform();
  }

  @action
  onChange(selectedActivities) {
    this.selected = selectedActivities;
    this.args.onChange(selectedActivities);
  }

  selectedActivities() {
    return this.activitiesQuery
      ? this.activitiesQuery
          .split(',')
          .map((id) => this.findActivityById(id))
          .filter(Boolean)
      : [];
  }

  findActivityById(id) {
    return this.activities.find((activity) => activity.id === id);
  }

  @task
  *loadActivities() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details

    yield Promise.resolve();
    this.activities = yield this.store.query('activity', {
      sort: 'label',
    });
    this.selected = this.selectedActivities();
  }
}
