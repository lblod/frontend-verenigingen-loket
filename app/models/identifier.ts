import Model, { attr, belongsTo } from '@warp-drive/legacy/model';
import type { Type } from '@warp-drive/core/types/symbols';
import type StructuredIdentifier from './structured-identifier';

export default class IdentifierModel extends Model {
  declare [Type]: 'identifier';

  @attr declare idName: string;

  @belongsTo<StructuredIdentifier>('structured-identifier', {
    inverse: null,
    async: true,
  })
  declare structuredIdentifier: Promise<StructuredIdentifier>;
}
