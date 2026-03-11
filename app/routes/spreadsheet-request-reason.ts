import Route from '@ember/routing/route';
import type Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import type SessionService from 'frontend-verenigingen-loket/services/session';

export default class SpreadsheetRequestReasonRoute extends Route {
  @service declare session: SessionService;

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
