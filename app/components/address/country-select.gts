import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import PowerSelect from 'ember-power-select/components/power-select';
import type StoreService from 'frontend-verenigingen-loket/services/store';
import type Country from 'frontend-verenigingen-loket/models/country';

interface CountrySelectSignature {
  Args: {
    id: string;
    selected?: string;
    onChange: (country: string) => void;
  };
}

export default class CountrySelect extends Component<CountrySelectSignature> {
  @service declare store: StoreService;

  searchCountriesTask = restartableTask(async (search: string = '') => {
    await timeout(500);

    const query: Record<string, string> = {
      sort: 'name',
    };

    if (search.trim() !== '') {
      query['filter[name]'] = search;
    }

    const countries = await this.store.query<Country>('country', query);
    return countries.map((n) => n.name);
  });

  <template>
    <PowerSelect
      @allowClear={{false}}
      @loadingMessage="Aan het laden..."
      @noMatchesMessage="Geen resultaten"
      @onChange={{@onChange}}
      @search={{this.searchCountriesTask.perform}}
      @searchEnabled={{true}}
      @searchMessage="Typ om te zoeken"
      @selected={{@selected}}
      @triggerId={{@id}}
      as |country|
    >
      {{country}}
    </PowerSelect>
  </template>
}
