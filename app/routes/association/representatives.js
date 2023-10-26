import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class AssociationRepresentativesRoute extends Route {
  @service store;
  queryParams = {
    sort: { refreshModel: true },
  };

  async model() {
    const { id } = this.paramsFor('association');
    const association = await this.store.findRecord('association', id);
    const members = await association.get('members');
    console.log(members);
    return {
      association,
      members,
    };
  }
}
