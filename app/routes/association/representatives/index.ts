import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type AssociationRoute from 'frontend-verenigingen-loket/routes/association';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';
import type SensitiveDataService from 'frontend-verenigingen-loket/services/sensitive-data';
import type StoreService from 'frontend-verenigingen-loket/services/store';
import type { ModelFrom } from 'frontend-verenigingen-loket/type-utils/model-from';

export default class AssociationRepresentativesRoute extends Route {
  @service declare currentSession: CurrentSessionService;
  @service declare currentAssociation: CurrentAssociationService;
  @service declare router: RouterService;
  @service declare sensitiveData: SensitiveDataService;
  @service declare store: StoreService;

  beforeModel() {
    const { hasApiAuthorization } = this.modelFor('association') as NonNullable<
      ModelFrom<AssociationRoute>
    >;

    if (
      hasApiAuthorization &&
      this.currentSession.hasApiClient &&
      this.sensitiveData.requiresReason(this.currentAssociation.association)
    ) {
      this.router.transitionTo('association.representatives.access-reason');
    }
  }

  model() {
    const association = this.currentAssociation.association;
    const { kboNumber, hasApiAuthorization } = this.modelFor(
      'association',
    ) as NonNullable<ModelFrom<AssociationRoute>>;

    return {
      association,
      kboNumber,
      hasApiAuthorization,
    };
  }
}
