import Model, { attr } from '@ember-data/model';

export default class AddressModel extends Model {
  @attr number;
  @attr boxNumber;
  @attr street;
  @attr postcode;
  @attr municipality;
  @attr province;
  @attr addressRegisterUri;
  @attr country;
  @attr fullAddress;
}

export function combineFullAddress(address) {
  if (!address) return null;

  const fullStreet = [address.street, address.number, address.boxNumber]
    .filter(Boolean)
    .join(' ')
    .trim();

  const municipalityInformation = [address.postcode, address.municipality]
    .filter(Boolean)
    .join(' ')
    .trim();

  const countryInformation = address.country || '';

  const parts = [
    fullStreet,
    municipalityInformation,
    countryInformation,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : null;
}
