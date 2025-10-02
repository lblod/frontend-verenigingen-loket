import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import { service } from '@ember/service';
import Component from '@glimmer/component';

const POLLING_DELAY = 10_000;

export default class OutOfDateMessage extends Component {
  @service store;
  intervalId;
  currentEtag;

  constructor() {
    super(...arguments);

    this.currentEtag = this.args.association.etag;
    this.pollForUpdates();
  }

  pollForUpdates() {
    this.intervalId = setInterval(async () => {
      await this.args.association.reload();

      const newEtag = this.args.association.etag;
      if (newEtag !== this.currentEtag) {
        this.args.onUpdateAvailable?.();
      }
    }, POLLING_DELAY);
  }

  <template>
    <AuAlert
      @skin="warning"
      @icon="alert-triangle"
      @size="small"
      @closable={{true}}
      class="au-u-max-width-small"
      ...attributes
    >
      Na een aanpassing kan het even duren voor de veranderingen hier zichtbaar
      zijn.
      <br />
      Wees gerust, de veranderingen zijn vrijwel meteen zichtbaar in het
      Verenigingsregister.
      <div>
        <AuLoader
          @inline={{true}}
          @centered={{false}}
          class="au-u-margin-top"
        ><span class="au-u-para-small">Gegevens worden bijgewerkt</span></AuLoader>
        <AuHelpText @skin="tertiary" class="au-u-margin-top-none">
          Deze melding verdwijnt zodra de update is voltooid.
        </AuHelpText>
      </div>
    </AuAlert>
  </template>

  willDestroy() {
    super.willDestroy();
    clearInterval(this.intervalId);
  }
}
