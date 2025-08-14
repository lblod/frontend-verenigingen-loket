import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class AssociationRepresentativesController extends Controller {
  @service contactPoints;
  @service currentSession;

  get isLoading() {
    return this.model.members.isRunning;
  }

  get members() {
    return this.model.members.isFinished ? this.model.members.value : [];
  }

  get association() {
    return this.model.association;
  }
}
