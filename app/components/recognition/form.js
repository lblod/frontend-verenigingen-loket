import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import { errorValidation } from '../../validations/recognition-validation';
import { tracked } from '@glimmer/tracking';
import dateFormat from '../../helpers/date-format';

export default class FormComponent extends Component {
  items = ['College van burgemeester en schepenen', 'Andere'];
  @service currentAssociation;
  @service contactPoints;
  @service currentRecognition;
  @service store;
  @service router;
  @service toaster;
  @service dateYear;

  @tracked validationErrors = {};

  notify(message, title, type = 'success') {
    this.toaster.notify(message, title, {
      type,
      timeOut: 4000,
      closable: false,
    });
  }

  get getStartDate() {
    if (this.currentRecognition.recognition) {
      const startTime =
        this.currentRecognition.recognition.validityPeriod.get('startTime');

      if (startTime && !isNaN(new Date(startTime))) {
        const newDate = new Date(startTime);
        return this.formatDate(newDate);
      }
    }
    return null;
  }
  get getEndDate() {
    if (this.currentRecognition.recognition) {
      const endTime =
        this.currentRecognition.recognition.validityPeriod.get('endTime');

      if (endTime && !isNaN(new Date(endTime))) {
        const newDate = new Date(endTime);
        return this.formatDate(newDate);
      }
    }
    return null;
  }

  formatDate(date) {
    const day = date.toLocaleDateString('nl-BE', { day: '2-digit' }),
      month = date.toLocaleDateString('nl-BE', { month: '2-digit' }),
      year = date.getFullYear();

    return year + '-' + month + '-' + day;
  }

  mapValidationDetailsToErrors(validationDetails) {
    return validationDetails.reduce((accumulator, detail) => {
      accumulator[detail.context.key] = detail.message;
      return accumulator;
    }, {});
  }

  @action
  clearFormError(errorField) {
    set(this.validationErrors, errorField, null);
  }

  async getRecognitionsInPeriod() {
    return (
      await this.store.query('recognition', {
        include: 'validity-period',
        filter: {
          ':has-no:status': true,
          association: {
            id: this.currentAssociation.association.id,
          },
        },
        page: { size: 200 },
      })
    ).filter(
      (recognition) =>
        recognition.id !== this.currentRecognition?.recognition?.id,
    );
  }

  async validateForm() {
    const startTime = dateFormat.compute([
      this.currentRecognition.recognitionModel.startTime,
      'YYY-MM-DD',
    ]);
    const endTime = dateFormat.compute([
      this.currentRecognition.recognitionModel.endTime,
      'YYY-MM-DD',
    ]);
    const startDateExist = [];
    const endDateExist = [];
    const recognitions = await this.getRecognitionsInPeriod();
    await Promise.all(
      recognitions.map(async (recognition) => {
        const recStartTime = await recognition.validityPeriod.get('startTime');
        const recEndTime = await recognition.validityPeriod.get('endTime');

        if (startTime >= recStartTime && startTime <= recEndTime) {
          startDateExist.push(recognition);
        }

        if (endTime >= recStartTime && endTime <= recEndTime) {
          endDateExist.push(recognition);
        }

        if (startTime <= recStartTime && endTime >= recEndTime) {
          startDateExist.push(recognition);
          endDateExist.push(recognition);
        }
      }),
    );

    const err = errorValidation.validate({
      ...this.currentRecognition.recognitionModel,
      awardedBy:
        this.items[0] === this.currentRecognition.selectedItem
          ? this.currentRecognition.selectedItem
          : this.currentRecognition.recognitionModel.awardedBy,
    });
    this.validationErrors = err.error
      ? this.mapValidationDetailsToErrors(err.error.details)
      : {};
    if (startDateExist.length > 0 || endDateExist.length > 0) {
      err.error = true;
      this.currentRecognition.generalError =
        'Pas de erkenningsperiodes aan of annuleer de erkenning.';
    }
    if (startDateExist.length > 0) {
      this.validationErrors.startTime =
        'De startdatum komt al overeen met een eerder toegekende erkenning.';
    }
    if (endDateExist.length > 0) {
      this.validationErrors.endTime =
        'De einddatum komt al overeen met een eerder toegekende erkenning.';
    }

    return err.error;
  }

  @action
  async handleRecognition(event) {
    event.preventDefault();
    this.currentRecognition.setIsLoading(true);
    try {
      const errors = await this.validateForm();
      if (errors) return;
      if (this.currentRecognition.recognition) {
        await this.editRecognition();
      } else {
        await this.newRecognition();
      }
      this.currentRecognition.setIsLoading(false);
      this.router.transitionTo('association.recognition.index');
    } catch (error) {
      console.error(error);
    } finally {
      this.currentRecognition.setIsLoading(false);
    }
  }

  @action
  async newRecognition() {
    const { recognitionModel, selectedItem } = this.currentRecognition;

    const recognition = await this.store.createRecord('recognition', {
      dateDocument: recognitionModel.dateDocument,
      legalResource:
        selectedItem === this.items[0] ? recognitionModel.legalResource : null,
      association: this.currentAssociation.association,
      validityPeriod: await this.updateOrGetPeriod(recognitionModel),
      awardedBy: await this.getAwardedBy(),
    });

    try {
      await recognition.save();
      const startYear = this.dateYear.getCurrentYear(
        recognitionModel.startTime,
      );
      const endYear = this.dateYear.getCurrentYear(recognitionModel.endTime);
      this.notify(
        `De erkenning voor de periode ${startYear} - ${endYear} is aangemaakt.`,
        `Erkenning succesvol aangemaakt.`,
      );
    } catch (error) {
      this.notify(
        'Er is een fout opgetreden bij het opslaan van de erkenning.',
      );
      console.error('Error saving recognition:', error);
    }
  }

  @action
  async editRecognition() {
    const { recognitionModel, selectedItem } = this.currentRecognition;
    const validityPeriod = await this.updateOrGetPeriod(recognitionModel);
    const recognition = {
      dateDocument: recognitionModel.dateDocument,
      legalResource:
        selectedItem === this.items[0] ? recognitionModel.legalResource : null,
      awardedBy: await this.getAwardedBy(),
      validityPeriod,
    };

    try {
      await this.currentRecognition.recognition.setProperties({
        ...recognition,
      });
      await this.currentRecognition.recognition.save();
      const startYear = this.dateYear.getCurrentYear(validityPeriod.startTime);
      const endYear = this.dateYear.getCurrentYear(validityPeriod.endTime);
      this.notify(
        `De erkenning voor de periode ${startYear} - ${endYear} is bijgewerkt.`,
        `Erkenning succesvol bijgewerkt.`,
      );
    } catch (error) {
      this.notify(
        'Er is een fout opgetreden bij het bijwerken van de erkenning.',
      );
      console.error('Error updating recognition:', error);
    }
  }

  @action
  async updateOrGetPeriod(recognitionModel) {
    if (
      this.currentRecognition.recognition &&
      this.currentRecognition.recognition.validityPeriod.get('id')
    ) {
      const validityPeriodId =
        this.currentRecognition.recognition.validityPeriod.get('id');
      return await this.updateValidityPeriod(
        recognitionModel,
        validityPeriodId,
      );
    } else {
      return await this.createValidityPeriod();
    }
  }
  @action
  async updateValidityPeriod(recognitionModel, validityPeriodId) {
    const validityPeriod = await this.store.findRecord(
      'period',
      validityPeriodId,
    );

    if (recognitionModel.startTime) {
      validityPeriod.startTime = new Date(recognitionModel.startTime);
    }

    if (recognitionModel.endTime) {
      validityPeriod.endTime = new Date(recognitionModel.endTime);
    }

    return await validityPeriod.save();
  }

  async createValidityPeriod() {
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
