import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type Association from 'frontend-verenigingen-loket/models/association';
import { TrackedArray } from 'tracked-built-ins';

export default class AssociationRepresentativesEditRoute extends Route {
  @service declare store: Store;

  model() {
    // TODO: the type assertion shouldn't be needed when the parent route is converted to TS.
    const association = this.modelFor('association') as Association;

    return {
      association,
      task: this.loadMembers.perform(association),
      roletask: this.loadRoles.perform(),
    };
  }

  loadMembers = task({ keepLatest: true }, async (association: Association) => {
    // TODO: fetch the members with a query instead, since the relationship is paginated and we can't get more pages.
    // This will start causing issues when there are more than 20 members.
    const members = await association.members;
    const memberPromises = members.map(async (member) => {
      const memberWithPerson = await member.reload({
        include: 'person.contact-points,role',
      });
      return memberWithPerson;
    });

    await Promise.all(memberPromises);

    return new TrackedArray(members);
  });

  loadRoles = task(async () => {
    return this.store.findAll('role');
  });
}
