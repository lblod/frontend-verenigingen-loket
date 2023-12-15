import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AssociationRecognitionCreateController extends Controller {
  items = ['College van burgemeester en schepenen', 'Andere'];
  @service contactPoints;
  @service currentRecognition;
  @service store;
  @service router;
  @service toaster;
  @service dateYear;
  @tracked isFormLoading = false;

  get isLoading() {
    return this.model.association.isRunning;
  }

  get association() {
    return this.model.association.isFinished
      ? this.model.association.value
      : null;
  }

  get recognition() {
    if (this.model.recognition && this.model.recognition.isFinished) {
      return this.model.recognition.value;
    }
    return null;
  }

  get getStartDate() {
    if (this.currentRecognition.recognition) {
      const newDate = new Date(
        this.currentRecognition.recognition.validityPeriod.get('startTime'),
      );
      return this.formatDate(newDate);
    }
    return null;
  }

  get getEndDate() {
    if (this.currentRecognition.recognition) {
      const newDate = new Date(
        this.currentRecognition.recognition.validityPeriod.get('endTime'),
      );
      return this.formatDate(newDate);
    }
    return null;
  }

  formatDate(date) {
    const day = date.toLocaleDateString('nl-BE', { day: '2-digit' }),
      month = date.toLocaleDateString('nl-BE', { month: '2-digit' }),
      year = date.getFullYear();

    return year + '-' + month + '-' + day;
  }

  @action
  async handleRecognition(event) {
    event.preventDefault();
    this.isFormLoading = true;
    try {
      if (this.currentRecognition.recognition) {
        await this.editRecognition();
      } else {
        await this.newRecognition();
      }
      this.router.transitionTo('association.recognition.index');
    } catch (error) {
      console.error(error);
    } finally {
      this.isFormLoading = false;
    }
  }

  @action
  async newRecognition() {
    const recognition = await this.store.createRecord('recognition', {
      dateDocument: this.currentRecognition.recognitionModel.dateDocument,
      legalResource:
        this.currentRecognition.selectedItem === this.items[0]
          ? this.currentRecognition.recognitionModel.legalResource
          : null,
      association: this.association,
      validityPeriod: await this.getValidityPeriod(),
      awardedBy: await this.getAwardedBy(),
    });
    await recognition.save();
    this.toaster.notify(
      'is opgeslagen.',
      `Erkenning ${this.currentRecognition.recognitionModel.startTime} - ${this.currentRecognition.recognitionModel.endTime}`,
      {
        type: 'success',
        timeOut: 4000,
        closable: false,
      },
    );
  }

  @action
  async editRecognition() {
    const recognition = {};
    recognition.dateDocument =
      this.currentRecognition.recognitionModel.dateDocument;
    recognition.legalResource =
      this.currentRecognition.selectedItem === this.items[0]
        ? this.currentRecognition.recognitionModel.legalResource
        : null;
    recognition.awardedBy = await this.getAwardedBy();
    if (
      this.currentRecognition.recognitionModel.startTime ||
      this.currentRecognition.recognitionModel.endTime
    ) {
      await this.store
        .findRecord(
          'period',
          this.currentRecognition.recognition.validityPeriod.get('id'),
        )
        .then((validityPeriod) => {
          if (this.currentRecognition.recognitionModel.startTime) {
            validityPeriod.startTime = new Date(
              this.currentRecognition.recognitionModel.startTime,
            );
          }
          if (this.currentRecognition.recognitionModel.endTime) {
            validityPeriod.endTime = new Date(
              this.currentRecognition.recognitionModel.endTime,
            );
          }
          validityPeriod.save();
          // this.currentRecognition.recognition.validityPeriod.setProperties({
          //   ...validityPeriod,
          // });
        });
    }
    await this.currentRecognition.recognition.setProperties({ ...recognition });
    await this.currentRecognition.recognition.save();
    this.toaster.notify(
      'is aangepast.',
      `Erkenning ${this.dateYear.getCurrentYear(
        this.currentRecognition.recognition.validityPeriod.get('startTime'),
      )} - ${this.dateYear.getCurrentYear(
        this.currentRecognition.recognition.validityPeriod.get('endTime'),
      )}`,
      {
        type: 'success',
        timeOut: 4000,
        closable: false,
      },
    );
  }

  @action
  async getValidityPeriod() {
    const validityPeriod = this.store.createRecord('period', {
      startTime: this.currentRecognition.recognitionModel.startTime
        ? new Date(this.currentRecognition.recognitionModel.startTime)
        : null,
      endTime: this.currentRecognition.recognitionModel.endTime
        ? new Date(this.currentRecognition.recognitionModel.endTime)
        : null,
    });
    await validityPeriod.save();
    return validityPeriod;
  }

  @action
  async getAwardedBy() {
    let awardedByValue = this.items[0];
    if (this.currentRecognition.selectedItem !== this.items[0]) {
      awardedByValue = this.currentRecognition.recognitionModel.awardedBy;
    }

    const administrativeUnits = await this.store.query('administrative-unit', {
      filter: {
        ':exact:name': awardedByValue,
      },
    });
    let awardedBy = administrativeUnits?.[0];
    if (!awardedBy) {
      awardedBy = this.store.createRecord('administrative-unit', {
        name: awardedByValue,
      });
      await awardedBy.save();
    }
    return awardedBy;
  }
}
