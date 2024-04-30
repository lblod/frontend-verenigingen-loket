import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr givenName;
  @attr familyName;
  @belongsTo('site', { inverse: null, async: true }) site;
  @hasMany('contact-point', { inverse: null, async: true }) contactPoints;
}
