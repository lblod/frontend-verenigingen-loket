import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type Association from 'frontend-verenigingen-loket/models/association';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';
import type SensitiveDataService from 'frontend-verenigingen-loket/services/sensitive-data';
import type StoreService from 'frontend-verenigingen-loket/services/store';
import {
  getVertegenwoordigers,
  logAPIError,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class AssociationRepresentativesRoute extends Route {
  @service declare currentSession: CurrentSessionService;
  @service declare currentAssociation: CurrentAssociationService;
  @service declare router: RouterService;
  @service declare sensitiveData: SensitiveDataService;
  @service declare store: StoreService;

  beforeModel() {
    if (
      this.sensitiveData.requiresReason(this.currentAssociation.association)
    ) {
      this.router.transitionTo('association.representatives.access-reason');
    }
  }

  model() {
    const association = this.currentAssociation.association;

    return {
      association,
      dataPromise: this.loadData(association),
    };
  }

  async loadData(association: Association) {
    const kboNumber = await this.loadKboNumber(association);
    const vertegenwoordigers = [];

    let isApiUnavailable = false;

    try {
      vertegenwoordigers.push(
        ...(await getVertegenwoordigers(
          association,
          this.sensitiveData.getReason(association),
        )),
      );
    } catch (error) {
      isApiUnavailable = true;
      if (error instanceof Error) {
        logAPIError(
          error,
          'Something went wrong when trying to reach the Verenigingsregister API',
        );
      }
    }

    return {
      vertegenwoordigers,
      kboNumber,
      isApiUnavailable,
    };
  }

  async loadKboNumber(association: Association) {
    const identifiers = await association.identifiers;

    // Find the KBO identifier
    for (const identifier of identifiers) {
      const structuredIdentifier = await identifier.structuredIdentifier;
      if (identifier.idName === 'KBO nummer') {
        return structuredIdentifier.localId;
      }
    }

    return null;
  }
}
