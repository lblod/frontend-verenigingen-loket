import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class AssociationRecognitionEditController extends Controller {
  @service currentRecognition;
  @service currentAssociation;

  get isLoading() {
    return this.model.association.isRunning;
  }

  get recognition() {
    return this.model.recognition?.isFinished
      ? this.model.recognition.value
      : null;
  }
}
