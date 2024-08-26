import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import { errorValidation } from '../../validations/recognition-validation';
import { tracked } from '@glimmer/tracking';
import dateFormat from '../../helpers/date-format';
import { task } from 'ember-concurrency';

export default class FormComponent extends Component {
  items = ['College van burgemeester en schepenen', 'Andere'];
  @service currentAssociation;
  @service contactPoints;
  @service currentRecognition;
  @service store;
  @service router;
  @service toaster;
  @service dateYear;
  @service file;
  @tracked validationErrors = {};
  @tracked legalResourceFile = this.currentRecognition.recognition
    ? this.currentRecognition.recognition.file
    : null;

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

  async getRecognitionsInPeriod(startTime, endTime) {
    const startDateExist = [];
    const endDateExist = [];

    const recognitions = await this.store.query('recognition', {
      include: 'validity-period',
      filter: {
        ':has-no:status': true,
        association: {
          id: this.currentAssociation.association.id,
        },
      },
      page: { size: 200 },
    });

    const currentRecognitionId = this.currentRecognition?.recognition?.id;

    await Promise.all(
      recognitions
        .filter((recognition) => recognition.id !== currentRecognitionId)
        .map(async (recognition) => {
          const recValidityPeriod = await recognition.validityPeriod;
          const recStartTime = await recValidityPeriod.get('startTime');
          const recEndTime = await recValidityPeriod.get('endTime');

          if (startTime <= recEndTime && endTime >= recStartTime) {
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

    return [startDateExist, endDateExist];
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

    const [startDateExist, endDateExist] = await this.getRecognitionsInPeriod(
      startTime,
      endTime,
    );
    const err = errorValidation.validate({
      ...this.currentRecognition.recognitionModel,
      awardedBy:
        this.items[0] === this.currentRecognition.selectedItem
          ? this.currentRecognition.selectedItem
          : this.currentRecognition.recognitionModel.awardedBy,
      file: await this.legalResourceFile,
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

      let fileData = this.currentRecognition.recognition?.file;
      if (!this.legalResourceFile?.id && this.legalResourceFile?.isNew) {
        fileData = await this.uploadFile(this.legalResourceFile);
        if (!fileData) return;
      }
      if (this.currentRecognition.recognition) {
        await this.editRecognition(fileData);
      } else {
        await this.newRecognition(fileData);
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
  async newRecognition(fileData) {
    const { recognitionModel } = this.currentRecognition;

    const recognition = await this.store.createRecord('recognition', {
      dateDocument: recognitionModel.dateDocument,
      legalResource: recognitionModel.legalResource,
      association: this.currentAssociation.association,
      validityPeriod: await this.updateOrGetPeriod(recognitionModel),
      awardedBy: await this.getAwardedBy(),
      file: fileData || null,
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
        null,
        'error',
      );
      console.error('Error saving recognition:', error);
    }
  }

  @action
  async editRecognition(fileData) {
    const { recognitionModel } = this.currentRecognition;
    const validityPeriod = await this.updateOrGetPeriod(recognitionModel);
    const recognition = {
      dateDocument: recognitionModel.dateDocument,
      legalResource: recognitionModel.legalResource,
      awardedBy: await this.getAwardedBy(),
      validityPeriod,
      file: (await fileData) || null,
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
        null,
        'error',
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
  @action
  async handleFileChange(event) {
    this.legalResourceFile = event.target.files[0];
    if (this.legalResourceFile) {
      this.currentRecognition.recognitionModel.file = this.legalResourceFile;
      this.currentRecognition.recognitionModel.file.download =
        this.legalResourceFile;
      set(this.validationErrors, 'legalResource', null);
      this.currentRecognition.recognitionModel.file.isNew = true;
    }
  }

  removeFile = task({ drop: true }, async () => {
    try {
      let file = await this.legalResourceFile;
      if (!file.id) {
        this.legalResourceFile = null;
        this.clearFormError('legalResource');
        this.clearFormError('file');
        await this.currentRecognition.recognition.setProperties({
          ...this.currentRecognition.recognition,
          legalResource: null,
          file: null,
        });
        return set(this.validationErrors, 'legalResource', null);
      }
      await file.deleteRecord();
      const response = await file.save();
      if (!response) {
        throw new Error('File removal failed');
      }
      this.notify(
        `Het bestand met de naam ${file.name} is succesvol verwijderd.`,
        `Bestand succesvol verwijderd.`,
      );
      this.clearFormError('legalResource');
      this.clearFormError('file');
      this.legalResourceFile = null;
      await this.currentRecognition.recognition.setProperties({
        ...this.currentRecognition.recognition,
        legalResource: null,
        file: null,
      });
      await this.currentRecognition.recognition.save();
      return set(this.validationErrors, 'legalResource', null);
    } catch (error) {
      this.notify(
        'Er is een fout opgetreden bij het verwijderen van het bestand.',
        null,
        'error',
      );
      console.error('An error occurred while removing the file', error);
    }
  });

  @action
  async openFileInNewTab(file) {
    try {
      if (file.id) {
        await this.file.getFile(file);
      } else {
        const url = window.URL.createObjectURL(file.download);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('An error occurred while opening the file', error);
    }
  }

  @action
  async uploadFile(file) {
    if (file) {
      let formData = new FormData();
      formData.append('file', file);
      try {
        let response = await fetch('/files', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          let { data } = await response.json();
          return await this.store.findRecord('file', data.id);
        } else {
          console.error('File upload failed', response.statusText);
          if (response.status === 413) {
            this.notify(
              'Het bestand is te groot. Probeer het opnieuw',
              null,
              'error',
            );
          } else {
            this.notify('Fout bij het uploaden van het bestand', null, 'error');
          }
          return null;
        }
      } catch (error) {
        console.error('An error occurred while uploading the file', error);
        this.notify('Fout bij het uploaden van het bestand', null, 'error');
        return null;
      }
    }
    return null;
  }
}
