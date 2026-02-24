import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-verenigingen-loket/models/administrative-unit-classification-code';
import PowerSelect from 'ember-power-select/components/power-select';
import type Owner from '@ember/owner';
import type AdministrativeUnit from 'frontend-verenigingen-loket/models/administrative-unit';
import type StoreService from 'frontend-verenigingen-loket/services/store';

interface MunicipalitySelectByNameSignature {
  Args: {
    selected?: string;
    error?: boolean;
    id?: string;
    onChange: (municipality: string) => void;
  };
}

export default class MunicipalitySelectByName extends Component<MunicipalitySelectByNameSignature> {
  @service declare store: StoreService;

  constructor(owner: Owner, args: MunicipalitySelectByNameSignature['Args']) {
    super(owner, args);

    void this.loadMunicipalitiesTask.perform();
  }

  get options() {
    const lastTask = this.loadMunicipalitiesTask.last;

    if (!lastTask) {
      // We explicitly return undefined instead of null, because the PowerSelect types don't support `null`
      return undefined;
    }

    return lastTask;
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

    municipalities = await this.store.query<AdministrativeUnit>(
      'administrative-unit',
      query,
    );

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
        @options={{this.options}}
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
