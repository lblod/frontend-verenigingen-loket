import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class AssociationModel extends Model {
  @attr name;
  @attr description;
  @hasMany('identifier', { inverse: null, async: true }) identifiers;
  @belongsTo('site', { inverse: null, async: true }) primarySite;
}
