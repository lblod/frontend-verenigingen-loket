import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class AssociationModel extends Model {
  @attr name;
  @attr description;
  @hasMany('identifier', { inverse: null, async: false }) identifiers;
  @hasMany('site', { inverse: null, async: false }) sites;
  @belongsTo('site', { inverse: null, async: false }) primarySite;
  @hasMany('contact-points', { inverse: null, async: false }) contactPoints;
}
