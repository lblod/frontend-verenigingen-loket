import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { task } from 'ember-concurrency';

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

  loadAssociation = task({ keepLatest: true }, async () => {
    const { id } = this.paramsFor('association');
    return await this.store.findRecord('association', id);
  });

  loadSites = task({ keepLatest: true }, async (params) => {
    const { id } = this.paramsFor('association');
    const model = await this.store.query('association', {
      include: ['primary-site.address', 'primary-site.site-type'].join(','),
      filter: {
        id: id,
      },
    });

    const sites = await this.store.query('site', {
      include: ['address', 'site-type'].join(','),
      filter: {
        associations: {
          id: id,
        },
      },
      sort: params.sort ? `${params.sort},address.street` : 'address.street',
    });
    if (model && model.length > 0) {
      const primarySite = await model[0].get('primarySite');
      if (primarySite) {
        primarySite.address.isPrimary = true;
      }
      if (params.sort) {
        const key = params.sort.replace(/-([a-z])/g, (_, match) =>
          match.toUpperCase(),
        );
        const camelCaseKey = key.charAt(0).toLowerCase() + key.slice(1);
        return this.sortBy(
          [...sites, primarySite],
          camelCaseKey,
          params.sort.startsWith('-'),
        );
      }
      return A([primarySite, ...sites]);
    } else {
      return sites;
    }
  });

  sortBy = (array, key, reverse = false) => {
    return A(array).sort((a, b) => {
      const [mainKey, subKey] = key.split('.');
      const valueA = subKey ? a[mainKey].get(subKey) : a[mainKey];
      const valueB = subKey ? b[mainKey].get(subKey) : b[mainKey];
      if (valueA && valueB) {
        return reverse
          ? valueB.localeCompare(valueA)
          : valueA.localeCompare(valueB);
      }
    });
  };
}
