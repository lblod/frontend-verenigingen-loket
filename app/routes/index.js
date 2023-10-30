import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class IndexRoute extends Route {
  @service currentSession;
  @service session;
  @service store;

  queryParams = {
    size: { refreshModel: true },
    page: {
      refreshModel: true,
    },
  };

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'auth.login');
  }
  async model(params) {
    const include = [
      'primary-site.address',
      'identifiers.structured-identifier',
      'organization-status',
      'activities',
    ].join(',');
    const query = {
      sort: params.sort ?? 'name',
      page: { size: 20, number: params.page },
      include,
    };
    return this.store.query('association', query).then((results) => {
      return {
        associations: results,
        meta: results.meta,
      };
    });
  }
}
