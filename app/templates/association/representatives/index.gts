import Component from '@glimmer/component';
import { service } from '@ember/service';
import { getPromiseState } from '@warp-drive/ember';
import { sortByProperty } from 'frontend-verenigingen-loket/utils/sort';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';
import type RouterService from '@ember/routing/router-service';
import AuBadge from '@appuniversum/ember-appuniversum/components/au-badge';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table/th-sortable';
import ReportWrongData from 'frontend-verenigingen-loket/components/report-wrong-data';
import LastUpdated from 'frontend-verenigingen-loket/components/last-updated';
import ErrorTableMessage from 'frontend-verenigingen-loket/components/table-message/error';
import telFormat from 'frontend-verenigingen-loket/helpers/tel-format';
import {
  getVertegenwoordigers,
  logAPIError,
  type Vertegenwoordiger,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import { pageTitle } from 'ember-page-title';
import { and, or } from 'ember-truth-helpers';
import type { ModelFrom } from 'frontend-verenigingen-loket/type-utils/model-from';
import type AssociationRepresentativesIndexRoute from 'frontend-verenigingen-loket/routes/association/representatives/index';
import type AssociationRepresentativesIndexController from 'frontend-verenigingen-loket/controllers/association/representatives/index';
import { cached } from '@glimmer/tracking';
import type Association from 'frontend-verenigingen-loket/models/association';
import type SensitiveDataService from 'frontend-verenigingen-loket/services/sensitive-data';

interface Signature {
  Args: {
    model: ModelFrom<AssociationRepresentativesIndexRoute>;
    controller: AssociationRepresentativesIndexController;
  };
}

export default class RepresentativesIndex extends Component<Signature> {
  @service declare currentSession: CurrentSessionService;
  @service declare router: RouterService;

  get association() {
    return this.args.model.association;
  }

  get showNoJurisdictionMessage() {
    return (
      this.currentSession.hasApiClient && !this.args.model.hasApiAuthorization
    );
  }

  get canSeeVertegenwoordigers() {
    return (
      this.currentSession.hasApiClient && this.args.model.hasApiAuthorization
    );
  }

  reloadData = () => {
    this.router.refresh('association.representatives.index');
  };

  <template>
    {{pageTitle "Vertegenwoordigers"}}

    <div class="au-o-box au-u-padding-left au-u-padding-right au-u-padding-top">
      <section
        class="au-u-flex au-u-flex--between au-u-flex--vertical-end au-u-margin-bottom"
      >
        <div>
          <AuHeading @level="1" @skin="1">Vertegenwoordigers</AuHeading>
          <AuHeading @level="2" @skin="3">{{this.association.name}}</AuHeading>
        </div>

        {{#if this.canSeeVertegenwoordigers}}
          <div class="au-u-flex au-u-flex--column au-u-flex--vertical-end">
            {{#if this.currentSession.canEdit}}
              <AuLink
                @route="association.representatives.edit"
                @skin="button-secondary"
                @icon="pencil"
              >
                Bewerk
              </AuLink>
            {{else}}
              <ReportWrongData @model={{this.association}} />
            {{/if}}
            <span class="au-u-margin-top-tiny">
              <LastUpdated @lastUpdated={{this.association.lastUpdated}} />
            </span>
          </div>
        {{/if}}
      </section>

      {{#if this.currentSession.hasApiClient}}
        {{#if @model.kboNumber}}
          <section class="au-u-padding-top">
            <h3
              class="au-c-heading au-c-heading--5 au-u-margin-bottom-small au-u-flex au-u-flex--between au-u-flex--vertical-end"
            >
              <AuLinkExternal
                href="https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer={{@model.kboNumber}}"
              >
                Bekijk de functies op de KBO pagina (externe link)
              </AuLinkExternal>
            </h3>
          </section>
        {{/if}}

        {{#if this.showNoJurisdictionMessage}}
          <NoJurisdictionMessage />
        {{/if}}
      {{else}}
        <MissingAgreementMessage />
      {{/if}}
    </div>

    {{#if this.canSeeVertegenwoordigers}}
      <VertegenwoordigersData
        @association={{this.association}}
        @controller={{@controller}}
      />
    {{/if}}
  </template>
}

interface VertegenwoordigersDataSignature {
  Args: {
    association: Association;
    controller: AssociationRepresentativesIndexController;
  };
}

class VertegenwoordigersData extends Component<VertegenwoordigersDataSignature> {
  @service declare sensitiveData: SensitiveDataService;

  @cached
  get dataPromise() {
    return this.loadData(this.args.association);
  }

  async loadData(association: Association) {
    const vertegenwoordigers = [];

    let isApiUnavailable = false;

    try {
      vertegenwoordigers.push(
        ...(await getVertegenwoordigers(
          association,
          this.sensitiveData.getReason(association),
        )),
      );
    } catch (error) {
      isApiUnavailable = true;
      if (error instanceof Error) {
        logAPIError(
          error,
          'Something went wrong when trying to reach the Verenigingsregister API',
        );
      }
    }

    return {
      vertegenwoordigers,
      isApiUnavailable,
    };
  }

  <template>
    {{#let (getPromiseState this.dataPromise) as |state|}}
      <div>
        <AuDataTable
          @content={{if
            state.isSuccess
            (sortVertegenwoordigers
              state.value.vertegenwoordigers @controller.sort
            )
          }}
          @isLoading={{state.isPending}}
          @loadingMessage="Vertegenwoordigers aan het laden"
          @noDataMessage="Geen vertegenwoordigers beschikbaar"
          as |t|
        >
          <t.content class="au-c-data-table__table--small" as |c|>
            <c.header>
              <th width="80px" class="data-table__header-title"></th>
              <AuDataTableThSortable
                @field="voornaam"
                @currentSorting={{@controller.sort}}
                @label="Voornaam"
                @class="data-table__header-title"
              />
              <AuDataTableThSortable
                @field="achternaam"
                @currentSorting={{@controller.sort}}
                @label="Achternaam"
                @class="data-table__header-title"
              />
              <AuDataTableThSortable
                @field="e-mail"
                @currentSorting={{@controller.sort}}
                @label="E-mail"
                @class="data-table__header-title"
              />
              <AuDataTableThSortable
                @field="telefoon"
                @currentSorting={{@controller.sort}}
                @label="Telefoonnummer"
                @class="data-table__header-title"
              />
              <AuDataTableThSortable
                @field="socialMedia"
                @currentSorting={{@controller.sort}}
                @label="Sociale media"
                @class="data-table__header-title"
              />
            </c.header>
            {{#if
              (or
                state.isError (and state.isSuccess state.value.isApiUnavailable)
              )
            }}
              <ErrorTableMessage />
            {{else}}
              <c.body as |vertegenwoordiger|>
                <td>
                  {{#if vertegenwoordiger.isPrimair}}
                    <AuBadge @icon="vote-star-filled" class="star-icon" />
                  {{/if}}
                </td>
                <td>
                  {{vertegenwoordiger.voornaam}}
                </td>
                <td>
                  {{vertegenwoordiger.achternaam}}
                </td>
                <td>
                  <AuLinkExternal href="mailto:{{vertegenwoordiger.e-mail}}">
                    {{vertegenwoordiger.e-mail}}
                  </AuLinkExternal>
                </td>
                <td>
                  {{#if vertegenwoordiger.telefoon}}
                    <AuLinkExternal href="tel:{{vertegenwoordiger.telefoon}}">
                      {{telFormat vertegenwoordiger.telefoon}}
                    </AuLinkExternal>
                  {{else}}
                    -
                  {{/if}}
                </td>
                <td>
                  {{#if vertegenwoordiger.socialMedia}}
                    <AuLinkExternal href={{vertegenwoordiger.socialMedia}}>
                      {{vertegenwoordiger.socialMedia}}
                    </AuLinkExternal>
                  {{else}}
                    -
                  {{/if}}
                </td>
              </c.body>
            {{/if}}
          </t.content>
        </AuDataTable>
      </div>
    {{/let}}
  </template>
}

const MissingAgreementMessage = <template>
  <AuContent class="au-u-max-width-small">
    <AuHeading @level="4" @skin="4">Waarom zie ik geen gegevens van
      vertegenwoordigers?</AuHeading>
    <p>
      Om de gegevens van vertegenwoordigers te kunnen zien, heb je een
      verwerkersovereenkomst met ABB én een aansluiting met MAGDA voor de
      Verenigingen-app nodig. Meer informatie hierover lees je in onze
      <AuLinkExternal
        href="https://abb-vlaanderen.gitbook.io/handleiding-verenigingen/algemeen/verwerkersovereenkomst-en-aansluiting-magda"
      >
        handleiding.
      </AuLinkExternal>
    </p>
  </AuContent>
</template>;

const NoJurisdictionMessage = <template>
  <AuContent class="au-u-max-width-small">
    <AuHeading @level="4" @skin="4">
      Waarom zie ik geen gegevens van vertegenwoordigers van deze vereniging?
    </AuHeading>
    <p>
      Je ziet alleen vertegenwoordigers van verenigingen die jouw gemeente als
      primaire locatie hebben. Als er geen primaire locatie is aangeduid,
      gebruiken we het maatschappelijke adres uit de KBO. Is dat niet
      beschikbaar, dan nemen we het correspondentieadres als primair adres.
    </p>
  </AuContent>
</template>;

function sortVertegenwoordigers(
  vertegenwoordigers: Vertegenwoordiger[],
  sort: string,
) {
  if (!sort) {
    // The Magda API sorts the vertegenwoordigers by `vertegenwoordigerId` by default
    return vertegenwoordigers;
  }

  const sortedVertegenwoordigers = vertegenwoordigers.slice();

  // The `AuDataTableThSortable` component always dasherizes the field, which isn't useful for us here. As a workaround we map the dasherized value back to the original one.
  // TODO, remove this mapping once the `AuDataTableThSortable` component has an option to not change the sort key.
  sortByProperty(sortedVertegenwoordigers, sort, {
    'social-media': 'socialMedia',
  });

  return sortedVertegenwoordigers;
}
