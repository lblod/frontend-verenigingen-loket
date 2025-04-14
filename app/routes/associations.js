import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'frontend-verenigingen-loket/config/environment';

export const PAGE_SIZE = ENV.pageSize ?? 50;
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
    organizationStatus: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    try {
      const exportFile = (
        await this.store.query('file', {
          filter: {
            ':exact:subject':
              'http://data.lblod.info/datasets/verenigingen-loket-organisations-dump',
          },
          sort: '-created',
        })
      )[0];
      const associations = this.queryBuilder.buildAndExecuteQuery.perform(
        params,
        PAGE_SIZE,
      );

      return {
        exportFile,
        associations,
        PAGE_SIZE,
      };
    } catch (error) {
      throw new Error('Something went wrong while fetching associations', {
        cause: error,
      });
    }
  }
}
