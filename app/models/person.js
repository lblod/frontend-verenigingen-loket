import Model, { attr, belongsTo } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr givenName;
  @attr familyName;
  @belongsTo('site', { inverse: null, async: true }) site;
}
