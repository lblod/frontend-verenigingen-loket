import Model, { attr } from '@warp-drive/legacy/model';
import type { Type } from '@warp-drive/core/types/symbols';

export default class SiteType extends Model {
  declare [Type]: 'site-type';

  @attr declare uri?: string;
  @attr declare label?: string;
}
