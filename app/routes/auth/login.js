import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthLoginRoute extends Route {
  @service router;

  async beforeModel() {
    window.location.replace(this.router.urlFor('mock-login'));
  }
}
