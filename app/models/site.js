import Model, { belongsTo, attr, hasMany } from '@ember-data/model';

export default class SiteModel extends Model {
  @attr description;
  @belongsTo('address', { inverse: null, async: true }) address;
  @belongsTo('site-type', { inverse: null, async: true }) siteType;
  @hasMany('contact-point', { inverse: null, async: true }) contactPoints;
}
