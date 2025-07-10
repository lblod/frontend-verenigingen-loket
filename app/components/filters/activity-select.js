import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { CONCEPT_SCHEME } from '../../models/concept';

export default class ActivityMultipleSelectComponent extends Component {
  @service router;
  @service store;

  @tracked activities;

  constructor() {
    super(...arguments);
    this.loadActivities.perform();
  }

  loadActivities = task({ drop: true }, async () => {
    this.activities = await this.store.query('concept', {
      'filter[top-concept-of][:id:]': CONCEPT_SCHEME.ACTIVITIES,
      sort: 'pref-label',
      'page[size]': 1000, // TODO: This is a temporary workaround, remove this once we have a better UI solution
    });
  });
}
