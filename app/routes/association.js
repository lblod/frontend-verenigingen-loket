import Route from '@ember/routing/route';

export default class AssociationRoute extends Route {
  model({ id }) {
    return {
      id: id,
    };
  }
}
