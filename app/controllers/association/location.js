import Controller from '@ember/controller';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
export default class AssociationLocationController extends Controller {
  @tracked showTableLoader = true;
  get getSites() {
    if (this.model.sites) {
      const sites = this.model.sites;
      const primarySite = this.model.primarySite;
      if (primarySite) {
        primarySite.address.isPrimary = true;
      }
      const mergedSites = A([primarySite, ...sites]);
      this.showTableLoader = false;
      return mergedSites;
    }
    return null;
  }

  combineFullAddress(address) {
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
}
