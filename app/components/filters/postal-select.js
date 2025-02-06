import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class PostalSelect extends Component {
  @service store;

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
