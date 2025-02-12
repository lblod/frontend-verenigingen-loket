import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentRecognitionService extends Service {
  @service store;

  @tracked recognition = null;
  @tracked selectedItem;
  @tracked isLoading = false;
  @tracked generalError = '';

  @tracked recognitionModel = {
    startTime: null,
    endTime: null,
    dateDocument: null,
    awardedBy: null,
    legalResource: null,
    file: null,
  };

  get hasExpired() {
    const { endTime } = this.recognitionModel;

    if (endTime) {
      const now = new Date();

      return new Date(endTime) < now;
    }

    return true;
  }

  setIsLoading(isLoading) {
    this.isLoading = isLoading;
  }

  async setCurrentRecognition(recognition) {
    this.generalError = '';
    this.isLoading = false;
    this.recognitionModel = {
      startTime: null,
      endTime: null,
      dateDocument: null,
      awardedBy: null,
      legalResource: null,
      file: null,
    };
    this.recognition = recognition;

    if (recognition) {
      this.recognitionModel.dateDocument = recognition.dateDocument ?? null;
      this.recognitionModel.startTime =
        await recognition.validityPeriod.get('startTime');
      this.recognitionModel.endTime =
        await recognition.validityPeriod.get('endTime');
      this.recognitionModel.legalResource = recognition.legalResource ?? null;
      this.recognitionModel.awardedBy = await recognition.awardedBy;
      this.selectedItem = await recognition.awardedBy;
    }
  }
}
