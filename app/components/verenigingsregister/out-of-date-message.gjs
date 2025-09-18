import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { getPromiseState } from '@warp-drive/ember';
import { getLatestEtag } from 'frontend-verenigingen-loket/utils/verenigingsregister';

export default class OutOfDateMessage extends Component {
  @cached
  get etagPromise() {
    return getLatestEtag(this.args.association);
  }

  @cached
  get latestEtag() {
    const state = getPromiseState(this.etagPromise);

    if (state.isPending || state.isError) {
      return null;
    }

    return state.result;
  }

  get isOutOfDate() {
    const currentEtag = this.args.association.etag;

    if (
      typeof this.latestEtag === 'string' &&
      typeof currentEtag === 'string'
    ) {
      return currentEtag !== this.latestEtag;
    }

    return false;
  }

  <template>
    {{#if this.isOutOfDate}}
      <AuAlert
        @skin="warning"
        @icon="alert-triangle"
        @size="small"
        @closable={{true}}
        class="au-u-max-width-small"
        ...attributes
      >
        Na een aanpassing kan het tot 24 uur duren voor de veranderingen
        zichtbaar zijn in het Verenigingsloket Lokale Besturen. U hoeft hier
        niet op te wachten om nieuwe wijzigingen door te voeren.
        <br />
        Wees gerust, de veranderingen zijn vrijwel meteen zichtbaar in het
        Verenigingenregister.
      </AuAlert>
    {{/if}}
  </template>
}
