import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import dateFormat from '../helpers/date-format';
export default class QueryBuilderService extends Service {
  @service store;
  @service muSearch;

  buildAndExecuteQuery = task(
    { restartable: true },
    async (params, include, size) => {
      if (
        !params.activities &&
        !params.types &&
        !params.targetAudiences &&
        !params.status &&
        !params.postalCodes &&
        !params.end &&
        !params.start &&
        !params.search
      ) {
        const associations = await this.store.query('association', {
          include,
          size,
          sort: params.sort
            ? params.sort === 'name'
              ? `${params.sort}`
              : `${params.sort},:no-case:name`
            : '-created-on,:no-case:name',
          page: { size, number: params.page },
        });
        return associations;
      }
      const associations = await this.filterBuilder(params);
      return associations;
    },
  );

  async filterBuilder(params) {
    const result = await this.muSearch.search(
      associationsQuery({
        index: 'associations',
        page: 0,
        params,
      }),
    );
    const associations = result.items.map((item) => {
      return { ...item.attributes, id: item.id };
    });
    return associations;
  }
}

const associationsQuery = ({ index, page, params }) => {
  const request = {};
  const search = params.search;
  request.index = index;

  const generateQueryString = (params) => {
    const filters = {};

    const generateFilterQuery = (key, values) => {
      if (!values) return '';
      return values
        .split(',')
        .map((value) => `${key}:${value}`)
        .join(' OR ');
    };

    const addFilter = (queryKey, filterQuery) => {
      if (filterQuery) {
        filters[queryKey] = filterQuery;
      }
    };

    const activitiesQuery = generateFilterQuery(
      'activities.uuid',
      params.activities,
    );
    const postalCodesQuery = generateFilterQuery(
      'primarySite.address.postcode',
      params.postalCodes,
    );
    const today = dateFormat.compute([new Date(), 'YYY-MM-DD']);

    if (activitiesQuery && postalCodesQuery) {
      addFilter(
        ':query:primarySite.address.postcode',
        `((${activitiesQuery}) AND (${postalCodesQuery}))`,
      );
    } else if (activitiesQuery) {
      addFilter(':query:activities.uuid', `(${activitiesQuery})`);
    } else if (postalCodesQuery) {
      addFilter(':query:primarySite.address.postcode', `(${postalCodesQuery})`);
    }

    if (params.status === 'Erkend') {
      addFilter(
        ':query:recognitions.validityPeriod',
        `((recognitions.validityPeriod.startTime:<=${today}) AND (recognitions.validityPeriod.endTime:>=${today}))`,
      );
      addFilter(':has:recognitions.validityPeriod.endTime', true);
    } else if (params.status === 'Verlopen') {
      addFilter(
        ':query:recognitions.validityPeriod',
        `(NOT ((recognitions.validityPeriod.startTime:<=${today}) AND (recognitions.validityPeriod.endTime:>=${today})))`,
      );
      addFilter(':has:recognitions.validityPeriod.endTime', true);
    }
    return filters;
  };
  const filters = generateQueryString(params);

  if (search) {
    filters[
      ':fuzzy:name,primarySite.address.postcode,identifiers.structuredIdentifier.localId,activities.label'
    ] = search;
  }

  if (params.targetAudiences && params.targetAudiences !== '') {
    const targetAudiences = params.targetAudiences.split(',');
    let minAge = 0;
    let maxAge = 500;
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
    filters[':gte:targetAudience.minimumLeeftijd'] = minAge;
    filters[':lt:targetAudience.maximumLeeftijd'] = maxAge;
  }
  if (params.types !== '') {
    filters['classification.uuid'] = params.types.split(',');
  }

  if (params.status !== '') {
    if (
      params.status === 'Erkend,Verlopen' ||
      params.status === 'Verlopen,Erkend'
    ) {
      filters[':has:recognitions.validityPeriod.endTime'] = true;
      filters[':has-no:recognitions.status'] = true;
    }
  }
  if (params.end !== '' && params.start !== '') {
    filters[':gte:lastUpdated'] = params.start;
    filters[':lte:lastUpdated'] = params.end;
  }

  request.page = page;
  request.size = 50;
  request.sort = params.sort;

  request.filters = filters;
  return request;
};
