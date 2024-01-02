import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class AssociationRecognitionShowController extends Controller {
  @service() currentSession;
  get isLoading() {
    return this.model.recognition.isRunning;
  }

  get recognition() {
    return this.model.recognition.isFinished
      ? this.model.recognition.value
      : null;
  }
}
