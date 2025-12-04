import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type Association from 'frontend-verenigingen-loket/models/association';
// @ts-expect-error: not converted to TS yet
import type CurrentSession from 'frontend-verenigingen-loket/services/current-session';
import { isOutOfDate as isOutOfDateFn } from 'frontend-verenigingen-loket/utils/verenigingsregister';
import { TrackedArray } from 'tracked-built-ins';

export default class AssociationRepresentativesEditRoute extends Route {
  @service declare currentSession: CurrentSession;
  @service declare store: Store;
  @service declare router: RouterService;

  async beforeModel() {
    let isOutOfDate = false;
    let isApiUnavailable = false;

    try {
      // TODO: the type assertion shouldn't be needed when the parent route is converted to TS.
      const association = this.modelFor('association') as Association;
      isOutOfDate = await isOutOfDateFn(association);
    } catch {
      isApiUnavailable = true;
    }

    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      !this.currentSession.canEditVerenigingsregisterData ||
      isOutOfDate ||
      isApiUnavailable
    ) {
      this.router.transitionTo('association.representatives');
    }
  }

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
