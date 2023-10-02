import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MockLoginRoute extends Route {
  @service() session;
  @service() store;

  queryParams = {
    page: {
      refreshModel: true,
    },
  };

  async beforeModel() {
    await this.session.setup();
    this.session.prohibitAuthentication('index');
  }

  async model(params) {
    const filter = { provider: 'https://github.com/lblod/mock-login-service' };
    if (params.gemeente) filter.user = { groups: params.gemeente };
    const accounts = await this.store.query('account', {
      include: 'user,user.groups',
      filter: filter,
      page: { size: 10, number: params.page },
      sort: 'user.first-name',
    });
    console.log('accounts', accounts);
    return accounts;
  }
}
