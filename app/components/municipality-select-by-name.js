import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-verenigingen-loket/models/administrative-unit-classification-code';
import { trackedTask } from 'reactiveweb/ember-concurrency';

// This version is based on an older version of the component in OP since we only have the `is-sub-organization-of` relationship in our DB.
// https://github.com/lblod/frontend-organization-portal/blob/8f75dd87c4e29f0ca8414e48812a843aac4f1e53/app/components/municipality-select-by-name.js
export default class MunicipalitySelectByNameComponent extends Component {
  @service store;

  municipalities = trackedTask(this, this.loadMunicipalitiesTask, () => [
    this.args.selectedProvince,
  ]);

  @task
  *loadMunicipalitiesTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let municipalities = [];

    if (this.args.selectedProvince && this.args.selectedProvince.length) {
      // If a province is selected, load the municipalities in it
      // TODO: we use `administrative-unit` because the org:Organization class is missing for municipalities in the DB
      municipalities = yield this.store.query('administrative-unit', {
        filter: {
          'is-sub-organization-of': {
            ':exact:name': this.args.selectedProvince,
          },
          classification: {
            id: CLASSIFICATION.MUNICIPALITY.id,
          },
        },
        sort: 'name',
        page: {
          size: 400,
        },
      });
    } else {
      // Else load all the municipalities
      const query = {
        filter: {
          classification: {
            id: CLASSIFICATION.MUNICIPALITY.id,
          },
        },
        sort: 'name',
        page: {
          size: 400,
        },
      };

      // TODO: we use `administrative-unit` because the org:Organization class is missing for municipalities in the DB
      municipalities = yield this.store.query('administrative-unit', query);
    }

    return municipalities.map(({ name }) => name);
  }
}
