import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';

export default class AssociationRepresentativesRoute extends Route {
  @service store;
  queryParams = {
    sort: { refreshModel: true },
  };

  async model(params) {
    return {
      association: this.loadAssociation.perform(),
      members: this.loadMembers.perform(params),
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadAssociation() {
    const { id } = this.paramsFor('association');
    const model = yield this.store.findRecord('association', id);

    return model;
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadMembers(params) {
    const { id } = this.paramsFor('association');

    const members = yield this.store.query('membership', {
      filter: {
        association: {
          id: id,
        },
      },
      sort: params.sort
        ? `${params.sort},person.family-name`
        : 'person.family-name',
    });
    return members;
  }
}
