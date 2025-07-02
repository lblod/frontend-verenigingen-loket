import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout, task } from 'ember-concurrency';
import { action } from '@ember/object';
import { cell, resource, resourceFactory } from 'ember-resources';
import ENV from 'frontend-verenigingen-loket/config/environment';
import { dedupeTracked } from '../utils/tracked-toolbox';

const DEBOUNCE_MS = 500;

export default class IndexController extends Controller {
  @service store;

  size = ENV.pageSize ?? 50;
  @tracked page = 0;
  @tracked sort = '-created-on';
  @tracked search = '';
  @tracked activities = '';
  @tracked selectedActivities = [];
  @tracked recognition = [];
  @dedupeTracked postalCodes = '';
  @tracked types = [];
  @tracked selectedTypes = [];
  @tracked targetAudiences = [];
  @tracked end = '';
  @tracked start = '';
  @tracked status = true;
  @tracked ENVIRONMENT_NAME = ENV.environmentName;
  PostalCodes = PostalCodes;

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
    this.page = 0;
    this.selectedActivities = selectedActivities;
    this.activities = selectedActivities
      .map((activity) => activity.notation)
      .join(',');
    return this.activities;
  }

  @action
  setTypes(selectedTypes) {
    this.types = selectedTypes.map((type) => type.id);
    this.selectedTypes = selectedTypes;
    this.page = 0;
  }

  @action
  setPostalCodes(selectedPostals) {
    this.page = 0;
    this.postalCodes = selectedPostals
      .map((postal) => postal.postalCode)
      .join(',');

    // We update the postalCodes value so the interface updates immediately instead of having to wait until the fetch finishes.
    // TODO: There has to be a better pattern so the resource stays self-contained.
    postalCodes.current = selectedPostals;
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
    this.activities = '';
    this.selectedActivities = [];
    this.postalCodes = '';
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

// We store the postalCodes cell in module scope so the previous data is retained between data fetches.
// This prevents the select from temporarily showing an empty selection.
const postalCodes = cell([]);

// This fetches the postal code records based on the postalCodes query param
function PostalCodes(store, postalCodesQP) {
  return resource(() => {
    (async () => {
      if (postalCodesQP) {
        const records = await Promise.all(
          postalCodesQP.split(',').map(async (postalCode) => {
            const result = await store.query('postal-code', {
              'filter[postal-code]': postalCode,
            });

            return result.at(0);
          }),
        );

        postalCodes.current = records;
      } else {
        await Promise.resolve();
        postalCodes.current = [];
      }
    })();

    return postalCodes;
  });
}
resourceFactory(PostalCodes);
