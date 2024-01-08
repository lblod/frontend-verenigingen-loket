import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AssociationsRoute extends Route {
  @service currentSession;
  @service session;
  @service store;
  @service queryBuilder;
  @service router;

  queryParams = {
    sort: { refreshModel: true },
    search: { refreshModel: true },
    size: { refreshModel: true },
    page: { refreshModel: true },
    activities: { refreshModel: true },
    status: { refreshModel: true },
    postalCodes: { refreshModel: true },
    types: { refreshModel: true },
    targetAudiences: { refreshModel: true },
    start: { refreshModel: true },
    end: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated) {
      this.router.transitionTo('associations');
    }
  }

  async model(params) {
    const include = [
      'target-audience',
      'primary-site.address',
      'identifiers.structured-identifier',
      'organization-status',
      'activities',
    ].join(',');

    return {
      associations: this.queryBuilder.buildAndExecuteQuery.perform(
        params,
        include,
      ),
    };
  }
}