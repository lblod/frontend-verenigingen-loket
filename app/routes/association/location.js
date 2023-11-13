import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { keepLatestTask } from 'ember-concurrency';

export default class AssociationLocationRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model(params) {
    return {
      association: this.loadAssociation.perform(),
      sites: this.loadSites.perform(params),
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadAssociation() {
    const { id } = this.paramsFor('association');
    const model = yield this.store.findRecord('association', id);

    return model;
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadSites(params) {
    const { id } = this.paramsFor('association');
    const model = yield this.store.findRecord('association', id);

    const sites = yield this.store.query('site', {
      filter: {
        associations: {
          id: id,
        },
      },
      sort: params.sort ? `${params.sort},address.street` : 'address.street',
    });
    const primarySite = yield model.get('primarySite');
    if (primarySite) {
      primarySite.address.isPrimary = true;
    }
    return A([primarySite, ...sites]);
  }
}
