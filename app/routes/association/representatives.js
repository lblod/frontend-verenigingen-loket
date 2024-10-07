import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class AssociationRepresentativesRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model() {
    const { id } = this.paramsFor('association');
    const association = await this.store.findRecord('association', id);
    const kboNumber = await this.loadKboNumber.perform(association);
    return {
      association,
      members: this.loadMembers.perform(association),
      kboNumber,
    };
  }

  loadMembers = task({ keepLatest: true }, async (association) => {
    const members = await association.get('members');
    const memberPromises = members.map(async (member) => {
      const memberWithPerson = await member.reload({
        include: 'person.contact-points',
      });
      return memberWithPerson;
    });
    return await Promise.all(memberPromises);
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
