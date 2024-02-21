import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class ActivityMultipleSelectComponent extends Component {
  @service router;
  @service store;

  @tracked activitiesQuery = '';
  @tracked activities;

  constructor() {
    super(...arguments);
    this.activitiesQuery = this.router.currentRoute.queryParams.activities;
    this.loadActivities.perform();
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

  loadActivities = task({ drop: true }, async () => {
    this.activities = await this.store.query('activity', {
      page: { size: 100 },
      sort: 'label',
    });
    this.args.onChange(this.selectedActivities());
  });
}
