import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { ORGANIZATION_STATUS } from '../../models/organization-status-code';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class StatusSelectComponent extends Component {
  @service store;
  @tracked selectedOrganizationStatus = null;
  @tracked organizationStatuses = [];

  constructor() {
    super(...arguments);
    this.loadOrganizationStatusesTask.perform();
  }

  @action
  updateSelectedOrganizationStatus(organizationStatus) {
    this.selectedOrganizationStatus =
      this.findOrganizationStatusById(organizationStatus);
  }

  @action
  findOrganizationStatusById(id) {
    if (!this.organizationStatuses || this.organizationStatuses.length === 0) {
      return null;
    }

    return this.organizationStatuses.find((status) => status.id === id);
  }

  @task
  *loadOrganizationStatusesTask() {
    const response = yield this.store.findAll('organization-status-code');
    this.organizationStatuses = response;

    this.selectedOrganizationStatus = this.findOrganizationStatusById(
      ORGANIZATION_STATUS.ACTIVE,
    );
    this.args.onChange(this.selectedOrganizationStatus);
    return response;
  }
}
