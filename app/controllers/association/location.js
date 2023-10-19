import Controller from '@ember/controller';
import { A } from '@ember/array';
export default class AssociationLocationController extends Controller {
  get sites() {
    if (this.model.sites) {
      const sites = this.model.sites;
      const primarySite = this.model.primarySite;
      if (primarySite) {
        primarySite.address.isPrimary = true;
      }
      const mergedSites = A([primarySite, ...sites]);
      return mergedSites;
    }
    return null;
  }
}
