import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
export default class AssociationRecognitionController extends Controller {
  @service() currentAssociation;
  get isLoading() {
    return this.model.recognitions.isRunning;
  }

  get recognitions() {
    return this.model.recognitions.isFinished
      ? this.model.recognitions.value
      : null;
  }
}
