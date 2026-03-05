import Model, { attr, belongsTo } from '@warp-drive/legacy/model';
import type { Type } from '@warp-drive/core/types/symbols';
import type Association from './association';

export default class ContactPoint extends Model {
  declare [Type]: 'contact-point';

  @attr declare type?: 'Primary' | null;
  @attr declare email?: string;
  @attr declare telephone?: string;
  @attr declare name?: string;
  @attr declare website?: string;
  @attr declare internalId?: string;

  @belongsTo<Association>('association', {
    async: false,
    inverse: 'contactPoints',
  })
  declare organization?: Association;
}
