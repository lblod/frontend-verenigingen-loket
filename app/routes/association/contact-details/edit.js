import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { TrackedArray } from 'tracked-built-ins';

export default class AssociationContactDetailsEditRoute extends Route {
  @service currentSession;
  @service contactPoints;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('association.contact-details');
    }
  }

  async model() {
    return {
      task: this.loadData.perform(),
    };
  }

  loadData = task({ keepLatest: true }, async () => {
    const { id } = this.paramsFor('association');

    const association = await this.store.findRecord('association', id);

    const contactPoints = await this.store.query('contact-point', {
      'filter[organization][:id:]': id,
      include: 'organization',
      page: { size: 100, number: 0 },
      sort: 'name',
    });

    return {
      association,
      contactPoints: new TrackedArray(contactPoints),
    };
  });
}
