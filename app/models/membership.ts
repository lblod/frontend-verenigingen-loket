import Model, { attr, belongsTo } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import type Person from './person';
import type Role from './role';

export default class Membership extends Model {
  declare [Type]: 'membership';
  @attr declare isPrimary?: boolean;
  @attr declare internalId?: number;

  @belongsTo<Person>('person', { inverse: null, async: true })
  declare person: Promise<Person>;

  @belongsTo<Role>('role', { inverse: null, async: false })
  declare role: Promise<Role>;
}
