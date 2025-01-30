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

  searchMethod(term, select) {
    return select.options.filter(
      (item) =>
        item.prefLabel.toLowerCase().includes(term.toLowerCase()) ||
        item.notation.toLowerCase().includes(term.toLowerCase()),
    );
  }

  findTypeById(id) {
    return this.types.find((type) => type.id === id);
  }

  loadTypes = task({ drop: true }, async () => {
    const TYPES_CONCEPT_SCHEME = 'f3c67343-57f8-587e-89a8-afe88ccsc8';
    this.types = await this.store.query('concept', {
      'filter[top-concept-of][:id:]': TYPES_CONCEPT_SCHEME,
      'page[size]': 1000, // TODO: This is a temporary workaround, remove this once we have a better UI solution
    });

    this.args.onChange(this.selectedTypes());
  });
}
