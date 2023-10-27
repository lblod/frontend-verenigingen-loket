import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
export default class IndexController extends Controller {
  @service router;
  @tracked page = 0;
  @tracked size = 20;
  @tracked sort = 'name';
  @tracked selectedActivities = [];
  @tracked activities = '';
  @tracked selectedOrganizationStatus = [];
  @tracked status = '';

  queryParams = ['sort', 'page', 'search', 'activities', 'status'];

  @action
  setActivities(selectedActivities) {
    this.page = 0;
    this.selectedActivities = selectedActivities;
    this.activities = selectedActivities
      .map((activity) => activity.id)
      .join(',');
  }

  @action
  setOrganizationStatus(selectedStatus) {
    this.page = 0;
    this.selectedOrganizationStatus = selectedStatus;
    this.status = selectedStatus.join(',');
  }

  @restartableTask
  *updateAssociationSearch(value) {
    yield timeout(500);
    this.page = 0;
    this.search = value;
  }
}
