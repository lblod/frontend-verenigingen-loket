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
          .map((notation) => this.findActivityById(notation))
          .filter(Boolean)
      : [];
  }

  findActivityById(notation) {
    return this.activities.find((activity) => activity.notation === notation);
  }

  loadActivities = task({ drop: true }, async () => {
    const ACTIVITIES_CONCEPT_SCHEME = '6c10d98a-9089-4fe8-ba81-3ed136db0265';
    this.activities = await this.store.query('concept', {
      'filter[top-concept-of][:id:]': ACTIVITIES_CONCEPT_SCHEME,
      sort: 'pref-label',
      'page[size]': 1000, // TODO: This is a temporary workaround, remove this once we have a better UI solution
    });
    this.args.onChange(this.selectedActivities());
  });
}
