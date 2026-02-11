import { service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';

// Both mock-login and acm-idm-login authenticators provide this data
type AuthenticatorData = {
  authenticated: {
    authenticator: string;
    data: {
      attributes: {
        roles: string[];
      };
    };
    relationships: {
      account: {
        data: {
          id: string;
        };
      };
      group: {
        data: {
          id: string;
        };
      };
    };
  };
};

export default class LoketSessionService extends SessionService<AuthenticatorData> {
  @service declare currentSession: CurrentSessionService;

  get isMockLoginSession() {
    return this.isAuthenticated
      ? this.data.authenticated.authenticator.includes('mock-login')
      : false;
  }
  get isControllerLoginSession() {
    return this.isAuthenticated
      ? this.data.authenticated.authenticator.includes('controller-login')
      : false;
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- return types don't match, but that's intentional here
  async handleAuthentication(routeAfterAuthentication: string): Promise<void> {
    // We wait for the currentSession to load before navigating. This fixes the empty index page since the data might not be loaded yet.
    await this.currentSession.load();
    super.handleAuthentication(routeAfterAuthentication);
  }

  handleInvalidation() {
    // We don't want the default redirecting logic of the base class since we handle this ourselves in other places already.
    // We can't do the logic here since we don't know which authenticator did the invalidation and we don't receive the arguments that are passed to `.invalidate` either.
    // This is needed to be able to support both normal logouts, switch logouts (and as a bonus,also mock logouts).
  }
}
