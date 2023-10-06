import Model, { attr, hasMany } from '@ember-data/model';

export default class AssociationModel extends Model {
  @attr name;
  @attr description;
  @hasMany('identifier', { inverse: null, async: true }) identifiers;
}
