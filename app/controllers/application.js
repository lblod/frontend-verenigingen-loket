import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service() session;
  @service() currentSession;

  @service store;
  @service router;
  appTitle = 'Verenigingen';
}
