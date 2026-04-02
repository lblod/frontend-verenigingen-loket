import Component from '@glimmer/component';
import { service } from '@ember/service';
import { getPromiseState } from '@warp-drive/ember';
import { sortByProperty } from 'frontend-verenigingen-loket/utils/sort';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';
import type RouterService from '@ember/routing/router-service';
import AuBadge from '@appuniversum/ember-appuniversum/components/au-badge';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table/th-sortable';
import ApiUnavailableMessage from 'frontend-verenigingen-loket/components/verenigingsregister/api-unavailable-message';
import ReportWrongData from 'frontend-verenigingen-loket/components/report-wrong-data';
import LastUpdated from 'frontend-verenigingen-loket/components/last-updated';
import ErrorTableMessage from 'frontend-verenigingen-loket/components/table-message/error';
import telFormat from 'frontend-verenigingen-loket/helpers/tel-format';
import type { Vertegenwoordiger } from 'frontend-verenigingen-loket/utils/verenigingsregister';
import { pageTitle } from 'ember-page-title';
import type { ModelFrom } from 'frontend-verenigingen-loket/type-utils/model-from';
import type AssociationRepresentativesIndexRoute from 'frontend-verenigingen-loket/routes/association/representatives/index';
import type AssociationRepresentativesIndexController from 'frontend-verenigingen-loket/controllers/association/representatives/index';

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

  reloadData = () => {
    this.router.refresh('association.representatives.index');
  };

  <template>
    {{pageTitle "Vertegenwoordigers"}}

    {{#let (getPromiseState @model.dataPromise) as |state|}}
      <div
        class="au-o-box au-u-padding-left au-u-padding-right au-u-padding-top"
      >
        <section
          class="au-u-flex au-u-flex--between au-u-flex--vertical-end au-u-margin-bottom"
        >
          <div>
            <AuHeading @level="1" @skin="1">Vertegenwoordigers</AuHeading>
            <AuHeading
              @level="2"
              @skin="3"
            >{{this.association.name}}</AuHeading>
          </div>

          {{#if state.isSuccess}}
            {{#if this.currentSession.hasApiClient}}
              <div class="au-u-flex au-u-flex--column au-u-flex--vertical-end">
                {{#if this.currentSession.canEdit}}
                  {{#if state.result.isApiUnavailable}}
                    <AuButton
                      @skin="secondary"
                      @icon="pencil"
                      @disabled={{true}}
                    >
                      Bewerk
                    </AuButton>
                  {{else}}
                    <AuLink
                      @route="association.representatives.edit"
                      @skin="button-secondary"
                      @icon="pencil"
                    >
                      Bewerk
                    </AuLink>
                  {{/if}}
                {{else}}
                  <ReportWrongData @model={{this.association}} />
                {{/if}}
                <span class="au-u-margin-top-tiny">
                  <LastUpdated @lastUpdated={{this.association.lastUpdated}} />
                </span>
              </div>
            {{/if}}
          {{/if}}
        </section>

        {{#if state.isSuccess}}
          {{#if this.currentSession.hasApiClient}}
            {{#if state.result.kboNumber}}
              <section class="au-u-padding-top">
                <h3
                  class="au-c-heading au-c-heading--5 au-u-margin-bottom-small au-u-flex au-u-flex--between au-u-flex--vertical-end"
                >
                  <AuLinkExternal
                    href="https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer={{state.result.kboNumber}}"
                  >
                    Bekijk de functies op de KBO pagina (externe link)
                  </AuLinkExternal>
                </h3>
              </section>
            {{/if}}

            {{#if state.result.isApiUnavailable}}
              <ApiUnavailableMessage
                @association={{this.association}}
                @onApiAvailable={{this.reloadData}}
              />
            {{/if}}
          {{else}}
            <AuContent class="au-u-max-width-small">
              <AuHeading @level="4" @skin="4">Waarom zie ik geen gegevens van
                vertegenwoordigers meer?</AuHeading>
              <p>
                Om de gegevens van vertegenwoordigers te kunnen zien, heb je een
                verwerkersovereenkomst met ABB én een aansluiting met MAGDA
                nodig.
                <br />
                Voor meer informatie,
                <AuLinkExternal
                  href="https://abb-vlaanderen.gitbook.io/handleiding-verenigingen/algemeen/verwerkersovereenkomst-en-aansluiting-magda"
                >
                  klik hier.
                </AuLinkExternal>
              </p>
            </AuContent>
          {{/if}}
        {{/if}}
      </div>

      {{#if this.currentSession.hasApiClient}}
        <div>
          <AuDataTable
            @content={{if
              state.isSuccess
              (sortVertegenwoordigers
                state.result.vertegenwoordigers @controller.sort
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
              {{#if state.isError}}
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
      {{/if}}
    {{/let}}
  </template>
}

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
