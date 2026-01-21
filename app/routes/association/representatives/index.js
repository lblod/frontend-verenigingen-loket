import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import {
  isOutOfDate as isOutOfDateFn,
  logAPIError,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class AssociationRepresentativesRoute extends Route {
  @service currentSession;
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

    /*
      At the moment only organizations with an agreement can make API calls, so the isApiUnavailable flag would always be true and never switch to false.
      This confuses users, so we only do this call for users who can edit.
      The downside is that users won't know if their data is out of date, but the sync should only last a few minutes anyway.
    */
    if (this.currentSession.canEditVerenigingsregisterData) {
      try {
        isOutOfDate = await isOutOfDateFn(association);
      } catch (error) {
        isApiUnavailable = true;
        logAPIError(
          error,
          'Something went wrong when trying to reach the Verenigingsregister API',
        );
      }
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
