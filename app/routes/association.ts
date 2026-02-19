import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type SessionService from 'ember-simple-auth/services/session';
import type ToasterService from '@appuniversum/ember-appuniversum/services/toaster';
import type Transition from '@ember/routing/transition';
import type Association from 'frontend-verenigingen-loket/models/association';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import type StoreService from 'frontend-verenigingen-loket/services/store';
import { hasApiAuthorization } from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class AssociationRoute extends Route {
  @service declare session: SessionService;
  @service declare store: StoreService;
  @service declare router: RouterService;
  @service declare toaster: ToasterService;
  @service declare currentAssociation: CurrentAssociationService;

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, 'auth.login');
  }

  async model({ id }: { id: string }) {
    try {
      const association = await this.store.findRecord<Association>(
        'association',
        id,
        {
          include: 'organization-status',
        },
      );

      if (association == null) {
        throw new Error(`Error loading association with id: (${id})`);
      }

      this.currentAssociation.setAssociation(association);

      let canViewRepresentatives = false;
      try {
        canViewRepresentatives = await hasApiAuthorization(association);
      } catch {
        canViewRepresentatives = false;
      }
      return {
        association,
        hasApiAuthorization: canViewRepresentatives,
      };
    } catch (error) {
      this.router.transitionTo('associations');
      this.toaster.error(
        `Er is geen vereniging gevonden met het id: ${id}`,
        'Niet gevonden',
        {
          timeOut: 4000,
        },
      );
      console.error(`Error loading association with id: (${id})`, error);
    }
  }
}
