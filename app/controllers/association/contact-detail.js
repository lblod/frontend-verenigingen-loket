import Controller from '@ember/controller';
import { service } from '@ember/service';
export default class AssociationContactDetailController extends Controller {
  @service contactPoints;
  get isLoading() {
    return this.model.association.isRunning;
  }

  get association() {
    return this.model.association.isFinished
      ? this.model.association.value
      : null;
  }
}
