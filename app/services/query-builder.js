import Service, { inject } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import dateFormat from '../helpers/date-format';
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

  buildQuery(params, include, size = 50) {
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

    if (params.end !== '' && params.start !== '') {
      query.filter = {
        ':gte:last-updated': params.start,
        ':lte:last-updated': params.end,
      };
    }

    if (params.status !== '') {
      const today = dateFormat.compute([new Date(), 'YYY-MM-DD']);
      console.log(params.status);
      if (params.status === 'Erkend') {
        query.filters['recognitions'] = {
          'validity-period': {
            ':lte:start-time': today,
            ':gte:end-time': today,
          },
        };
      } else if (params.status === 'Niet erkend') {
        customQuery += [
          `filter[:or:][recognitions][validity-period][:lte:end-time]=${today}`,
          `filter[:or:][recognitions][validity-period][:gte:start-time]=${today}`,
        ].join('&');
      } else {
        query.filters['recognitions'] = {
          'validity-period': {
            ':has:end-time': true,
          },
        };
      }
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
