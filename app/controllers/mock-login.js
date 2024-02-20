import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
const DEBOUNCE_MS = 500;
export default class MockLoginController extends Controller {
  @service store;

  queryParams = ['gemeente', 'page'];
  @tracked model;
  @tracked gemeente = '';
  @tracked page = 0;
  size = 10;

  queryStore = task({ drop: true }, async () => {
    const filter = { provider: 'https://github.com/lblod/mock-login-service' };
    if (this.gemeente) {
      filter.user = {
        'family-name': this.gemeente,
      };
    }
    const accounts = await this.store.query('account', {
      include: 'user,user.groups',
      filter: filter,
      page: { size: this.size, number: this.page },
      sort: 'user.first-name',
    });
    return accounts;
  });

  callLogin = task({ drop: true }, async (loginFunction, account) => {
    const user = await account.user;
    const group = (await user.groups)[0];
    const groupId = (await group).id;
    loginFunction(account.id, groupId);
  });

  updateSearch = task({ restartable: true }, async (value) => {
    await timeout(DEBOUNCE_MS);
    this.page = 0;
    this.gemeente = value;

    this.model = await this.queryStore.perform();
  });
}
