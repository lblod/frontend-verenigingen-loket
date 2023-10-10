import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class IndexRoute extends Route {
  @service currentSession;
  @service session;
  @service store;
  queryParams = {
    sort: { refreshModel: true },
  };

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'auth.login');
  }
  async model(params) {
    const query = {
      sort: params.sort ?? 'name',
    };
    return this.store.query('association', query);
  }
}
