import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'frontend-verenigingen-loket/config/environment';

export default class ControllerLoginRoute extends Route {
  @service session;
  @service router;
  @service currentSession;
  @service store;
  queryParams = {
    page: {
      refreshModel: true,
    },
  };

  async beforeModel() {
    if (this.session.isAuthenticated) {
      await this.currentSession.load();
      if (!this.currentSession.roles?.includes(ENV.roleClaim)) {
        this.router.replaceWith('index');
      }
    } else {
      this.router.replaceWith('auth.callback');
    }
  }

  async model(params) {
    const filter = { provider: 'https://github.com/lblod/mock-login-service' };
    console.log('filter', filter);
    if (params.gemeente) filter.user = { 'family-name': params.gemeente };
    return await this.store.query('account', {
      include: 'user.groups',
      filter: filter,
      page: { size: 10, number: params.page },
      sort: 'user.family-name',
    });
  }
}
