import AuBadge from '@appuniversum/ember-appuniversum/components/au-badge';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table/th-sortable';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { getPromiseState } from '@warp-drive/ember';
import { pageTitle } from 'ember-page-title';
import LastUpdated from 'frontend-verenigingen-loket/components/last-updated';
import ReportWrongData from 'frontend-verenigingen-loket/components/report-wrong-data';
import TableErrorMessage from 'frontend-verenigingen-loket/components/table-message/error';
import type AssociationLocationController from 'frontend-verenigingen-loket/controllers/association/locations';
import type AssociationLocationRoute from 'frontend-verenigingen-loket/routes/association/locations';
import type CurrentAssociationService from 'frontend-verenigingen-loket/services/current-association';
import type { ModelFrom } from 'frontend-verenigingen-loket/type-utils/model-from';
import { sortByProperty } from 'frontend-verenigingen-loket/utils/sort';
import type { Locatie } from 'frontend-verenigingen-loket/utils/verenigingsregister';

interface LocationSignature {
  Args: {
    model: ModelFrom<AssociationLocationRoute>;
    controller: AssociationLocationController;
  };
}

export default class AssociationLocation extends Component<LocationSignature> {
  @service declare currentAssociation: CurrentAssociationService;

  get association() {
    return this.currentAssociation.association;
  }

  @cached
  get isLoading() {
    const state = getPromiseState(this.args.model.dataPromise);
    return state.isPending;
  }

  get isLoaded() {
    return !this.isLoading;
  }

  @cached
  get hasErrored() {
    const state = getPromiseState(this.args.model.dataPromise);
    return state.isError;
  }

  get lastUpdated() {
    const state = getPromiseState(this.args.model.dataPromise);

    return state.isSuccess ? state.value.lastUpdated : undefined;
  }

  get locaties() {
    const state = getPromiseState(this.args.model.dataPromise);

    if (!state.isSuccess) {
      return [];
    }

    return sortLocaties(state.value.locaties, this.args.controller.sort);
  }

  <template>
    {{pageTitle "Locaties"}}

    <AuDataTable
      @content={{this.locaties}}
      @isLoading={{this.isLoading}}
      @noDataMessage="Geen locaties"
      as |t|
    >
      <t.menu>
        <section
          class="au-u-flex au-u-flex--between au-u-padding-left au-u-padding-right au-u-padding-top"
        >
          <div>
            <AuHeading @level="1" @skin="1">Locaties</AuHeading>
            <AuHeading
              @level="3"
              @skin="3"
            >{{this.association.name}}</AuHeading>
          </div>
          <div
            class="au-u-flex au-u-flex--end au-u-flex--column au-u-flex--vertical-end"
          >
            {{#if this.association}}
              <ReportWrongData @model={{this.association}} />
            {{/if}}
          </div>
        </section>
        <section class="au-u-padding-left au-u-padding-right au-u-padding-top">
          <h3
            class="au-c-heading au-c-heading--5 au-u-margin-bottom-tiny au-u-flex au-u-flex--between au-u-flex--vertical-end"
          >
            Locaties (zoals bekend in het Verenigingsregister)
            <span class="au-u-margin-bottom-tiny">
              {{#if this.isLoaded}}
                <LastUpdated @lastUpdated={{this.lastUpdated}} />
              {{/if}}
            </span>
          </h3>
        </section>
      </t.menu>
      <t.content class="au-c-data-table__table--small" as |c|>
        <c.header>
          <th width="80px" class="data-table__header-title"></th>
          <AuDataTableThSortable
            @field="adresvoorstelling"
            @currentSorting={{@controller.sort}}
            @label="Locatie"
            @class="data-table__header-title"
          />
          <AuDataTableThSortable
            @field="locatietype"
            @currentSorting={{@controller.sort}}
            @label="Type"
            @class="data-table__header-title"
          />
          <AuDataTableThSortable
            @field="naam"
            @currentSorting={{@controller.sort}}
            @label="Beschrijving"
            @class="data-table__header-title"
          />
        </c.header>
        {{#if this.hasErrored}}
          <TableErrorMessage />
        {{else}}
          <c.body as |locatie|>
            <td>
              {{#if locatie.isPrimair}}
                <AuBadge @icon="vote-star-filled" class="star-icon" />
              {{/if}}
            </td>
            <td>
              {{locatie.adresvoorstelling}}
            </td>
            <td>
              {{locatie.locatietype}}
            </td>
            <td>
              {{locatie.naam}}
            </td>
          </c.body>
        {{/if}}
      </t.content>
    </AuDataTable>
  </template>
}

function sortLocaties(locaties: readonly Locatie[], sort?: string) {
  if (!sort) {
    // return in the same order the API gives us
    return locaties;
  }

  const sortedLocaties = locaties.slice();
  sortByProperty(sortedLocaties, sort);
  return sortedLocaties;
}
