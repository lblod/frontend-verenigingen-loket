import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-verenigingen-loket/models/administrative-unit-classification-code';
import PowerSelect from 'ember-power-select/components/power-select';

export default class MunicipalitySelectByNameComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadMunicipalitiesTask.perform();
  }

  loadMunicipalitiesTask = task(async () => {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    await Promise.resolve();

    let municipalities = [];

    const query = {
      filter: {
        classification: {
          id: CLASSIFICATION.MUNICIPALITY.id,
        },
      },
      sort: 'name',
      page: {
        size: 400,
      },
    };

    municipalities = await this.store.query('administrative-unit', query);

    return municipalities.map(({ name }) => name);
  });

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @allowClear={{false}}
        @searchEnabled={{true}}
        @loadingMessage="Aan het laden..."
        @noMatchesMessage="Geen resultaten"
        @searchMessage="Typ om te zoeken"
        @options={{this.loadMunicipalitiesTask.last}}
        @selected={{@selected}}
        @onChange={{@onChange}}
        @triggerId={{@id}}
        as |municipality|
      >
        {{municipality}}
      </PowerSelect>
    </div>
  </template>
}
