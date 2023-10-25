import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
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
}
