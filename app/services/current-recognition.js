import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentRecognitionService extends Service {
  items = ['College van burgemeester en schepenen', 'Andere'];
  @tracked recognition = null;
  @tracked awardedBy = null;
  @tracked selectedItem = this.items[0];

  async setCurrentRecognition(recognition) {
    this.recognition = recognition;
    this.awardedBy = await recognition.awardedBy.get('name');
    this.selectedItem =
      this.awardedBy === this.items[0] ? this.items[0] : this.items[1];
    console.log(this.selectedItem);
  }
}
