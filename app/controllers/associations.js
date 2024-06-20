import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout, task } from 'ember-concurrency';
import { action } from '@ember/object';
import ENV from 'frontend-verenigingen-loket/config/environment';

const DEBOUNCE_MS = 500;

export default class IndexController extends Controller {
  @service store;
  @service router;
  @service toaster;
  @service contactPoints;
  @service queryBuilder;

  size = 50;
  @tracked page = 0;
  @tracked sort = '-created-on';
  @tracked search = '';
  @tracked activities = '';
  @tracked selectedActivities = [];
  @tracked status = '';
  @tracked selectedOrganizationStatus = '';
  @tracked postalCodes = '';
  @tracked selectedPostalCodes = [];
  @tracked types = '';
  @tracked selectedTypes = [];
  @tracked targetAudiences = '';
  @tracked selectedTargetAudiences = [];
  @tracked selectedDates = {};
  @tracked end = '';
  @tracked start = '';
  @tracked ENVIRONMENT_NAME = ENV.environmentName;

  queryParams = [
    'sort',
    'page',
    'search',
    'activities',
    'status',
    'postalCodes',
    'types',
    'targetAudiences',
    'end',
    'start',
  ];

  @action
  setActivities(selectedActivities) {
    this.page = 0;
    this.selectedActivities = selectedActivities;
    this.activities = selectedActivities
      .map((activity) => activity.notation)
      .join(',');
    return this.activities;
  }

  @action
  setTypes(selectedTypes) {
    this.page = 0;
    this.selectedTypes = selectedTypes;
    this.types = selectedTypes.map((type) => type.id).join(',');
    return this.types;
  }

  @action
  setPostalCodes(selectedPostals) {
    this.page = 0;
    this.selectedPostalCodes = selectedPostals;
    this.postalCodes = selectedPostals
      .map((postal) => postal.postalCode)
      .join(',');
  }

  @action
  setOrganizationStatus(selectedStatus) {
    this.page = 0;
    this.selectedOrganizationStatus = selectedStatus;
    this.status = selectedStatus.join(',');
  }

  @action
  setDates(selectedDates) {
    this.page = 0;
    this.selectedDates = selectedDates;
    if (selectedDates !== '') {
      this.start = selectedDates.value.start;
      this.end = selectedDates.value.end;
    }
  }

  @action
  setTargetAudiences(selectedTargetAudiences) {
    this.page = 0;
    this.selectedTargetAudiences = selectedTargetAudiences;
    this.targetAudiences = selectedTargetAudiences.join(',');
  }
  get isLoading() {
    return this.model.associations.isRunning;
  }

  get associations() {
    return this.model.associations.isFinished
      ? this.model.associations.value
      : [];
  }

  updateAssociationSearch = task({ restartable: true }, async (value) => {
    await timeout(DEBOUNCE_MS);
    this.page = 0;
    this.search = value.trimStart();
  });

  @action
  resetFilters() {
    this.status = '';
    this.selectedOrganizationStatus = [];
    this.activities = '';
    this.selectedActivities = [];
    this.postalCodes = '';
    this.selectedPostalCodes = [];
    this.types = '';
    this.selectedTypes = [];
    this.targetAudiences = '';
    this.selectedTargetAudiences = [];
    this.search = '';
    this.start = '';
    this.end = '';
    this.selectedDates = [];
    this.page = null;
    this.sort = '-created-on';
  }

  download = task({ drop: true }, async () => {
    const toast = this.toaster.loading(
      `Het downloaden van het bestand is begonnen.`,
      'Download gestart',
    );
    try {
      const params = {
        ...(this.search ? { search: this.search } : {}),
        ...(this.activities ? { activities: this.activities } : {}),
        ...(this.status ? { status: this.status } : {}),
        ...(this.postalCodes ? { postalCodes: this.postalCodes } : {}),
        ...(this.types ? { types: this.types } : {}),
        ...(this.targetAudiences
          ? { targetAudiences: this.targetAudiences }
          : {}),
      };

      const res = await fetch(
        `https://${window.location.hostname}/download?` +
          new URLSearchParams(params),
      );

      const currentDate = new Date();
      const timestamp = currentDate
        .toISOString()
        .replace(/[-:]/g, '_')
        .replace(/\.\d+/, '');
      const fileName = `verenigingen_${timestamp}.xlsx`;
      const blob = await res.blob();
      const aElement = document.createElement('a');
      aElement.setAttribute('download', fileName);
      const href = URL.createObjectURL(blob);
      aElement.href = href;
      aElement.setAttribute('target', '_blank');
      aElement.click();
      URL.revokeObjectURL(href);
      this.downloadFinished(toast);
    } catch (error) {
      this.downloadFailed(toast);
      console.error(error);
    }
  });

  @action
  downloadFinished(toast) {
    this.toaster.close(toast);
    this.toaster.success(
      'Het bestand is succesvol gedownload.',
      'Download Voltooid',
      {
        timeOut: 3000,
      },
    );
  }
  @action
  downloadFailed(toast) {
    this.toaster.close(toast);
    this.toaster.error(
      'Er is een fout opgetreden bij het downloaden van het bestand. Probeer het opnieuw.',
      'Download Mislukt',
      {
        timeOut: 3000,
      },
    );
  }
}
