import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service currentSession;
  @service router;
  appTitle = 'Verenigingen';

  get isIndex() {
    return this.router.currentRouteName === 'index';
  }
}