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
    return yield this.store.findRecord('association', id);
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadSites(params) {
    const { id } = this.paramsFor('association');
    const model = yield this.store.query('association', {
      include: ['primary-site.address', 'primary-site.site-type'].join(','),
      filter: {
        id: id,
      },
    });

    const sites = yield this.store.query('site', {
      include: ['address', 'site-type'].join(','),
      filter: {
        associations: {
          id: id,
        },
      },
      sort: params.sort ? `${params.sort},address.street` : 'address.street',
    });
    if (model && model.length > 0) {
      const primarySite = yield model[0].get('primarySite');
      if (primarySite) {
        primarySite.address.isPrimary = true;
      }
      if (params.sort === '-address.full-address') {
        return A([...sites, primarySite]);
      } else {
        return A([primarySite, ...sites]);
      }
    } else {
      return sites;
    }
  }
}
