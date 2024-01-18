import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthCallbackRoute extends Route {
  @service session;
  @service router;

  queryParams = ['code'];
  beforeModel() {
    this.session.prohibitAuthentication('index');
  }

  async model() {
    console.log(this.code);
    if (this.code) {
      try {
        await this.session.authenticate('authenticator:acm-idm', this.code);
      } catch (error) {
        throw new Error(
          'Something went wrong while authenticating the user in the backend. The token might be expired.',
          { cause: error },
        );
      }
    } else {
      this.router.replaceWith('auth.login');
    }
  }
}
