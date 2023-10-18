/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import Model, { attr, hasMany } from '@ember-data/model';

export default class UserModel extends Model {
  @attr firstName;
  @attr familyName;
  @hasMany('account', { inverse: null, async: true }) account;
  @hasMany('administrative-unit', { inverse: null, async: true }) groups;

  get group() {
    return this.get('groups.firstObject');
  }

  // used for mock login
  get fullName() {
    return `${this.firstName} ${this.familyName}`.trim();
  }
}
