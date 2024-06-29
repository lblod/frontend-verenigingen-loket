import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'frontend-verenigingen-loket/config/environment';
export default class MockLoginRoute extends Route {
  @service() session;
  @service() store;
  @service() currentSession;

  queryParams = {
    page: {
      refreshModel: true,
    },
  };

  async beforeModel() {
    if (this.session.isAuthenticated) {
      await this.currentSession.load();
      if (
        ENV.controllerLogin === 'true' &&
        !this.currentSession.roles?.includes(ENV.roleClaim)
      ) {
        this.session.prohibitAuthentication('index');
      }
      if (this.session.isMockLoginSession) {
        this.session.prohibitAuthentication('index');
      }
    }
  }

  async model(params) {
    const filter = { provider: 'https://github.com/lblod/mock-login-service' };
    if (params.gemeente) filter.user = { groups: params.gemeente };
    try {
      const accounts = await this.store.query('account', {
        include: 'user,user.groups',
        filter: filter,
        page: { size: 10, number: params.page },
        sort: 'user.family-name',
      });
      return accounts;
    } catch (error) {
      throw new Error('Something went wrong while fetching accounts', {
        cause: error,
      });
    }
  }
}
