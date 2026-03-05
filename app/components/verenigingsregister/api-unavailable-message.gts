import AuAlert, {
  type AuAlertSignature,
} from '@appuniversum/ember-appuniversum/components/au-alert';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import type Owner from '@ember/owner';
import Component from '@glimmer/component';
import type Association from 'frontend-verenigingen-loket/models/association';
import { isApiAvailable } from 'frontend-verenigingen-loket/utils/verenigingsregister';

const POLLING_DELAY = 30_000;

interface ApiUnavailableMessageSignature {
  Args: {
    association: Association;
    onApiAvailable?: () => void;
  };
  Element: AuAlertSignature['Element'];
}

export default class ApiUnavailableMessage extends Component<ApiUnavailableMessageSignature> {
  intervalId?: number;

  constructor(owner: Owner, args: ApiUnavailableMessageSignature['Args']) {
    super(owner, args);

    this.pollForAvailability();
  }

  pollForAvailability() {
    this.intervalId = setInterval(async () => {
      if (await isApiAvailable(this.args.association)) {
        this.args.onApiAvailable?.();
      }
    }, POLLING_DELAY);
  }

  <template>
    <AuAlert
      @skin="error"
      @icon="alert-triangle"
      @size="small"
      @closable={{true}}
      class="au-u-max-width-small"
      ...attributes
    >
      Het Verenigingsregister is even niet bereikbaar. Hierdoor is het momenteel
      niet mogelijk om deze gegevens te bewerken.
      <div>
        <AuLoader
          @inline={{true}}
          @centered={{false}}
          class="au-u-margin-top"
        ><span class="au-u-para-small">Aan het verbinden</span></AuLoader>
        <AuHelpText @skin="tertiary" class="au-u-margin-top-none">
          Deze melding verdwijnt zodra het Verenigingsregister weer bereikbaar
          is.
        </AuHelpText>
      </div>
    </AuAlert>
  </template>

  willDestroy() {
    super.willDestroy();
    clearInterval(this.intervalId);
  }
}
