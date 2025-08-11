import Component from '@glimmer/component';
import { pageTitle } from 'ember-page-title';
import { service } from '@ember/service';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import ThSortable from '@appuniversum/ember-appuniversum/components/au-data-table/th-sortable';
import AuBadge from '@appuniversum/ember-appuniversum/components/au-badge';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import DataCard from 'frontend-verenigingen-loket/components/data-card';
import LastUpdated from 'frontend-verenigingen-loket/components/last-updated';
import ReportWrongData from 'frontend-verenigingen-loket/components/report-wrong-data';
import telFormat from 'frontend-verenigingen-loket/helpers/tel-format';
import { isPrimaryContactPoint } from 'frontend-verenigingen-loket/models/contact-point';

export default class ContactDetails extends Component {
  @service currentSession;

  get isLoading() {
    return this.args.model.task.isRunning;
  }

  get association() {
    return this.args.model.task.value.association;
  }

  get contactPoints() {
    return this.args.model.task.value.contactPoints;
  }

  get correspondenceAddress() {
    return this.args.model.task.value.correspondenceAddress;
  }

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
              <AuLink
                @route="association.contact-details.edit"
                @skin="button-secondary"
                @icon="pencil"
              >
                Bewerk
              </AuLink>
            {{else}}
              <ReportWrongData @model={{this.association}} />
            {{/if}}

            <div class="au-u-margin-top-tiny">
              <LastUpdated @lastUpdated={{this.association.lastUpdated}} />
            </div>
          </div>
        </section>
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
                      {{#if this.correspondenceAddress}}
                        {{this.correspondenceAddress.address.fullAddress}}
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
          @content={{this.contactPoints}}
          @isLoading={{this.isLoading}}
          @page={{@controller.page}}
          @sort={{@controller.sort}}
          @size={{@controller.size}}
          @noDataMessage="Er werden geen contactgegevens gevonden."
          as |t|
        >
          {{#let
            (hasPrimaryContactPoints this.contactPoints)
            as |showFavoriteColumn|
          }}
            <t.content class="au-c-data-table__table--small" as |c|>
              <c.header>
                {{#if showFavoriteColumn}}
                  <ThSortable
                    @field="type,name"
                    @currentSorting={{@controller.sort}}
                    @label="Favorieten"
                    @class="data-table__header-title u-shrink-column"
                  />
                {{/if}}
                <ThSortable
                  @field="name"
                  @currentSorting={{@controller.sort}}
                  @label="Type contactgegeven"
                  @class="data-table__header-title"
                  width="1px"
                />
                <th>Waarde</th>
              </c.header>
              <c.body as |contactPoint|>
                {{#if showFavoriteColumn}}
                  <td>
                    {{#if (isPrimaryContactPoint contactPoint)}}
                      <AuBadge @icon="vote-star-filled" class="star-icon" />
                    {{/if}}
                  </td>
                {{/if}}
                <td>
                  {{typeLabel contactPoint}}
                </td>
                <td>
                  <ContactPointValue @contactPoint={{contactPoint}} />
                </td>
              </c.body>
            </t.content>
          {{/let}}
        </AuDataTable>
      </div>
    {{/if}}
  </template>
}

class ContactPointValue extends Component {
  get isSocialMediaLink() {
    return this.args.contactPoint.name === 'SocialMedia';
  }

  <template>
    {{#if @contactPoint.email}}
      <AuLinkExternal href="mailto:{{@contactPoint.email}}">
        {{@contactPoint.email}}
      </AuLinkExternal>
    {{else if @contactPoint.telephone}}
      <AuLinkExternal href="tel:{{@contactPoint.telephone}}">
        {{telFormat @contactPoint.telephone}}
      </AuLinkExternal>
    {{else if this.isSocialMediaLink}}
      <SocialMediaLink @url={{@contactPoint.website}} />
    {{else}}
      <AuLinkExternal href={{@contactPoint.website}}>
        {{@contactPoint.website}}
      </AuLinkExternal>
    {{/if}}
  </template>
}

class SocialMediaLink extends Component {
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

function typeLabel(contactPoint) {
  const labels = {
    Telefoon: 'Telefoonnummer',
    SocialMedia: 'Sociale media',
  };

  return labels[contactPoint.name] ?? contactPoint.name;
}

function hasPrimaryContactPoints(contactPoints) {
  return contactPoints.some((contactPoint) =>
    isPrimaryContactPoint(contactPoint),
  );
}
