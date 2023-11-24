import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class ActivityMultipleSelectComponent extends Component {
  @service router;
  @service store;

  @tracked typesQuery = '';
  @tracked types;

  constructor() {
    super(...arguments);
    this.typesQuery = this.router.currentRoute.queryParams.types;
    this.loadTypes.perform();
  }

  selectedTypes() {
    return this.typesQuery
      ? this.typesQuery
          .split(',')
          .map((id) => this.findTypeById(id))
          .filter(Boolean)
      : [];
  }

  findTypeById(id) {
    return this.types.find((type) => type.id === id);
  }

  @task
  *loadTypes() {
    const conceptScheme = yield this.store.findRecord(
      'concept-scheme',
      // id of concept scheme representing the types.
      'f3c67343-57f8-587e-89a8-afe88ccsc8',
    );

    this.types = yield conceptScheme.topConcept;
    this.args.onChange(this.selectedTypes());
  }
}
