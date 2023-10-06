import Controller from '@ember/controller';

export default class AssociationController extends Controller {
  combineFullAddress(address) {
    let fullAddress = [];

    const fullStreet = `${address.get('street') || ''} ${
      address.get('number') || ''
    } ${address.get('boxNumber') || ''}`.trim();

    if (fullStreet) fullAddress.push(fullStreet);

    const municipalityInformation = `
          ${address.get('postcode') || ''} ${address.get('municipality') || ''}
        `.trim();

    if (municipalityInformation) fullAddress.push(municipalityInformation);

    const countryInformation = `${address.get('country') || ''}`;

    if (countryInformation) fullAddress.push(countryInformation);

    if (fullAddress.length) {
      return fullAddress.join(', ');
    } else {
      return null;
    }
  }
}
