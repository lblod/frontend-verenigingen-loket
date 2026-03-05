import type { Adres, AdresIdentifier } from '../verenigingsregister';

export function isEmptyAdres(adres: Partial<Adres>) {
  return (
    !adres.straatnaam &&
    !adres.huisnummer &&
    !adres.busnummer &&
    !adres.postcode &&
    !adres.gemeente &&
    !adres.land
  );
}

export function clearAdresValues(adres: Partial<Adres & AdresIdentifier>) {
  adres.straatnaam = undefined;
  adres.huisnummer = undefined;
  adres.busnummer = undefined;
  adres.postcode = undefined;
  adres.gemeente = undefined;
  adres.land = undefined;
  adres.bronwaarde = undefined;
}

export const BELGIUM = 'België';
export function isAdresInBelgium(adres: Partial<Adres>) {
  return adres.land === BELGIUM;
}

export function isPostcodeInFlanders(adres: Partial<Adres>) {
  if (adres.land && adres.postcode) {
    const isPostcodeFourDigits = adres.postcode.match(/^\d{4}$/);

    const postcode = Number(adres.postcode);
    const isPostcodeWithinFlanders =
      (postcode >= 1500 && postcode <= 3999) ||
      (postcode >= 8000 && postcode <= 9999);

    return (
      isAdresInBelgium(adres) &&
      isPostcodeFourDigits &&
      isPostcodeWithinFlanders
    );
  }

  return false;
}
