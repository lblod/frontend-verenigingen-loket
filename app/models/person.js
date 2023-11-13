import Model, { attr } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr givenName;
  @attr familyName;
}
