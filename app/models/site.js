import Model, { belongsTo, attr } from '@ember-data/model';

export default class SiteModel extends Model {
  @attr description;
  @belongsTo('address', { inverse: null, async: true }) address;
  @belongsTo('site-type', { inverse: null, async: true }) siteType;
}
