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
    const conceptScheme = await this.store.findRecord(
      'concept-scheme',
      // id of concept scheme representing the types.
      'f3c67343-57f8-587e-89a8-afe88ccsc8',
    );

    this.types = await conceptScheme.topConcept;
    this.args.onChange(this.selectedTypes());
  });
}
