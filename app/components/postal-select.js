import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PostalCodeMultipleSelectComponent extends Component {
  @service router;
  @service store;

  @tracked postalCodesQuery;
  @tracked selected = [];
  @tracked postalCodes;

  constructor() {
    super(...arguments);
    this.postalCodesQuery = this.router.currentRoute.queryParams.postalCodes;
    this.loadPostalCodes.perform();
  }

  @action
  onChange(selectedPostalCodes) {
    this.selected = selectedPostalCodes;
    this.args.onChange(selectedPostalCodes);
  }

  selectedPostalCodes() {
    return this.postalCodesQuery
      ? this.postalCodesQuery
          .split(',')
          .map((code) => this.findPostalByCode(code))
          .filter(Boolean)
      : [];
  }

  findPostalByCode(code) {
    return this.postalCodes.find(
      (postalCode) => postalCode.postalCode === code,
    );
  }

  @task
  *loadPostalCodes() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    this.postalCodes = yield this.store.findAll('postal-code');
    this.selected = this.selectedPostalCodes();
  }
}
