import { assert } from '@ember/debug';
import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type { ModelFrom } from 'frontend-verenigingen-loket/type-utils/model-from';
import type AssociationRoute from '../association';

export default class AssociationRepresentativesRoute extends Route {
  @service declare router: RouterService;

  beforeModel() {
    const associationModel = this.modelFor(
      'association',
    ) as ModelFrom<AssociationRoute>;

    assert(
      'Association route model is expected to be set when we get here',
      associationModel,
    );

    if (!associationModel.hasApiAuthorization) {
      this.router.transitionTo('association.general');
    }
  }
}
