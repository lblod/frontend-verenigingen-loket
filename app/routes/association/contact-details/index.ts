import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';
import {
  findCorrespondenceLocatie,
  getContactgegevensFromVereniging,
  getLocatiesFromVereniging,
  getVerenigingDetails,
  logAPIError,
  type Contactgegeven,
  type Locatie,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class AssociationContactDetailsIndexRoute extends Route {
  @service declare currentAssociation: CurrentAssociationService;
  @service declare currentSession: CurrentSessionService;

  model() {
    return {
      task: this.loadData.perform(),
    };
  }

  loadData = task({ keepLatest: true }, async () => {
    const association = this.currentAssociation.association;

    let isApiUnavailable = false;
    const contactgegevens: Contactgegeven[] = [];
    let correspondenceLocatie: Locatie | undefined;
    let lastUpdated: string | undefined;

    try {
      const details = await getVerenigingDetails(association);
      const vereniging = details.vereniging;
      lastUpdated = details.metadata.datumLaatsteAanpassing;

      contactgegevens.push(...getContactgegevensFromVereniging(vereniging));
      const locaties = getLocatiesFromVereniging(vereniging);
      correspondenceLocatie = findCorrespondenceLocatie(locaties);
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
      association,
      contactgegevens,
      correspondenceLocatie,
      isApiUnavailable,
      lastUpdated,
    };
  });
}
