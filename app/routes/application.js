import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { warn } from '@ember/debug';
import config from 'frontend-verenigingen-loket/config/environment';

export default class ApplicationRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service store;
  @service plausible;

  async beforeModel() {
    await this.session.setup();
    this.startAnalytics();
    return this._loadCurrentSession();
  }

  startAnalytics() {
    const { domain, apiHost } = config.plausible;

    if (
      domain !== '{{ANALYTICS_APP_DOMAIN}}' &&
      apiHost !== '{{ANALYTICS_API_HOST}}'
    ) {
      this.plausible.enable({
        domain,
        apiHost,
      });
    }
  }

  async _loadCurrentSession() {
    try {
      await this.currentSession.load();
    } catch (error) {
      console.error(error);
      warn(error, { id: 'current-session-load-failure' });
      this.router.transitionTo('auth.logout');
    }
  }
}
