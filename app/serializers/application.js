import JSONAPIPaginationSerializer from './json-api-pagination';

export default class ApplicationSerializer extends JSONAPIPaginationSerializer {
  serializeAttribute(snapshot, json, key, attributes) {
    if (key !== 'uri')
      super.serializeAttribute(snapshot, json, key, attributes);
  }
}
