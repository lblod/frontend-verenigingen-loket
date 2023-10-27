import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class AssociationRepresentativesRoute extends Route {
  @service store;
  queryParams = {
    sort: { refreshModel: true },
  };

  async model(params) {
    const { id } = this.paramsFor('association');
    const include = ['person.site.contact-points'].join(',');
    const association = await this.store.findRecord('association', id);
    const members = await this.store.query('membership', {
      include,
      filter: {
        association: {
          id: id,
        },
      },
      sort: params.sort
        ? `${params.sort},person.family-name`
        : 'person.family-name',
    });
    return {
      association,
      members,
    };
  }
}
