import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
export default class AssociationRecognitionController extends Controller {
  @service() currentAssociation;
  @tracked sort = '-validity-period.end-time';

  get isLoading() {
    return this.model.recognitions.isRunning;
  }

  get recognitions() {
    return this.model.recognitions.isFinished
      ? this.model.recognitions.value
      : null;
  }
}
