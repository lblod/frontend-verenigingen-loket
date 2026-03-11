import type Owner from '@ember/owner';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import type Store from 'frontend-verenigingen-loket/services/store';
import type Job from 'frontend-verenigingen-loket/models/job';
import { Await } from '@warp-drive/ember';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import { assert } from '@ember/debug';
import { STATUS } from 'frontend-verenigingen-loket/models/job';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { findRecord, query } from '@warp-drive/legacy/compat/builders';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import dateFormat from 'frontend-verenigingen-loket/helpers/date-format';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import File, { downloadLink } from 'frontend-verenigingen-loket/models/file';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuTooltip from '@appuniversum/ember-appuniversum/components/au-tooltip';
import { task, timeout } from 'ember-concurrency';
import type { TOC } from '@ember/component/template-only';

export default class DataExports extends Component {
  @service declare store: Store;

  dataPromise;

  constructor(owner: Owner, args: object) {
    super(owner, args);
    this.dataPromise = this.loadData();
  }

  async loadData() {
    const filesDocument = await this.store.request(
      query<File>('file', {
        filter: {
          ':exact:subject':
            'http://data.lblod.info/datasets/verenigingen-loket-organisations-dump',
        },
        sort: '-created',
      }),
    );
    const verenigingenExport = filesDocument.content.at(0);

    const document = await this.store.request(
      query<Job>('job', {
        filter: {
          ':exact:operation':
            'http://data.lblod.info/operations/sensitive-data-export',
        },
        include: 'results-container',
        sort: '-created',
      }),
    );

    const representativesExportJob = document.content.at(0);

    return {
      verenigingenExport,
      representativesExportJob,
    };
  }

  <template>
    <Await @promise={{this.dataPromise}}>
      <:pending>
        <AuLoader
          @hideMessage={{true}}
          class="au-u-flex au-u-flex--vertical-center"
        >Aan het laden</AuLoader>
      </:pending>
      <:success as |data|>
        <div class="au-u-flex u-gap">
          <RepresentativesExport @job={{data.representativesExportJob}} />

          {{#if data.verenigingenExport}}
            <ExportCard>
              <:title>
                {{data.verenigingenExport.name}}
                <span class="export-card__creation-date">({{dateFormat
                    data.verenigingenExport.created
                  }})</span>
              </:title>
              <:content>
                <AuLinkExternal
                  @icon="download"
                  href={{downloadLink data.verenigingenExport}}
                  download={{data.verenigingenExport.name}}
                >
                  Download bestand
                </AuLinkExternal>
              </:content>
            </ExportCard>
          {{/if}}
        </div>
      </:success>
    </Await>
  </template>
}

interface RepresentativesExportSignature {
  Args: {
    job?: Job;
  };
}
class RepresentativesExport extends Component<RepresentativesExportSignature> {
  @service declare store: Store;

  constructor(owner: Owner, args: RepresentativesExportSignature['Args']) {
    super(owner, args);

    void this.checkStatus.perform();
  }

  checkStatus = task(async () => {
    const delay = 10_000;
    const job = this.args.job;

    if (!job) {
      return;
    }

    assert('job is expected to have an id', job.id);

    while (isBusy(job)) {
      await timeout(delay);

      await this.store.request(
        findRecord('job', job.id, {
          include: 'results-container',
          reload: true,
        }),
      );
    }
  });

  <template>
    {{#if @job}}
      <ExportCard>
        <:title>
          vertegenwoordigers-export.xlsx
          <span class="export-card__creation-date">({{dateFormat
              @job.created
            }})</span>
        </:title>

        <:content>
          {{#if (hasSucceeded @job)}}
            <AuLink
              @route="spreadsheet-request-reason"
              @icon="redo"
              class="au-u-margin-right"
            >
              Nieuwe export aanvragen
            </AuLink>
            <span
              class="au-u-flex au-u-flex--inline au-u-flex--column au-u-flex--vertical-end"
            >
              <AuLinkExternal
                @icon="download"
                href={{downloadLink
                  @job.resultsContainer
                  "vertegenwoordigers-export.xlsx"
                }}
                download="vertegenwoordigers-export.xlsx"
              >
                Download bestand
              </AuLinkExternal>
              <span class="au-u-muted au-u-para-tiny">
                Beschikbaar tot
                {{dateFormat (add7Days @job.created)}}
              </span>
            </span>
          {{else if (hasFailed @job)}}
            <AuLink
              @route="spreadsheet-request-reason"
              @icon="redo"
              class="au-u-margin-right"
            >
              Nieuwe export aanvragen
            </AuLink>
            <AuTooltip @placement="bottom" as |tooltip|>
              <AuPill @skin="error" @icon="circle-info" {{tooltip.target}}>
                Export mislukt
              </AuPill>
              <tooltip.Content>
                {{@job.error}}
              </tooltip.Content>
            </AuTooltip>
          {{else}}
            <AuTooltip @placement="bottom" as |tooltip|>
              <AuPill @skin="ongoing" {{tooltip.target}}>
                Aan het exporteren
                <AuLoader
                  @hideMessage={{true}}
                  @centered={{false}}
                  @inline={{true}}
                  class="au-u-flex"
                >{{!
                We don't need the loading message, but still want to provide a default block so we use the non-deprecated version
                TODO: remove this when updating to Appuniversum v4
              }}</AuLoader>
              </AuPill>
              <tooltip.Content>
                Export wordt aangemaakt, dit kan enkele minuten duren.
              </tooltip.Content>
            </AuTooltip>
          {{/if}}
        </:content>
      </ExportCard>
    {{else}}
      <RequestCard />
    {{/if}}
  </template>
}

const RequestCard = <template>
  <ExportCard>
    <:title>
      vertegenwoordigers-export.xlsx
    </:title>

    <:content>
      <AuLink @route="spreadsheet-request-reason" @icon="add">
        Export aanvragen
      </AuLink>
    </:content>
  </ExportCard>
</template>;

const ExportCard = <template>
  <article class="export-card au-o-box au-o-box--small">
    <AuHeading @level="4" @skin="6">
      {{yield to="title"}}
    </AuHeading>

    <div class="au-u-margin-top-tiny au-u-text-right">
      {{yield to="content"}}
    </div>
  </article>
</template> satisfies TOC<{
  Blocks: {
    title: [];
    content: [];
  };
}>;

function add7Days(baseDate: Date) {
  const date = new Date(baseDate);
  date.setDate(baseDate.getDate() + 7);
  return date;
}

function hasSucceeded(job: Job) {
  return job.status === STATUS.SUCCESS;
}

function hasFailed(job: Job) {
  return job.status === STATUS.FAILED;
}

function isBusy(job: Job) {
  return job.status === STATUS.BUSY || job.status === STATUS.SCHEDULED;
}
