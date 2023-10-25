import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service currentSession;
  @service session;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    size: { refreshModel: true },
    page: { refreshModel: true },
    activities: { refreshModel: true },
    status: { refreshModel: true },
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

    const query = buildQuery(params, include);
    const [associations, activities, organizationStatus] = await Promise.all([
      this.store.query('association', query),
      this.store.query('activity', { sort: 'label' }),
      this.store.query('organization-status-code', { sort: 'label' }),
    ]);

    return {
      associations,
      filters: {
        activities,
        organizationStatus,
      },
    };
  }
}

function buildQuery(params, include) {
  const query = {
    sort: params.sort ? `${params.sort},name` : 'name',
    page: { size: 20, number: params.page },
    include,
    filters: {},
  };

  if (params.activities !== '') {
    query.filters.activities = { ':id:': params.activities };
  }

  if (params.status !== '') {
    query.filters['organization-status'] = { ':id:': params.status };
  }

  return query;
}
