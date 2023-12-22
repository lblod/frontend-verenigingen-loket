import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentRecognitionService extends Service {
  items = ['College van burgemeester en schepenen', 'Andere'];
  @tracked recognition = null;
  @tracked selectedItem = this.items[0];
  @tracked isLoading = false;

  @tracked recognitionModel = {
    startTime: null,
    endTime: null,
    dateDocument: null,
    awardedBy: null,
    legalResource: null,
  };
  setIsLoading(isLoading) {
    this.isLoading = isLoading;
  }

  async setCurrentRecognition(recognition) {
    this.isLoading = false;
    this.recognitionModel = {
      startTime: null,
      endTime: null,
      dateDocument: null,
      awardedBy: null,
      legalResource: null,
    };
    this.awardedBy = null;
    this.selectedItem = this.items[0];
    this.recognition = recognition;
    if (recognition) {
      this.recognitionModel.dateDocument = recognition.dateDocument ?? null;
      this.recognitionModel.startTime =
        await recognition.validityPeriod.get('startTime');
      this.recognitionModel.endTime =
        await recognition.validityPeriod.get('endTime');
      this.recognitionModel.legalResource = recognition.legalResource ?? null;
      this.recognitionModel.awardedBy = await recognition.awardedBy.get('name');
      this.selectedItem =
        this.recognitionModel.awardedBy === this.items[0]
          ? this.items[0]
          : this.items[1];
    }
  }
}
