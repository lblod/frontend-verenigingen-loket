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
    const conceptScheme = await this.store.findRecord(
      'concept-scheme',
      // id of concept scheme representing the types.
      '6c10d98a-9089-4fe8-ba81-3ed136db0265',
    );
    this.activities = await conceptScheme.topConcept;
    this.activities = await [...this.activities].sort(function (a, b) {
      return a.prefLabel.localeCompare(b.prefLabel);
    });
    this.args.onChange(this.selectedActivities());
  });
}
