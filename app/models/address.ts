import Model, { attr } from '@warp-drive/legacy/model';
import type { Type } from '@warp-drive/core/types/symbols';

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

export function clearAddress(address: Address) {
  Object.assign(address, {
    street: undefined,
    number: undefined,
    boxNumber: undefined,
    postcode: undefined,
    municipality: undefined,
    addressRegisterUri: undefined,
    country: undefined,
    fullAddress: undefined,
  });
}

export const BELGIUM = 'België';
export function isAddressInBelgium(address: Address) {
  return address.country === BELGIUM;
}

export function isPostcodeInFlanders(address: Address) {
  if (address.country && address.postcode) {
    const isPostcodeFourDigits = address.postcode.match(/^\d{4}$/);

    const postcode = Number(address.postcode);
    const isPostcodeWithinFlanders =
      (postcode >= 1500 && postcode <= 3999) ||
      (postcode >= 8000 && postcode <= 9999);

    return (
      isAddressInBelgium(address) &&
      isPostcodeFourDigits &&
      isPostcodeWithinFlanders
    );
  }

  return false;
}
