import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganizationStatusSelectComponent extends Component {
  @service router;
  @service store;

  @tracked organizationStatusQuery = '';
  @tracked organizationStatus;

  constructor() {
    super(...arguments);
    this.organizationStatusQuery = this.router.currentRoute.queryParams.status;
    this.loadOrganizationStatus.perform();
  }

  selectedOrganizationStatus() {
    return this.organizationStatusQuery
      ? this.organizationStatusQuery
          .split(',')
          .map((id) => this.findOrganizationStatusById(id))
          .filter(Boolean)
      : [];
  }

  findOrganizationStatusById(id) {
    return this.organizationStatus.find(
      (organizationStatus) => organizationStatus.id === id,
    ).id;
  }

  @task
  *loadOrganizationStatus() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details

    yield Promise.resolve();
    this.organizationStatus = yield this.store.findAll(
      'organization-status-code',
    );
    this.args.onChange(this.selectedOrganizationStatus());
  }
}
