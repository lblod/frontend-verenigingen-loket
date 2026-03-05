import Component from '@glimmer/component';
import { pageTitle } from 'ember-page-title';
import { service } from '@ember/service';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import ThSortable from '@appuniversum/ember-appuniversum/components/au-data-table/th-sortable';
import AuBadge from '@appuniversum/ember-appuniversum/components/au-badge';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import DataCard from 'frontend-verenigingen-loket/components/data-card';
import LastUpdated from 'frontend-verenigingen-loket/components/last-updated';
import ApiUnavailableMessage from 'frontend-verenigingen-loket/components/verenigingsregister/api-unavailable-message';
import ReportWrongData from 'frontend-verenigingen-loket/components/report-wrong-data';
import telFormat from 'frontend-verenigingen-loket/helpers/tel-format';
import type { ModelFrom } from 'frontend-verenigingen-loket/type-utils/model-from';
import type Route from 'frontend-verenigingen-loket/routes/association/contact-details';
import type CurrentSessionService from 'frontend-verenigingen-loket/services/current-session';
import type RouterService from '@ember/routing/router-service';
import type {
  Contactgegeven,
  ContactgegevenType,
} from 'frontend-verenigingen-loket/utils/verenigingsregister';
import Controller from 'frontend-verenigingen-loket/controllers/association/contact-details';
import { assert } from '@ember/debug';
import { sortByProperty } from 'frontend-verenigingen-loket/utils/sort';

interface ContactDetailsSignature {
  Args: {
    model: ModelFrom<Route>;
    controller: Controller;
  };
}

export default class ContactDetails extends Component<ContactDetailsSignature> {
  @service declare currentSession: CurrentSessionService;
  @service declare router: RouterService;

  get isLoading() {
    return this.args.model.task.isRunning;
  }

  get association() {
    const association = this.args.model.task.value?.association;
    assert('association was accessed before it was loaded', association);

    return association;
  }

  get contactgegevens() {
    const contactgegevens = this.args.model.task.value?.contactgegevens ?? [];

    return sortContactgegevens(contactgegevens, this.args.controller.sort);
  }

  get correspondenceLocatie() {
    return this.args.model.task.value?.correspondenceLocatie;
  }

  get lastUpdated() {
    return this.args.model.task.value?.lastUpdated;
  }

  get isApiUnavailable() {
    return this.args.model.task.value?.isApiUnavailable;
  }

  get isEditDisabled() {
    return !this.currentSession.canEditVerenigingsregisterData;
  }

  reloadData = () => {
    this.router.refresh('association.contact-details.index');
  };

  <template>
    {{pageTitle "Contactgegevens"}}

    {{#if this.isLoading}}
      <AuLoader class="au-u-margin-top-huge">Contactgegevens aan het laden</AuLoader>
    {{else}}
      <div
        class="au-o-box au-u-padding-left au-u-padding-right au-u-padding-top"
      >
        <section
          class="au-u-flex au-u-flex--between au-u-flex--vertical-end au-u-margin-bottom"
        >
          <div>
            <AuHeading @level="1" @skin="1">Contactgegevens</AuHeading>
            <AuHeading
              @level="3"
              @skin="3"
            >{{this.association.name}}</AuHeading>
          </div>
          <div class="au-u-flex au-u-flex--column au-u-flex--vertical-end">
            {{#if this.currentSession.canEdit}}
              {{#if this.isEditDisabled}}
                <AuButton @skin="secondary" @icon="pencil" @disabled={{true}}>
                  Bewerk
                </AuButton>
              {{else}}
                <AuLink
                  @route="association.contact-details.edit"
                  @skin="button-secondary"
                  @icon="pencil"
                >
                  Bewerk
                </AuLink>
              {{/if}}
            {{else}}
              <ReportWrongData @model={{this.association}} />
            {{/if}}

            <div class="au-u-margin-top-tiny">
              <LastUpdated @lastUpdated={{this.lastUpdated}} />
            </div>
          </div>
        </section>

        {{#if this.isApiUnavailable}}
          <ApiUnavailableMessage
            @association={{this.association}}
            @onApiAvailable={{this.reloadData}}
            class="au-u-margin-bottom"
          />
        {{/if}}

        <section>
          <DataCard>
            <:title>
              Correspondentieadres
            </:title>
            <:card as |Card|>
              <Card.Columns>
                <:left as |Item|>
                  <Item>
                    <:label>Adres</:label>
                    <:content>
                      {{#if this.correspondenceLocatie}}
                        {{this.correspondenceLocatie.adresvoorstelling}}
                      {{else}}
                        Niet opgegeven
                      {{/if}}
                    </:content>
                  </Item>
                </:left>
              </Card.Columns>
            </:card>
          </DataCard>
        </section>
      </div>

      <div>
        <AuDataTable
          @content={{this.contactgegevens}}
          @isLoading={{this.isLoading}}
          @noDataMessage="Er werden geen contactgegevens gevonden."
          as |t|
        >
          {{#let
            (hasPrimaryContactgegevens this.contactgegevens)
            as |showFavoriteColumn|
          }}
            <t.content class="au-c-data-table__table--small" as |c|>
              <c.header>
                {{#if showFavoriteColumn}}
                  <ThSortable
                    @field="is-primair,contactgegeventype"
                    @currentSorting={{@controller.sort}}
                    @label="Favorieten"
                    @class="data-table__header-title u-shrink-column"
                  />
                {{/if}}
                <ThSortable
                  @field="contactgegeventype,is-primair"
                  @currentSorting={{@controller.sort}}
                  @label="Type contactgegeven"
                  @class="data-table__header-title"
                  width="1px"
                />
                <th>Waarde</th>
              </c.header>
              <c.body as |contactgegeven|>
                {{#if showFavoriteColumn}}
                  <td>
                    {{#if contactgegeven.isPrimair}}
                      <AuBadge @icon="vote-star-filled" class="star-icon" />
                    {{/if}}
                  </td>
                {{/if}}
                <td>
                  {{typeLabel contactgegeven}}
                </td>
                <td>
                  <ContactPointValue @contactgegeven={{contactgegeven}} />
                </td>
              </c.body>
            </t.content>
          {{/let}}
        </AuDataTable>
      </div>
    {{/if}}
  </template>
}

interface ContactgegevenValueSignature {
  Args: {
    contactgegeven: Contactgegeven;
  };
}

class ContactPointValue extends Component<ContactgegevenValueSignature> {
  get isEmail() {
    return this.args.contactgegeven.contactgegeventype === 'E-mail';
  }

  get isPhone() {
    return this.args.contactgegeven.contactgegeventype === 'Telefoon';
  }

  get isSocialMediaLink() {
    return this.args.contactgegeven.contactgegeventype === 'SocialMedia';
  }

  get value() {
    return this.args.contactgegeven.waarde;
  }

  <template>
    {{#if this.isEmail}}
      <AuLinkExternal href="mailto:{{this.value}}">
        {{this.value}}
      </AuLinkExternal>
    {{else if this.isPhone}}
      <AuLinkExternal href="tel:{{this.value}}">
        {{telFormat this.value}}
      </AuLinkExternal>
    {{else if this.isSocialMediaLink}}
      <SocialMediaLink @url={{this.value}} />
    {{else}}
      <AuLinkExternal href={{this.value}}>
        {{this.value}}
      </AuLinkExternal>
    {{/if}}
  </template>
}

interface SocialMediaLinkSignature {
  Args: {
    url: string;
  };
}

class SocialMediaLink extends Component<SocialMediaLinkSignature> {
  get name() {
    const url = this.args.url.toLowerCase();

    if (url.includes('facebook')) {
      return 'Facebook';
    } else if (url.includes('instagram')) {
      return 'Instagram';
    } else if (url.includes('twitter') || url.includes('x.com')) {
      return 'X/Twitter';
    } else if (url.includes('bsky')) {
      return 'Bluesky';
    } else if (url.includes('tiktok')) {
      return 'Tiktok';
    } else {
      return this.args.url;
    }
  }

  <template>
    <AuLinkExternal href={{@url}}>
      {{this.name}}
    </AuLinkExternal>
  </template>
}

function sortContactgegevens(contactgegevens: Contactgegeven[], sort: string) {
  if (!sort) {
    // The Magda API sorts the contactgegevens by `id` by default
    return contactgegevens;
  }

  const sortedContactgevens = contactgegevens.slice();

  // The `AuDataTableThSortable` component always dasherizes the field, which isn't useful for us here. As a workaround we map the dasherized value back to the original one.
  // TODO, remove this mapping once the `AuDataTableThSortable` component has an option to not change the sort key.
  sortByProperty(sortedContactgevens, sort, {
    'is-primair': 'isPrimair',
  });

  return sortedContactgevens;
}

function typeLabel(contactgegeven: Contactgegeven) {
  const labels: Partial<Record<ContactgegevenType, string>> = {
    Telefoon: 'Telefoonnummer',
    SocialMedia: 'Sociale media',
  };

  return (
    labels[contactgegeven.contactgegeventype] ??
    contactgegeven.contactgegeventype
  );
}

function hasPrimaryContactgegevens(contactgegevens: Contactgegeven[]) {
  return contactgegevens.some((contactgegeven) => contactgegeven.isPrimair);
}
