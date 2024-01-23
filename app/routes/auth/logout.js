import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthLogoutRoute extends Route {
  @service router;
  @service session;

  async beforeModel(transition) {
    if (this.session.requireAuthentication(transition, 'login')) {
      try {
        const wasMockLoginSession = this.session.isMockLoginSession;
        await this.session.invalidate();
        if (!wasMockLoginSession) {
          await fetch('https://authenticatie-ti.vlaanderen.be/op/v1/logout')
            .then(() => {})
            .catch((error) => {
              console.error(error);
            });
        }
        return window.location.replace(this.router.urlFor('login'));
      } catch (error) {
        throw new Error(
          'Something went wrong while trying to remove the session on the server',
          {
            cause: error,
          },
        );
      }
    }
  }
}
