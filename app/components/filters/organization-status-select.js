import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class OrganizationStatusSelectComponent extends Component {
  @service router;
  @service store;

  @tracked organizationStatusQuery = '';
  @tracked organizationStatus;

  constructor() {
    super(...arguments);
    this.organizationStatusQuery = this.router.currentRoute.queryParams.status;
    this.args.onChange(this.selectedOrganizationStatus());
  }

  selectedOrganizationStatus() {
    return this.organizationStatusQuery
      ? this.organizationStatusQuery.split(',').map((id) => id)
      : [];
  }
}
