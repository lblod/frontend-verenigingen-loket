import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import { errorValidation } from '../../validations/recognition-validation';
import { tracked } from '@glimmer/tracking';
import dateFormat from '../../helpers/date-format';
import { task } from 'ember-concurrency';
import dateYear from 'frontend-verenigingen-loket/helpers/date-year';

export default class FormComponent extends Component {
  @service currentAssociation;
  @service contactPoints;
  @service currentRecognition;
  @service currentSession;
  @service store;
  @service router;
  @service toaster;
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

  constructor() {
    super(...arguments);

    this.getGoverningBodiesInTime.perform();
  }

  getGoverningBodiesInTime = task(async () => {
    const currentAdministrativeUnitId = this.currentSession.group.id;

    return await this.store.query('governing-body', {
      'filter[governing-body][administrative-unit][:id:]':
        currentAdministrativeUnitId,
      include:
        'governing-body.classification,governing-body.administrative-unit',
      sort: ':no-case:governing-body.classification.pref-label,-start',
      // Just a precaution, if we actually hit a large amount of items we should use a different solution
      'page[size]': 100,
    });
  });

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
    const startTime = dateFormat(
      this.currentRecognition.recognitionModel.startTime,
      'YYY-MM-DD',
    );
    const endTime = dateFormat(
      this.currentRecognition.recognitionModel.endTime,
      'YYY-MM-DD',
    );

    const [startDateExist, endDateExist] = await this.getRecognitionsInPeriod(
      startTime,
      endTime,
    );
    const isNew = !this.legalResourceFile?.id && this.legalResourceFile?.isNew;

    const err = errorValidation.validate({
      ...this.currentRecognition.recognitionModel,
      awardedBy: this.currentRecognition.selectedItem,
      file: isNew ? await this.legalResourceFile : null,
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
      awardedBy: this.currentRecognition.selectedItem,
      file: fileData || null,
    });

    try {
      await recognition.save();
      const startYear = dateYear(recognitionModel.startTime);
      const endYear = dateYear(recognitionModel.endTime);
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
    const file = await this.currentRecognition.recognition.file;
    if (file && this.fileData === null) {
      await file.deleteRecord();
      const response = await file.save();
      await this.currentRecognition.recognition.setProperties({
        ...this.currentRecognition.recognition,
        legalResource: null,
        file: null,
      });
      await this.currentRecognition.recognition.save();
      if (!response) {
        throw new Error('File removal failed');
      }
    }
    const recognition = {
      dateDocument: recognitionModel.dateDocument,
      legalResource: recognitionModel.legalResource,
      awardedBy: this.currentRecognition.selectedItem,
      validityPeriod,
      file: (await fileData) || null,
    };
    try {
      await this.currentRecognition.recognition.setProperties({
        ...recognition,
      });
      await this.currentRecognition.recognition.save();
      const startYear = dateYear(validityPeriod.startTime);
      const endYear = dateYear(validityPeriod.endTime);
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
  handleAwardedByChange(governingBody) {
    this.currentRecognition.selectedItem = governingBody;
    this.clearFormError('awardedBy');
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
      this.fileData = null;
      this.clearFormError('legalResource');
      this.clearFormError('file');
      this.legalResourceFile = null;

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
        // We intentionally don't call URL.revokeObjectURL because it breaks file downloads in Chrome.
        // The revoked url causes the download to fail, even if the file is still visible in the browser's built-in pdf viewer.
        // We could go for a long delay before calling revokeObjectURL,
        // but that could still fail if the user keeps a file open for a very long time before downloading.
        // The browser does clean up these references when all the tabs of the app are closed,
        // so not calling revokeObjectURL simply means the data stays in memory longer.
        const url = window.URL.createObjectURL(file.download);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
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
