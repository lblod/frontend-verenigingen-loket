import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class IndexRoute extends Route {
  @service currentSession;
  @service session;
  @service store;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'auth.login');
  }
  async model() {
    const include = [
      'primary-site.address',
      'identifiers.structured-identifier',
    ].join(',');

    const query = {
      include,
    };
    return this.store.query('association', query);
  }
}
