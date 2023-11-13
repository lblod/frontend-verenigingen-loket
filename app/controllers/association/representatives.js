import Controller from '@ember/controller';
export default class AssociationLocationController extends Controller {
  get isLoading() {
    return this.model.members.isRunning;
  }

  get members() {
    return this.model.members.isFinished ? this.model.members.value : [];
  }

  get association() {
    return this.model.association.isFinished
      ? this.model.association.value
      : null;
  }
}
