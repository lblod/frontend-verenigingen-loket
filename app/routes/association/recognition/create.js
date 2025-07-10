import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AssociationRecognitionCreateRoute extends Route {
  @service currentRecognition;
  async model() {
    return this.currentRecognition.setCurrentRecognition(null);
  }
}
