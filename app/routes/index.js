import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class IndexRoute extends Route {
  @service currentSession;
  @service session;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    search: { refreshModel: true },
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
      sort: params.sort ? `${params.sort},name` : 'name',
      page: { size: 20, number: params.page },
      include,
    };

    const name = params.search.split(' ');
    const [firstName, ...lastName] = name;

    if (params.search && params.search !== '') {
      query.filter = {
        ':or:': {
          name: params.search,
          identifiers: {
            'structured-identifier': {
              'local-id': params.search,
            },
          },
          activities: {
            label: params.search,
          },
          members: {
            person: {
              ':exact:given-name': firstName,
              'family-name': name.length > 1 ? lastName.join(' ') : firstName,
            },
          },
        },
      };
    }
    const associations = await this.store.query('association', query);

    return associations;
  }
}
