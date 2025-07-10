import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AssociationRoute extends Route {
  @service session;
  @service store;
  @service router;
  @service toaster;
  @service() currentAssociation;
  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'auth.login');
  }
  async model({ id }) {
    try {
      const model = await this.store.findRecord('association', id, {
        include: 'organization-status',
      });
      if (model == null) {
        throw new Error(`Error loading association with id: (${id})`);
      }
      this.currentAssociation.setAssociation(model);

      return model;
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
