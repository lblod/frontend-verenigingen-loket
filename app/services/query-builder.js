import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import dateFormat from '../helpers/date-format';
import { ORGANIZATION_STATUS } from '../models/organization-status-code';
export default class QueryBuilderService extends Service {
  @service store;
  @service muSearch;

  buildAndExecuteQuery = task({ restartable: true }, async (params, size) => {
    const result = await this.muSearch.search(
      associationsQuery({
        index: 'associations',
        page: params.page || 0,
        params,
        size,
      }),
    );
    const associations = result.items.map((item) => {
      return { ...item.attributes, id: item.id };
    });
    associations.meta = { count: result.count };
    associations.meta.pagination = result.pagination;
    return associations;
  });
}

export const associationsQuery = ({
  index,
  page,
  params,
  size,
  distinct = true,
}) => {
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
      'activities.notation',
      params.activities,
    );
    const postalCodesQuery = generateFilterQuery(
      'primarySite.address.postcode',
      params.postalCodes,
    );
    const today = dateFormat(new Date(), 'YYY-MM-DD');

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

    if (params.recognition === 'Erkend') {
      addFilter(
        ':query:recognitions.validityPeriod',
        `((recognitions.validityPeriod.startTime:<=${today}) AND (recognitions.validityPeriod.endTime:>=${today})) OR (NOT (recognitions.validityPeriod.startTime:>${today}) AND (recognitions.validityPeriod.endTime:>${today}))`,
      );
      addFilter(':has:recognitions.validityPeriod.endTime', true);
    } else if (params.recognition === 'Verlopen') {
      addFilter(
        ':query:recognitions.validityPeriod',
        `(NOT ((recognitions.validityPeriod.startTime:<=${today}) AND (recognitions.validityPeriod.endTime:>=${today}))) AND NOT (recognitions.validityPeriod.startTime:>${today})`,
      );
      addFilter(':has:recognitions.validityPeriod.endTime', true);
    } else if (
      params.recognition === 'Erkend,Verlopen' ||
      params.recognition === 'Verlopen,Erkend'
    ) {
      // Filter out "upcoming" recognitions when both filters are selected
      addFilter(
        ':query:recognitions.validityPeriod',
        `((recognitions.validityPeriod.startTime:<=${today}) AND (recognitions.validityPeriod.endTime:>=${today})) OR ((recognitions.validityPeriod.startTime:<=${today}) AND (recognitions.validityPeriod.endTime:<=${today}))`,
      );
    }
    return filters;
  };
  const filters = generateQueryString(params);

  if (search) {
    const pattern = /^V\d{7}$/;
    if (pattern.test(search)) {
      filters['identifiers.structuredIdentifier.localId'] = search;
    } else {
      const sqs = search
        .split(' ')
        .map((str) => `(${str}*|${str})`)
        .join(' ');
      filters[
        ':sqs:name,primarySite.address.postcode,identifiers.structuredIdentifier.localId,activities.label'
      ] = encodeURIComponent(sqs);
    }
  }
  if (params) {
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
      filters[':gte:targetAudience.minimumLeeftijd'] = minAge;
      filters[':lt:targetAudience.maximumLeeftijd'] = maxAge;
    }
    if (params.types && params.types !== '') {
      filters['classification.uuid'] = params.types.split(',');
    }
    if (params.status) {
      filters['status_id'] = ORGANIZATION_STATUS.ACTIVE;
    }

    if (params.recognition && params.recognition !== '') {
      if (
        params.recognition === 'Erkend,Verlopen' ||
        params.recognition === 'Verlopen,Erkend'
      ) {
        filters[':has:recognitions.validityPeriod.endTime'] = true;
        filters[':has-no:recognitions.status'] = true;
      }
    }
    if (
      params.end &&
      params.start &&
      params.end !== '' &&
      params.start !== ''
    ) {
      filters[':gte:lastUpdated'] = params.start;
      filters[':lte:lastUpdated'] = params.end;
    }
  }
  request.page = page;
  request.size = size;
  request.sort = params.sort || '-createdOn';

  if (distinct) {
    request.collapseUuids = 't';
  }

  request.filters = filters;
  return request;
};
