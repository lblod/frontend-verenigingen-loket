import AuAlert, {
  type AuAlertSignature,
} from '@appuniversum/ember-appuniversum/components/au-alert';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import Component from '@glimmer/component';
import config from 'frontend-verenigingen-loket/config/environment';

export default class EnvironmentInfoBanner extends Component {
  get environmentName() {
    return config.environmentName;
  }

  get environmentInfo():
    | {
        title: string;
        skin: AuAlertSignature['Args']['skin'];
      }
    | undefined {
    switch (this.environmentName) {
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
        return undefined;
    }
  }

  get showEnvironment() {
    return (
      Boolean(this.environmentInfo) &&
      this.environmentName !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}' &&
      this.environmentName !== 'PROD'
    );
  }

  <template>
    {{#if this.showEnvironment}}
      <AuAlert
        @size="tiny"
        @skin={{this.environmentInfo.skin}}
        class="au-u-margin-bottom-none"
      >
        <div
          class="au-u-para-tiny au-u-flex au-u-flex--spaced au-u-flex--between"
        >
          <div class="au-u-medium">
            Environment:
            {{this.environmentName}}
          </div>
          <p>
            Dit is de
            <strong>{{this.environmentInfo.title}}</strong>
            van de Verenigingen app met fictieve en testgegevens. De
            productieomgeving met de echte data vind je op
            <AuLinkExternal
              href="https://verenigingen.lokaalbestuur.vlaanderen.be/"
              title={{config.appName}}
            >https://verenigingen.lokaalbestuur.vlaanderen.be/</AuLinkExternal>.
          </p>
          <div>
            {{config.appName}}
            {{config.appVersion}}
          </div>
        </div>
      </AuAlert>
    {{/if}}
  </template>
}
