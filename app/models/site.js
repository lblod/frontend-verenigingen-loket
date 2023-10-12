import Model, { belongsTo } from '@ember-data/model';

export default class SiteModel extends Model {
  @belongsTo('address', { inverse: null, async: false }) address;
  @belongsTo('site-type', { inverse: null, async: false }) siteType;
}
