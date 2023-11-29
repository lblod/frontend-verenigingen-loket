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

    return { query, customQuery };
  }
}
