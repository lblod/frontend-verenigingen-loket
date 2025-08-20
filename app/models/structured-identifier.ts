import Model, { attr } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';

export default class StructuredIdentifier extends Model {
  declare [Type]: 'structured-identifier';

  @attr declare localId: string;
}
