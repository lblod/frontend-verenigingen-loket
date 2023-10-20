import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, task, timeout } from 'ember-concurrency';

export default class IndexController extends Controller {
  @service store;
  @service router;

  @tracked page = 0;
  @tracked size = 20;
  @tracked sort = 'name';
  @tracked search = '';
  @tracked model;

  queryParams = ['sort', 'page', 'search'];

  getVcode(identifier) {
    if (identifier.idName === 'vCode') {
      return identifier.structuredIdentifier.localId;
    }
  }

  @task
  *queryStore() {
    const filter = {};
    if (this.search) {
      filter.name = this.search;
    }
    const associations = yield this.store.query('association', {
      filter: filter,
      page: { size: this.size, number: this.page },
      sort: this.sort,
    });
    return associations;
  }

  @restartableTask
  *updateAssociationSearch(value) {
    yield timeout(500);
    this.page = 0;
    this.search = value;

    this.model = yield this.queryStore.perform();
  }
}
