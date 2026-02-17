import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { assert } from '@ember/debug';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import type Owner from '@ember/owner';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { pageTitle } from 'ember-page-title';
import PowerSelect from 'ember-power-select/components/power-select';
import EditCard from 'frontend-verenigingen-loket/components/edit-card';
import Concept, {
  CONCEPT_SCHEME,
} from 'frontend-verenigingen-loket/models/concept';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import type StoreService from 'frontend-verenigingen-loket/services/store';
import type SensitiveDataService from 'frontend-verenigingen-loket/services/sensitive-data';

interface AccessReasonSignature {
  Args: {
    model: unknown;
  };
}

export default class AccessReason extends Component<AccessReasonSignature> {
  @service declare currentAssociation: CurrentAssociationService;
  @service declare sensitiveData: SensitiveDataService;
  @service declare router: RouterService;
  @tracked reason?: Concept;

  get association() {
    return this.currentAssociation.association;
  }

  get isSubmitDisabled() {
    return !this.reason;
  }

  submit = () => {
    assert(
      'The form can only be submitted when a reason is selected',
      this.reason,
    );

    this.sensitiveData.provideReason(this.association, this.reason);
    this.router.transitionTo('association.representatives.index');
  };

  <template>
    {{pageTitle "Toegang aanvragen"}}

    <div
      class="au-o-box au-u-padding-left au-u-padding-right au-u-padding-top au-u-max-width-large"
    >
      <section
        class="au-u-flex au-u-flex--between au-u-flex--vertical-end au-u-margin-bottom"
      >
        <div>
          <AuHeading @level="1" @skin="1">Bekijk vertegenwoordigers</AuHeading>
          <AuHeading @level="2" @skin="3">{{this.association.name}}</AuHeading>
        </div>

        <div>
          <AuButtonGroup>
            <AuLink @route="association" @skin="button-secondary">
              Annuleer
            </AuLink>

            <AuButton
              @disabled={{this.isSubmitDisabled}}
              form="access-reason"
              type="submit"
            >
              Volgende
            </AuButton>
          </AuButtonGroup>
        </div>
      </section>

      <AuHelpText class="au-u-max-width-small">
        Ter bescherming van de privacy, conform de GDPR regelgeving, dient u een
        reden in te geven waarom u deze gegevens wenst te consulteren of te
        bewerken. De opgegeven reden (audit trail) wordt bewaard en kan
        onderzocht worden in het geval van onrechtmatig gebruik.
      </AuHelpText>

      <form
        id="access-reason"
        class="au-u-margin-top"
        {{on "submit" this.submit}}
      >
        <EditCard @containsRequiredFields={{true}}>
          {{! <:title>Reden</:title> }}
          <:card as |Card|>
            <Card.Columns>
              <:left as |Item|>
                <Item @labelFor="reason" @required={{true}}>
                  <:label>Reden</:label>
                  <:content as |id|>
                    <ReasonSelect
                      @id={{id}}
                      @reason={{this.reason}}
                      @onChange={{fn (mut this.reason)}}
                    />
                  </:content>
                </Item>
              </:left>
            </Card.Columns>
          </:card>
        </EditCard>
      </form>
    </div>
  </template>
}

interface ReasonSelectSignature {
  Args: {
    reason?: Concept;
    id?: string;
    onChange: (reason: Concept) => void;
  };
}

class ReasonSelect extends Component<ReasonSelectSignature> {
  @service declare store: StoreService;

  requestPromise?: Promise<Concept[]>;

  constructor(owner: Owner, args: ReasonSelectSignature['Args']) {
    super(owner, args);

    this.requestPromise = this.store.query<Concept>('concept', {
      'filter[concept-scheme][:id:]': CONCEPT_SCHEME.REASON_CODES,
    });
  }

  <template>
    <PowerSelect
      @searchEnabled={{false}}
      @loadingMessage="Aan het laden..."
      @selected={{@reason}}
      @options={{this.requestPromise}}
      @onChange={{@onChange}}
      @triggerId={{@id}}
      as |reasonCode|
    >
      {{reasonCode.prefLabel}}
    </PowerSelect>
  </template>
}
