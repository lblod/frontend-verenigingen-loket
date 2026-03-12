import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { assert } from '@ember/debug';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { pageTitle } from 'ember-page-title';
import ReasonForm from 'frontend-verenigingen-loket/components/reason-form';
import type Concept from 'frontend-verenigingen-loket/models/concept';
import type StoreService from 'frontend-verenigingen-loket/services/store';

export default class SpreadsheetRequestReason extends Component {
  @service declare router: RouterService;
  @service declare store: StoreService;
  @tracked reason?: Concept;

  get isSubmitDisabled() {
    return !this.reason;
  }

  submit = dropTask(async (event: Event) => {
    event.preventDefault();

    assert(
      'The form can only be submitted when a reason is selected',
      this.reason?.id,
    );

    // TODO: store.request seems to expect valid json:api content, while we just want a fetch replacement
    // We probably need to use a new requestManager instance with only the fetch handler, or use fetch directly and disable the warning
    await this.store.request({
      url: '/verenigingen-downloads',
      method: 'POST',
      headers: new Headers({
        'X-Request-Reason': this.reason.id,
      }),
    });

    this.router.transitionTo('associations');
  });

  <template>
    {{pageTitle "Vertegenwoordigers export aanvragen"}}

    <div
      class="au-o-box au-u-padding-left au-u-padding-right au-u-padding-top au-u-max-width-large"
    >
      <section
        class="au-u-flex au-u-flex--between au-u-flex--vertical-end au-u-margin-bottom"
      >
        <div>
          <AuHeading @level="1" @skin="1">Vertegenwoordigers export aanvragen</AuHeading>
        </div>

        <div>
          <AuButtonGroup>
            <AuLink @route="associations" @skin="button-secondary">
              Annuleer
            </AuLink>

            <AuButton
              @disabled={{this.isSubmitDisabled}}
              @loading={{this.submit.isRunning}}
              @loadingMessage="Vraag aan"
              form="request-reason"
              type="submit"
            >
              Vraag aan
            </AuButton>
          </AuButtonGroup>
        </div>
      </section>

      <AuHelpText class="au-u-max-width-small">
        Ter bescherming van de privacy, conform de GDPR regelgeving, dient u een
        reden in te geven waarom u deze gegevens wenst te consulteren. De
        opgegeven reden (audit trail) wordt bewaard en kan onderzocht worden in
        het geval van onrechtmatig gebruik.
      </AuHelpText>

      <ReasonForm
        @reason={{this.reason}}
        @onReasonChange={{fn (mut this.reason)}}
        id="request-reason"
        class="au-u-margin-top"
        {{on "submit" this.submit.perform}}
      />
    </div>
  </template>
}
