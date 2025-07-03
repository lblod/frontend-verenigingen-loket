import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout, task } from 'ember-concurrency';
import { action } from '@ember/object';
import ENV from 'frontend-verenigingen-loket/config/environment';

const DEBOUNCE_MS = 500;

export default class IndexController extends Controller {
  @service store;

  size = ENV.pageSize ?? 50;
  @tracked page = 0;
  @tracked sort = '-created-on';
  @tracked search = '';
  @tracked activities = [];
  @tracked selectedActivities = [];
  @tracked recognition = [];
  @tracked postalCodes = [];
  @tracked selectedPostalCodes = [];
  @tracked types = [];
  @tracked selectedTypes = [];
  @tracked targetAudiences = [];
  @tracked end = '';
  @tracked start = '';
  @tracked status = true;
  @tracked ENVIRONMENT_NAME = ENV.environmentName;

  queryParams = [
    'sort',
    'page',
    'search',
    'activities',
    'recognition',
    'postalCodes',
    'types',
    'targetAudiences',
    'end',
    'start',
    'status',
  ];

  @action
  setActivities(selectedActivities) {
    // TODO: Find out and explain why we are serializing the notation instead of the concept id
    this.activities = selectedActivities.map((activity) => activity.notation);
    this.selectedActivities = selectedActivities;
    this.page = 0;
  }

  @action
  setTypes(selectedTypes) {
    this.types = selectedTypes.map((type) => type.id);
    this.selectedTypes = selectedTypes;
    this.page = 0;
  }

  @action
  setPostalCodes(selectedPostals) {
    this.postalCodes = selectedPostals.map((postal) => postal.postalCode);
    this.selectedPostalCodes = selectedPostals;
    this.page = 0;
  }

  @action
  setRecognitionStatus(selectedStatuses) {
    this.recognition = selectedStatuses;
    this.page = 0;
  }

  @action
  setDates(start, end) {
    this.start = start;
    this.end = end;
    this.page = 0;
  }

  @action
  setTargetAudiences(selectedTargetAudiences) {
    this.targetAudiences = selectedTargetAudiences;
    this.page = 0;
  }

  @action
  setOrganizationStatus(selectedStatus) {
    this.page = 0;
    this.status = selectedStatus;
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
    this.recognition = [];
    this.activities = [];
    this.selectedActivities = [];
    this.postalCodes = [];
    this.selectedPostalCodes = [];
    this.types = [];
    this.selectedTypes = [];
    this.targetAudiences = [];
    this.selectedTargetAudiences = [];
    this.search = '';
    this.start = '';
    this.end = '';
    this.page = null;
    // Active is the default organization status filter state
    this.status = true;
    this.sort = '-created-on';
  }
}
