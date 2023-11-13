import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
export default class IndexController extends Controller {
  @service router;

  size = 50;

  @tracked page = 0;
  @tracked sort = 'name';
  @tracked activities = '';
  @tracked postalCodes = '';
  @tracked status = '';

  queryParams = [
    'sort',
    'page',
    'search',
    'activities',
    'status',
    'postalCodes',
  ];

  @action
  setActivities(selection) {
    console.log({ selection });
    this.page = 0;
    this.activities = selection.map((activity) => activity.id).join(',');
  }

  @action
  setPostalCodes(selectedPostals) {
    this.page = 0;
    this.postalCodes = selectedPostals.map((postal) => postal.id).join(',');
  }

  @action
  setOrganizationStatus(selectedStatus) {
    this.page = 0;
    this.status = selectedStatus.join(',');
  }

  getVcode(identifier) {
    if (identifier.idName === 'vCode') {
      return identifier.structuredIdentifier.localId;
    }
  }
}
