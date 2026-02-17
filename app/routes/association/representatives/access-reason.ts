import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import type SensitiveDataService from 'frontend-verenigingen-loket/services/sensitive-data';

export default class AssociationRepresentativesAccessReasonRoute extends Route {
  @service declare currentAssociation: CurrentAssociationService;
  @service declare sensitiveData: SensitiveDataService;
  @service declare router: RouterService;

  beforeModel() {
    if (
      this.sensitiveData.hasProvidedReason(this.currentAssociation.association)
    ) {
      this.router.transitionTo('association.representatives.index');
    }
  }
}
