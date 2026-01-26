import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getPromiseState } from '@warp-drive/ember';
import { sortByProperty } from 'frontend-verenigingen-loket/utils/sort';

export default class AssociationRepresentativesController extends Controller {
  @service contactPoints;
  @service currentSession;
  @service router;

  queryParams = ['sort'];
  @tracked sort = '';

  getPromiseState = getPromiseState;

  get association() {
    return this.model.association;
  }

  sortVertegenwoordigers = function (vertegenwoordigers, sort) {
    if (!sort) {
      // The Magda API sorts the vertegenwoordigers by `vertegenwoordigerId` by default
      return vertegenwoordigers;
    }

    const sortedVertegenwoordigers = vertegenwoordigers.slice();

    // The `AuDataTableThSortable` component always dasherizes the field, which isn't useful for us here. As a workaround we map the dasherized value back to the original one.
    // TODO, remove this mapping once the `AuDataTableThSortable` component has an option to not change the sort key.
    sortByProperty(sortedVertegenwoordigers, sort, {
      'social-media': 'socialMedia',
    });

    return sortedVertegenwoordigers;
  };

  reloadData = () => {
    this.router.refresh('association.representatives.index');
  };
}
