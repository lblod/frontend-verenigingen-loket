import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AssociationRecognitionCreateController extends Controller {
  items = ['College van burgemeester en schepenen', 'Andere'];
  @service contactPoints;
  @tracked selectedItem = this.items[0];

  get isLoading() {
    return this.model.association.isRunning;
  }

  get association() {
    return this.model.association.isFinished
      ? this.model.association.value
      : null;
  }
}
