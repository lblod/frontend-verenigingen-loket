import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class PostalSelect extends Component {
  @service store;
  @tracked selectedPostalCodes = [];

  constructor() {
    super(...arguments);
    this.loadSelectedPostalCodes.perform();
  }

  loadSelectedPostalCodes = task(async () => {
    this.selectedPostalCodes = await Promise.all(
      this.args.selected.map(async (postalCode) => {
        const result = await this.store.query('postal-code', {
          'filter[postal-code]': postalCode,
        });

        return result.at(0);
      }),
    );
  });

  searchPostalCodes = restartableTask(async (search) => {
    await timeout(300);

    return await this.store.query('postal-code', {
      filter: search,
    });
  });

  handleChange = (newSelection) => {
    this.selectedPostalCodes = newSelection;
    this.args.onChange?.(newSelection);
  };
}
