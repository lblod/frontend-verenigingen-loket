import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { AWARDED_BY_OPTIONS } from 'frontend-verenigingen-loket/models/recognition';

export default class CurrentRecognitionService extends Service {
  @service store;
  @service currentSession;

  @tracked recognition = null;
  @tracked selectedItem = AWARDED_BY_OPTIONS.COLLEGE;
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

  get isOtherOrganization() {
    return this.selectedItem === AWARDED_BY_OPTIONS.OTHER;
  }

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

    this.awardedBy = null;
    this.selectedItem = AWARDED_BY_OPTIONS.COLLEGE;

    this.recognition = recognition;

    if (recognition) {
      this.recognitionModel.dateDocument = recognition.dateDocument ?? null;
      this.recognitionModel.startTime =
        await recognition.validityPeriod.get('startTime');
      this.recognitionModel.endTime =
        await recognition.validityPeriod.get('endTime');
      this.recognitionModel.legalResource = recognition.legalResource ?? null;
      const awardedBy = await recognition.awardedBy;
      this.recognitionModel.awardedBy = awardedBy.name;
      this.selectedItem =
        awardedBy === this.currentSession.group
          ? AWARDED_BY_OPTIONS.COLLEGE
          : AWARDED_BY_OPTIONS.OTHER;
    }
  }
}
