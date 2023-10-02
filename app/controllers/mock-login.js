import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, task, timeout } from 'ember-concurrency';

export default class MockLoginController extends Controller {
  @service store;

  queryParams = ['gemeente', 'page'];
  @tracked model;
  @tracked gemeente = '';
  @tracked page = 0;
  size = 10;

  @task
  *queryStore() {
    const filter = { provider: 'https://github.com/lblod/mock-login-service' };
    if (this.gemeente) {
      filter.user = {
        'family-name': this.gemeente,
      };
    }
    const accounts = yield this.store.query('account', {
      include: 'user,user.groups',
      filter: filter,
      page: { size: this.size, number: this.page },
      sort: 'user.first-name',
    });
    return accounts;
  }

  @task
  *callLogin(loginFunction, account) {
    const user = yield account.user;
    const group = (yield user.groups)[0];
    const groupId = (yield group).id;
    loginFunction(account.id, groupId);
  }

  @restartableTask
  *updateSearch(value) {
    yield timeout(500);
    this.page = 0;
    this.gemeente = value;

    this.model = yield this.queryStore.perform();
  }
}
