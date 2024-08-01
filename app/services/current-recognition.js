import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentRecognitionService extends Service {
  items = ['College van burgemeester en schepenen', 'Andere'];
  @service store;
  @tracked recognition = null;
  @tracked selectedItem = this.items[0];
  @tracked isLoading = false;
  @tracked generalError = '';
  @tracked file = null;

  @tracked recognitionModel = {
    startTime: null,
    endTime: null,
    dateDocument: null,
    awardedBy: null,
    legalResource: null,
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

  isValidURL(string) {
    const urlPattern = new RegExp(
      '(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^s]{2,}|www.[a-zA-Z0-9]+.[^s]{2,})',
    );
    return !!urlPattern.test(string);
  }

  async getFile(fileName) {
    try {
      const [fileId] = fileName.split('.pdf');
      let response = await fetch(`/files/${fileId}/download`, {
        method: 'GET',
      });

      if (response.ok) {
        this.file = await response.blob();
        this.file.id = fileId;
        this.file.name = `${fileId}.pdf`;
      } else {
        console.error('File not found', response.statusText);
      }
    } catch (error) {
      console.error('An error occurred while getting the file', error);
    }
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
    };
    this.awardedBy = null;
    this.selectedItem = this.items[0];
    this.recognition = recognition;
    this.file = null;
    if (recognition) {
      if (recognition.legalResource) {
        if (!this.isValidURL(recognition.legalResource)) {
          await this.getFile(recognition.legalResource);
        }
      }
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
