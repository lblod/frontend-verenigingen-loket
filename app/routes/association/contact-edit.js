import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class AssociationContactEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('association.contact-detail');
    }
  }

  async model() {
    return {
      association: this.loadAssociation.perform(),
    };
  }

  loadAssociation = task({ keepLatest: true }, async () => {
    const { id } = this.paramsFor('association');
    const include = ['contact-points', 'primary-site.address'].join(',');
    const query = {
      include,
    };
    return await this.store.findRecord('association', id, query);
  });
}
