// Code is a simplified version of the code we use in Loket: https://github.com/lblod/frontend-loket/blob/11a550537bb77ea8c9fb691d54ec9cd070a6d098/app/utils/rijksregisternummer.js
type NrnBirthDate = readonly [string, string, string];

export interface Nrn {
  birthDate: NrnBirthDate;
  serial: string;
  checksum: string;
}

type NrnInput = string | Nrn;

const mod97 = (input: string) =>
  String(97 - (Number(input) % 97)).padStart(2, '0');

/**
 *
 * @param nrn The normalized rijksregisternummer
 * @returns true if the checksum calculation is correct
 */
export function isValidRijksregisternummer(nrn: string) {
  if (!(typeof nrn === 'string' && nrn.trim().length > 0)) return false;

  if (nrn.length !== 11) {
    return false;
  }

  const { birthDate, serial, checksum } = parse(nrn);
  const preNillies =
    parseInt(checksum) === parseInt(mod97(`${birthDate.join('')}${serial}`));
  const postNillies =
    parseInt(checksum) === parseInt(mod97(`2${birthDate.join('')}${serial}`));

  return preNillies || postNillies;
}

function parse(nrn: NrnInput): Nrn {
  if (typeof nrn === 'string') {
    const normalizedNrn = normalize(nrn);
    const birthDateString = normalizedNrn.slice(0, 6); // Eg. '860814' from '86081441359'
    const birthDate: NrnBirthDate = [
      birthDateString.slice(0, 2),
      birthDateString.slice(2, 4),
      birthDateString.slice(4),
    ]; // Eg. ['86', '08', '14'] from '860814'
    const serial = normalizedNrn.slice(6, 9); // Eg. '413' from '86081441359'
    const checksum = normalizedNrn.slice(9, 11); // Eg. '59' from '86081441359'
    return { birthDate, serial, checksum };
  }
  if (typeof nrn === 'object') {
    return nrn;
  }
  throw new Error('Could not parse nrn of invalid type');
}

function normalize(nrn: NrnInput) {
  if (typeof nrn === 'string') {
    return nrn.replace(/[^\d]+/g, '');
  }
  if (typeof nrn === 'object') {
    return `${nrn.birthDate.join('')}${nrn.serial}${nrn.checksum}`;
  }
  throw new Error('Could not normalize nrn of invalid type');
}
