import Model, { attr } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';

export default class Country extends Model {
  declare [Type]: 'country';

  @attr declare name?: string;
}
