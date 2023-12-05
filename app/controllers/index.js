import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @service store;
  @service router;

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
  @tracked selectedDates = {};
  @tracked end = '';
  @tracked start = '';

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

  getVcode(identifier) {
    if (identifier.idName === 'vCode') {
      return identifier.structuredIdentifier.localId;
    }
  }

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
    this.start = '';
    this.end = '';
    this.selectedDates = [];
    this.page = null;
    this.sort = 'name';
  }
}
