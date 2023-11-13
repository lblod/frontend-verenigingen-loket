import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';

export default class IndexController extends Controller {
  @service store;
  @service router;

  @tracked page = 0;
  @tracked sort = 'name';
  @tracked search = '';

  queryParams = ['sort', 'page', 'search'];

  getVcode(identifier) {
    if (identifier.idName === 'vCode') {
      return identifier.structuredIdentifier.localId;
    }
  }

  get isLoading() {
    return this.model.associations.isRunning;
  }

  get associations() {
    return this.model.associations.isFinished
      ? this.model.associations.value
      : [];
  }

  @restartableTask
  *updateAssociationSearch(value) {
    yield timeout(500);
    this.page = 0;
    this.search = value.trimStart();
  }
}
