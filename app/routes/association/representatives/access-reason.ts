import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type AssociationRoute from 'frontend-verenigingen-loket/routes/association';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';
import type SensitiveDataService from 'frontend-verenigingen-loket/services/sensitive-data';
import type { ModelFrom } from 'frontend-verenigingen-loket/type-utils/model-from';

export default class AssociationRepresentativesAccessReasonRoute extends Route {
  @service declare currentAssociation: CurrentAssociationService;
  @service declare currentSession: CurrentSessionService;
  @service declare sensitiveData: SensitiveDataService;
  @service declare router: RouterService;

  beforeModel() {
    const { hasApiAuthorization } = this.modelFor('association') as NonNullable<
      ModelFrom<AssociationRoute>
    >;

    if (
      this.sensitiveData.hasProvidedReason(
        this.currentAssociation.association,
      ) ||
      !hasApiAuthorization ||
      !this.currentSession.hasApiClient
    ) {
      this.router.transitionTo('association.representatives.index');
    }
  }
}
