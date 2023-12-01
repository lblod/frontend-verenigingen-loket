import Service, { inject } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';

export default class QueryBuilderService extends Service {
  @inject store;

  @keepLatestTask({ cancelOn: 'deactivate' })
  *buildAndExecuteQuery(params, include, size) {
    const { query, customQuery } = yield this.buildQuery(params, include, size);

    const result = yield this.store.query('association', {
      customQuery,
      ...query,
    });

    return result;
  }

  buildQuery(params, include, size = 20) {
    let customQuery = '';
    const query = {
      sort: params.sort ? `${params.sort},name` : 'name',
      page: { size, number: params.page },
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

    if (params.status !== '') {
      query.filters['organization-status'] = { ':id:': params.status };
    }

    if (params.types !== '') {
      query.filters.classification = { ':id:': params.types };
    }

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

    if (params.targetAudiences && params.targetAudiences !== '') {
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
        if (
          targetAudiences.includes('-18') &&
          targetAudiences.includes('18+')
        ) {
          maxAge = 65;
        }
        if (
          targetAudiences.includes('18+') &&
          targetAudiences.includes('65+')
        ) {
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
}
