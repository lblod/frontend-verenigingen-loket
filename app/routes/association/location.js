import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default class AssociationLocationRoute extends Route {
  @service store;
  async model() {
    const { id } = this.paramsFor('association');
    const model = await this.store.findRecord('association', id);
    const sites = await model.get('sites');
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
