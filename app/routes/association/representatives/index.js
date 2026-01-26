import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  getVertegenwoordigers,
  logAPIError,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class AssociationRepresentativesRoute extends Route {
  @service currentSession;
  @service store;

  async model() {
    const association = this.modelFor('association');

    return {
      association,
      dataPromise: this.loadData(association),
    };
  }

  async loadData(association) {
    const kboNumber = await this.loadKboNumber(association);
    const vertegenwoordigers = [];

    let isApiUnavailable = false;

    /*
      At the moment only organizations with an agreement can make API calls, so the isApiUnavailable flag would always be true and never switch to false.
      This confuses users, so we only do this call for users who can edit.
      The downside is that users won't know if their data is out of date, but the sync should only last a few minutes anyway.
    */
    if (this.currentSession.canEditVerenigingsregisterData) {
      try {
        vertegenwoordigers.push(...(await getVertegenwoordigers(association)));
      } catch (error) {
        isApiUnavailable = true;
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

  async loadKboNumber(association) {
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
