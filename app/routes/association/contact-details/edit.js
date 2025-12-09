import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { TrackedArray } from 'tracked-built-ins';
import { findCorrespondenceAddressSite } from 'frontend-verenigingen-loket/utils/association';
import { isOutOfDate as isOutOfDateFn } from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class AssociationContactDetailsEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  async beforeModel() {
    let isOutOfDate = false;
    let isApiUnavailable = false;

    try {
      const association = this.modelFor('association');
      isOutOfDate = await isOutOfDateFn(association);
    } catch {
      isApiUnavailable = true;
    }

    if (
      !this.currentSession.canEditVerenigingsregisterData ||
      isOutOfDate ||
      isApiUnavailable
    ) {
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

    let site = await findCorrespondenceAddressSite(this.store, association);

    if (!site) {
      const address = this.store.createRecord('address');
      site = this.store.createRecord('site', {
        address,
      });
    }

    return {
      association,
      contactPoints: new TrackedArray(contactPoints),
      correspondenceAddressSite: site,
      correspondenceAddress: await site.address,
    };
  });
}
