import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import {
  getLocatiesFromVereniging,
  getVerenigingDetails,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class AssociationLocationRoute extends Route {
  @service declare currentAssociation: CurrentAssociationService;

  model() {
    return {
      dataPromise: this.loadData(),
    };
  }

  async loadData() {
    const details = await getVerenigingDetails(
      this.currentAssociation.association,
    );
    const locaties = getLocatiesFromVereniging(details.vereniging);

    return {
      lastUpdated: details.metadata.datumLaatsteAanpassing,
      locaties,
    };
  }
}
