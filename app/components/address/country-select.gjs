import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import PowerSelect from 'ember-power-select/components/power-select';

export default class CountrySelect extends Component {
  @service store;

  searchCountriesTask = restartableTask(async (search = '') => {
    await timeout(500);

    const query = {
      sort: 'name',
    };

    if (search.trim() !== '') {
      query['filter[name]'] = search;
    }

    const countries = await this.store.query('country', query);
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
