import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class AssociationContactDetailsIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    return {
      task: this.loadAssociation.perform(params),
    };
  }

  loadAssociation = task({ keepLatest: true }, async ({ page, size, sort }) => {
    const { id } = this.paramsFor('association');

    const association = await this.store.findRecord('association', id, {
      include: ['primary-site.address'].join(','),
    });

    return {
      association,
      contactPoints: await this.store.query('contact-point', {
        'filter[organization][:id:]': id,
        page: { size, number: page },
        sort,
      }),
      correspondenceAddress: await this.findCorrespondenceAddress(association),
    };
  });

  async findCorrespondenceAddress(association) {
    // We have to check both the `primarySite` and `sites` relationships because primarySite records
    // aren't included in the `sites` relationship, but they could still be the correspondence address.
    const primarySite = await association.primarySite;
    const siteType = await primarySite.siteType;

    if (
      siteType?.uri ===
      'http://lblod.data.gift/concepts/9dd5b10d-719f-5207-bf39-ba09441fd590'
    ) {
      return primarySite;
    } else {
      return (
        await this.store.query('site', {
          'filter[associations][:id:]': association.id,
          'filter[site-type][:uri:]':
            'http://lblod.data.gift/concepts/9dd5b10d-719f-5207-bf39-ba09441fd590',
          page: { size: 1, number: 0 },
        })
      ).at(0);
    }
  }
}
