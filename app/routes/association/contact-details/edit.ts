import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  findCorrespondenceLocatie,
  getContactgegevensFromVereniging,
  getLocatiesFromVereniging,
  getVerenigingDetails,
  type Adres,
  type AdresIdentifier,
  type Contactgegeven,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';
import type RouterService from '@ember/routing/router-service';
import type StoreService from 'frontend-verenigingen-loket/services/store';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';
import { trackedArray } from '@ember/reactive/collections';

export default class AssociationContactDetailsEditRoute extends Route {
  @service declare currentSession: CurrentSessionService;
  @service declare currentAssociation: CurrentAssociationService;
  @service declare router: RouterService;
  @service declare store: StoreService;

  beforeModel() {
    if (!this.currentSession.hasApiClient) {
      this.router.transitionTo('association.contact-details');
    }
  }

  model() {
    return {
      dataPromise: this.loadData(),
    };
  }

  async loadData() {
    const association = this.currentAssociation.association;

    const vereniging = (await getVerenigingDetails(association)).vereniging;
    const contactgegevens = getContactgegevensFromVereniging(vereniging).map(
      (contactgegeven) => {
        return new TrackedData<Partial<Contactgegeven>>(contactgegeven, {
          isNew: false,
        });
      },
    );

    const locaties = getLocatiesFromVereniging(vereniging);
    const correspondenceLocatie = findCorrespondenceLocatie(locaties);
    let adres: TrackedData<Partial<Adres & AdresIdentifier>>;

    if (correspondenceLocatie) {
      adres = new TrackedData(
        {
          ...correspondenceLocatie.adres,
          ...correspondenceLocatie.adresId,
        },
        { isNew: false },
      );
    } else {
      adres = new TrackedData({});
    }

    return {
      contactgegevens: trackedArray(contactgegevens),
      locatie: correspondenceLocatie,
      adres,
    };
  }
}
