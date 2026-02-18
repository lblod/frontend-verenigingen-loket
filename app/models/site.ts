import Model, { belongsTo, attr, hasMany } from '@warp-drive/legacy/model';
import type { Type } from '@warp-drive/core/types/symbols';
import type Address from './address';
import type ContactPoint from './contact-point';
import type SiteType from './site-type';

export default class Site extends Model {
  declare [Type]: 'site';

  @attr declare description?: string;
  @attr declare internalId?: string;

  @belongsTo<Address>('address', { inverse: null, async: true })
  declare address: Promise<Address>;

  @belongsTo<SiteType>('site-type', { inverse: null, async: true })
  declare siteType: Promise<SiteType>;

  @hasMany<ContactPoint>('contact-point', { inverse: null, async: true })
  declare contactPoints: Promise<ContactPoint[]>;
}
