import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { keepLatestTask } from 'ember-concurrency';
export default class IndexRoute extends Route {
  @service currentSession;
  @service session;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    search: { refreshModel: true },
    size: { refreshModel: true },
    page: { refreshModel: true },
    activities: { refreshModel: true },
    status: { refreshModel: true },
    postalCodes: { refreshModel: true },
    types: { refreshModel: true },
    targetAudiences: { refreshModel: true },
    start: { refreshModel: true },
    end: { refreshModel: true },
  };

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'auth.login');
  }

  async model(params) {
    return { associations: this.loadAssociations.perform(params) };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadAssociations(params) {
    const include = [
      'target-audience',
      'primary-site.address',
      'identifiers.structured-identifier',
      'organization-status',
      'activities',
    ].join(',');

    const { query, customQuery } = buildQuery(params, include);

    const name = params.search.split(' ');
    const [firstName, ...lastName] = name;

    if (params.search && params.search !== '') {
      query.filter = {
        ':or:': {
          name: params.search,
          identifiers: {
            'structured-identifier': {
              'local-id': params.search,
            },
          },
          activities: {
            label: params.search,
          },
          members: {
            person: {
              ':exact:given-name': firstName,
              'family-name': name.length > 1 ? lastName.join(' ') : firstName,
            },
          },
        },
      };
    }

    const associations = yield this.store.query('association', {
      customQuery,
      ...query,
    });

    return associations;
  }
}

function buildQuery(params, include) {
  let customQuery = '';
  const query = {
    sort: params.sort ? `${params.sort},name` : 'name',
    page: { size: 20, number: params.page },
    include,
    filters: {},
  };

  if (params.postalCodes !== '') {
    const postalCodes = params.postalCodes.split(',');
    let postalCodeQuery = postalCodes.map(
      (code) => `filter[:or:][primary-site][address][postcode]=${code}`,
    );
    customQuery += postalCodeQuery.join('&');
  }

  if (params.activities !== '') {
    query.filters.activities = { ':id:': params.activities };
  }

  if (params.types !== '') {
    query.filters.classification = { ':id:': params.types };
  }

  if (params.status !== '') {
    query.filters['organization-status'] = { ':id:': params.status };
  }

  if (params.end !== '' && params.start !== '') {
    query.filter = {
      ':gte:last-updated': params.start,
      ':lte:last-updated': params.end,
    };
  }

  if (params.targetAudiences !== '') {
    const targetAudiences = params.targetAudiences.split(',');
    let minAge = 0;
    let maxAge = 100;
    if (targetAudiences.length === 1) {
      if (targetAudiences.includes('-18')) {
        maxAge = 18;
      }
      if (targetAudiences.includes('18+')) {
        minAge = 18;
        maxAge = 65;
      }
      if (targetAudiences.includes('65+')) {
        minAge = 65;
      }
    } else if (targetAudiences.length === 2) {
      if (targetAudiences.includes('-18') && targetAudiences.includes('18+')) {
        maxAge = 65;
      }
      if (targetAudiences.includes('18+') && targetAudiences.includes('65+')) {
        minAge = 18;
      }
    }
    query.filters['target-audience'] = {
      ':gte:minimum-leeftijd': minAge,
      ':lt:maximum-leeftijd': maxAge,
    };
  }

  return { query, customQuery };
}
