import Controller from '@ember/controller';
import { service } from '@ember/service';
import { getOwner } from '@ember/application';

export default class ApplicationController extends Controller {
  @service() session;
  @service() currentSession;
  @service() currentAssociation;

  @service store;
  @service router;
  appTitle = 'Verenigingen';

  get isLocalhost() {
    return !!(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]'
    );
  }

  get environmentName() {
    const thisEnvironmentName = this.isLocalhost
      ? 'LOCAL'
      : getOwner(this).resolveRegistration('config:environment')
          .environmentName;

    return thisEnvironmentName;
  }

  get environmentInfo() {
    let environment = this.environmentName;
    switch (environment) {
      case 'QA':
        return {
          title: 'testomgeving',
          skin: 'warning',
        };
      case 'DEV':
        return {
          title: 'ontwikkelomgeving',
          skin: 'success',
        };
      case 'LOCAL':
        return {
          title: 'lokale omgeving',
          skin: 'error',
        };
      default:
        return {
          title: '',
        };
    }
  }

  get showEnvironment() {
    return (
      this.environmentName !== '' &&
      this.environmentInfo.title !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}' &&
      this.environmentName !== 'PROD'
    );
  }
}
