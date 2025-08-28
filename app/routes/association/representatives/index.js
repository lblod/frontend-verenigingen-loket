import Route from '@ember/routing/route';
import { service } from '@ember/service';
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
    await Promise.all(memberPromises);
    // A Person can have many contact points. As long as one of the contact
    // points is marked as primary, the whole membership is primary.
    for (const member of members) {
      member.isPrimary = false;
      const contacts = await member.person.get('contactPoints');
      for (const contact of contacts)
        if (contact.type === 'Primary') member.isPrimary = true;
    }
    return members;
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
