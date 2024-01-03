import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class PostalCodeMultipleSelectComponent extends Component {
  @service router;
  @service store;

  @tracked postalCodesQuery;
  @tracked postalCodes;

  constructor() {
    super(...arguments);
    this.postalCodesQuery = this.router.currentRoute.queryParams.postalCodes;
    this.loadPostalCodes.perform();
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
    this.postalCodes = yield this.store.query('postal-code', {
      page: { size: 100 },
    });
    this.args.onChange(this.selectedPostalCodes());
  }

  searchMethod(term, select) {
    return select.options.filter(
      (item) =>
        item.postalCode.includes(term) || item.postalName.includes(term),
    );
  }
}
