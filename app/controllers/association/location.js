import Controller from '@ember/controller';
export default class AssociationLocationController extends Controller {
  get isLoading() {
    return this.model.sites.isRunning;
  }

  get sites() {
    return this.model.sites.isFinished ? this.model.sites.value : [];
  }

  get association() {
    return this.model.association.isFinished
      ? this.model.association.value
      : null;
  }
}
