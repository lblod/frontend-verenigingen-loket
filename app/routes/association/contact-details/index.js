import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { findCorrespondenceAddressSite } from 'frontend-verenigingen-loket/utils/association';
import {
  isOutOfDate as isOutOfDateFn,
  logAPIError,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class AssociationContactDetailsIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    return {
      task: this.loadData.perform(params),
    };
  }

  loadData = task({ keepLatest: true }, async ({ page, size, sort }) => {
    const { id } = this.paramsFor('association');

    const association = await this.store.findRecord('association', id, {
      include: ['primary-site.address'].join(','),
    });

    let isOutOfDate = false;
    let isApiUnavailable = false;

    try {
      isOutOfDate = await isOutOfDateFn(association);
    } catch (error) {
      isApiUnavailable = true;
      logAPIError(
        error,
        'Something went wrong when trying to reach the Verenigingsregister API',
      );
    }

    return {
      association,
      contactPoints: await this.store.query('contact-point', {
        'filter[organization][:id:]': id,
        page: { size, number: page },
        sort,
      }),
      correspondenceAddressSite: await findCorrespondenceAddressSite(
        this.store,
        association,
      ),
      isOutOfDate,
      isApiUnavailable,
    };
  });
}
