import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default class AssociationLocationRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model(params) {
    const { id } = this.paramsFor('association');
    const model = await this.store.findRecord('association', id);
    const sites = await this.store.query('site', {
      filter: {
        associations: {
          id: id,
        },
      },
      sort: params.sort ? `${params.sort},address.street` : 'address.street',
    });
    const primarySite = await model.get('primarySite');
    if (primarySite) {
      primarySite.address.isPrimary = true;
    }
    const mergedSites = A([primarySite, ...sites]);

    return {
      association: model,
      sites: mergedSites,
    };
  }
}
