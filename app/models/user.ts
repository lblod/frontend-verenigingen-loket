/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import Model, { attr, hasMany } from '@ember-data/model';
import { Type } from '@warp-drive/core-types/symbols';
import type Account from './account';
import type AdministrativeUnit from './administrative-unit';

export default class User extends Model {
  declare [Type]: 'user';

  @attr declare firstName: string;
  @attr declare familyName: string;

  @hasMany<Account>('account', { inverse: null, async: true })
  declare account: Promise<Account[]>;

  @hasMany<AdministrativeUnit>('administrative-unit', {
    inverse: null,
    async: true,
  })
  declare groups: Promise<AdministrativeUnit[]>;

  get group() {
    return this.get('groups.firstObject');
  }

  // used for mock login
  get fullName() {
    return `${this.firstName} ${this.familyName}`.trim();
  }
}
