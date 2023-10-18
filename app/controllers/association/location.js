import Controller from '@ember/controller';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from '../../models/address';
export default class AssociationLocationController extends Controller {
  @tracked showTableLoader = true;
  get sites() {
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

  getFullAddress(address) {
    return combineFullAddress(address);
  }
}
