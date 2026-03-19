import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';
import type SessionService from 'frontend-verenigingen-loket/services/session';

export default class SpreadsheetRequestReasonRoute extends Route {
  @service declare session: SessionService;
  @service declare currentSession: CurrentSessionService;
  @service declare router: RouterService;

  beforeModel(transition: Transition) {
    if (this.session.requireAuthentication(transition, 'login')) {
      if (!this.currentSession.hasApiClient) {
        this.router.replaceWith('associations');
      }
    }
  }
}
