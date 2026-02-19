import { JSONAPIAdapter } from '@warp-drive/legacy/adapter/json-api';

export default class ApplicationAdapter extends JSONAPIAdapter {
  urlForQuery(query) {
    if (query.customQuery) {
      let customQueryParam = query.customQuery;
      delete query.customQuery;
      return `${super.urlForQuery(...arguments)}?${customQueryParam}`;
    }
    delete query.customQuery;
    return super.urlForQuery(...arguments);
  }
}
