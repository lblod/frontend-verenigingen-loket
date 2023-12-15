import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout, task } from 'ember-concurrency';
import { action } from '@ember/object';
export default class IndexController extends Controller {
  @service store;
  @service router;
  @service toaster;
  @service contactPoints;
  @service queryBuilder;

  size = 0;
  @tracked page = 0;
  @tracked sort = 'name';
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

  queryParams = [
    'sort',
    'page',
    'search',
    'activities',
    'status',
    'postalCodes',
    'types',
    'targetAudiences',
  ];

  @action
  setActivities(selectedActivities) {
    this.page = 0;
    this.selectedActivities = selectedActivities;
    this.activities = selectedActivities
      .map((activity) => activity.id)
      .join(',');
    return this.activities;
  }

  @action
  setTypes(selectedTypes) {
    this.page = 0;
    this.selectedTypes = selectedTypes;
    this.types = selectedTypes.map((type) => type.id).join(',');
    return this.activities;
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

  @restartableTask
  *updateAssociationSearch(value) {
    yield timeout(500);
    this.page = 0;
    this.search = value.trimStart();
  }

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
    this.page = null;
    this.sort = 'name';
  }

  @task
  *download() {
    const toast = this.toaster.loading(
      `Het downloaden van het bestand is begonnen.`,
      'Download gestart',
    );
    try {
      const res = yield fetch(
        'https://verenigingen.oscart-dev.s.redhost.be/download',
      );
      const blob = res.blob();
      const aElement = document.createElement('a');
      aElement.setAttribute('download', 'test.xlsx');
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
  }

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
