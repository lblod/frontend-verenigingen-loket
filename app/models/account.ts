import Model, { attr, belongsTo } from '@ember-data/model';
import { Type } from '@warp-drive/core-types/symbols';
import type User from './user';

export default class Account extends Model {
  declare [Type]: 'account';

  @attr declare voId: string;
  @attr declare provider: string;

  @belongsTo<User>('user', { inverse: null, async: true })
  declare user: Promise<User>;
}
