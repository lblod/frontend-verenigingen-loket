import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

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

  loadAssociation = task({ keepLatest: true }, async () => {
    const { id } = this.paramsFor('association');
    const model = await this.store.findRecord('association', id);

    return model;
  });

  loadMembers = task({ keepLatest: true }, async (params) => {
    const { id } = this.paramsFor('association');

    const members = await this.store.query('membership', {
      include: 'person.site.contact-points',
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
  });
}
