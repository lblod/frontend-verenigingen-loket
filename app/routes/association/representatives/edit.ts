import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type Association from 'frontend-verenigingen-loket/models/association';
import type CurrentSession from 'frontend-verenigingen-loket/services/current-session';
import { TrackedArray } from 'tracked-built-ins';
import type CurrentAssociation from 'frontend-verenigingen-loket/services/current-association';
import type SensitiveData from 'frontend-verenigingen-loket/services/sensitive-data';
import type Store from 'frontend-verenigingen-loket/services/store';
import {
  getVertegenwoordigers,
  logAPIError,
  type Vertegenwoordiger,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import TrackedData from 'frontend-verenigingen-loket/utils/tracked-data';

export default class AssociationRepresentativesEditRoute extends Route {
  @service declare currentAssociation: CurrentAssociation;
  @service declare currentSession: CurrentSession;
  @service declare sensitiveData: SensitiveData;
  @service declare store: Store;
  @service declare router: RouterService;

  beforeModel() {
    if (
      this.sensitiveData.requiresReason(this.currentAssociation.association)
    ) {
      this.router.transitionTo('association.representatives.access-reason');
    } else if (!this.currentSession.canEditVerenigingsregisterData) {
      this.router.transitionTo('association.representatives');
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
    let vertegenwoordigers: TrackedData<Vertegenwoordiger>[] = [];
    let isApiUnavailable = false;
    let originalPrimary: TrackedData<Vertegenwoordiger> | undefined;

    try {
      vertegenwoordigers = (
        await getVertegenwoordigers(
          association,
          this.sensitiveData.getReason(association),
        )
      ).map((vertegenwoordiger) => {
        return new TrackedData(vertegenwoordiger, { isNew: false });
      });

      originalPrimary = vertegenwoordigers.find(
        (vertegenwoordiger) => vertegenwoordiger.data.isPrimair,
      );

      if (vertegenwoordigers.length === 0) {
        vertegenwoordigers.push(new TrackedData({}));
      }
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
      vertegenwoordigers: new TrackedArray(vertegenwoordigers),
      originalPrimary,
      isApiUnavailable,
    };
  }
}
