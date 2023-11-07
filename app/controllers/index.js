import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
export default class IndexController extends Controller {
  @service router;
  @tracked page = 0;
  @tracked size = 50;
  @tracked sort = 'name';
  @tracked activities = '';
  @tracked selectedActivities = this.activities
    ? [...this.activities.split(',')]
    : [];
  @tracked postalCodes = '';
  @tracked selectedPostalCodes = this.postalCodes
    ? [...this.postalCodes.split(',')]
    : [];
  @tracked status = '';
  @tracked selectedOrganizationStatus = this.status
    ? [...this.status.split(',')]
    : [];

  queryParams = [
    'sort',
    'page',
    'search',
    'activities',
    'status',
    'postalCodes',
  ];

  @action
  setActivities(selectedActivities) {
    this.page = 0;
    this.selectedActivities = selectedActivities;
    this.activities = selectedActivities
      .map((activity) => activity.id)
      .join(',');
  }

  @action
  setPostalCodes(selectedPostals) {
    this.page = 0;
    this.selectedPostalCodes = selectedPostals;
    this.postalCodes = selectedPostals.map((postal) => postal.id).join(',');
  }

  @action
  setOrganizationStatus(selectedStatus) {
    this.page = 0;
    this.selectedOrganizationStatus = selectedStatus;
    this.status = selectedStatus.join(',');
  }

  getVcode(identifier) {
    if (identifier.idName === 'vCode') {
      return identifier.structuredIdentifier.localId;
    }
  }
}
