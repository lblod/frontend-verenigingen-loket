import Route from '@ember/routing/route';

export default class AssociationsAssociationRoute extends Route {
  model({ id }) {
    return {
      id: id,
    };
  }
}
