import Model, { attr } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';

export default class Address extends Model {
  declare [Type]: 'address';

  @attr declare number?: string;
  @attr declare boxNumber?: string;
  @attr declare street?: string;
  @attr declare postcode?: string;
  @attr declare municipality?: string;
  @attr declare addressRegisterUri?: string;
  @attr declare country?: string;
  @attr declare fullAddress?: string;
}

export function isEmptyAddress(address: Address) {
  return (
    !address.number &&
    !address.boxNumber &&
    !address.street &&
    !address.postcode &&
    !address.municipality &&
    !address.country &&
    !address.fullAddress &&
    !address.addressRegisterUri
  );
}
