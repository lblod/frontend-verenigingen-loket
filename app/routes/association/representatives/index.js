import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import {
  isOutOfDate as isOutOfDateFn,
  logAPIError,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class AssociationRepresentativesRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model() {
    const { id } = this.paramsFor('association');
    const association = await this.store.findRecord('association', id);
    const kboNumber = await this.loadKboNumber.perform(association);

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
      members: this.loadMembers.perform(association),
      kboNumber,
      isOutOfDate,
      isApiUnavailable,
    };
  }

  loadMembers = task({ keepLatest: true }, async (association) => {
    const members = await association.hasMany('members').reload();
    const memberPromises = members.map(async (member) => {
      const memberWithPerson = await member.reload({
        include: 'person.contact-points,role',
      });
      return memberWithPerson;
    });
    return Promise.all(memberPromises);
  });

  loadKboNumber = task({ drop: true }, async (association) => {
    const identifiers = await association.get('identifiers');

    // Find the KBO identifier
    for (const identifier of identifiers) {
      const structuredIdentifier = await identifier.get('structuredIdentifier');
      if (identifier.idName === 'KBO nummer') {
        return structuredIdentifier.localId;
      }
    }

    return null;
  });
}
