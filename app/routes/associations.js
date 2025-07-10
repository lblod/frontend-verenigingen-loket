import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'frontend-verenigingen-loket/config/environment';
import { CONCEPT_SCHEME } from '../models/concept';

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
    recognition: { refreshModel: true },
    postalCodes: { refreshModel: true },
    types: { refreshModel: true },
    targetAudiences: { refreshModel: true },
    start: { refreshModel: true },
    end: { refreshModel: true },
    status: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params, transition) {
    if (isRouteEnterTransition(transition, this)) {
      await this.loadQPRecords(params, transition);
    }

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

  async loadQPRecords(params, transition) {
    transition.data.selectedActivities = await Promise.all(
      params.activities.map(async (activityNotation) => {
        return (
          await this.store.query('concept', {
            'filter[top-concept-of][:id:]': CONCEPT_SCHEME.ACTIVITIES,
            'filter[:exact:notation]': activityNotation,
          })
        ).at(0);
      }),
    );

    transition.data.selectedPostalCodes = await Promise.all(
      params.postalCodes.map(async (postalCode) => {
        return (
          await this.store.query('postal-code', {
            'filter[postal-code]': postalCode,
          })
        ).at(0);
      }),
    );

    transition.data.selectedTypes = await Promise.all(
      params.types.map((typeId) => {
        return this.store.findRecord('concept', typeId);
      }),
    );
  }

  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);

    if (isRouteEnterTransition(transition, this)) {
      controller.selectedActivities = transition.data.selectedActivities;
      controller.selectedPostalCodes = transition.data.selectedPostalCodes;
      controller.selectedTypes = transition.data.selectedTypes;
    }
  }
}

function isRouteEnterTransition(transition, route) {
  return transition.from?.name !== route.fullRouteName;
}
