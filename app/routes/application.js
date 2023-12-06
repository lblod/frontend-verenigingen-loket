import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export default class ApplicationRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service store;

  async beforeModel() {
    await this.session.setup();
    return this._loadCurrentSession();
  }

  async _loadCurrentSession() {
    try {
      await this.currentSession.load();
    } catch (error) {
      console.log(error);
      warn(error, { id: 'current-session-load-failure' });
      this.router.transitionTo('auth.logout');
    }
  }
}
