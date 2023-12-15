import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentRecognitionService extends Service {
  @tracked recognition;

  setCurrentRecognition(recognition) {
    this.recognition = recognition;
  }
}
