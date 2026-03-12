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
import { query } from '@warp-drive/legacy/compat/builders';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';

export default class SensitiveSpreadsheetDownload extends Component {
  @service declare store: Store;

  dataPromise;

  constructor(owner: Owner, args: unknown) {
    super(owner, args);
    this.dataPromise = this.loadJobs();
  }

  async loadJobs() {
    const document = await this.store.request(
      query<Job>('job', {
        include: 'results-container.download',
        sort: '-created',
      }),
    );

    const jobs = document.content.slice();
    // const jobs = (await this.store.query<Job>('job', {
    //   include: 'results-container.download',
    //   // TODO: some sort of filter on the operation value?
    //   sort: '-created',
    // })).slice();

    let lastJob: Job | undefined;
    let lastFinishedJob: Job | undefined;
    let showRequestLink: boolean = false;
    // todo: check the last job, if it's successful, display it
    // if it's still busy, find the next one in the list and return it as well

    if (jobs.length > 0) {
      lastJob = jobs.shift();
      assert('lastJob is expected to be set here', lastJob);

      if (lastJob.status === STATUS.SUCCESS) {
        showRequestLink = true;
      } else {
        // Find
      }
    }

    return {
      lastJob,
      lastFinishedJob,
      showRequestLink,
    };
  }

  <template>
    <Await @promise={{this.dataPromise}}>
      <:pending><AuLoader @hideMessage={{true}}>Aan het laden</AuLoader></:pending>
      <:success as |data|>
        <JobDetails
          @lastJob={{data.lastJob}}
          @lastFinishedJob={{data.lastFinishedJob}}
        />
      </:success>
    </Await>
  </template>
}

interface JobDetailsSignature {
  Args: {
    lastJob?: Job;
    lastFinishedJob?: Job;
  };
}
class JobDetails extends Component<JobDetailsSignature> {
  get showRequestLink() {
    const { lastJob } = this.args;

    if (!lastJob) {
      return true;
    }

    // Do we need to check the scheduled status as well?
    return lastJob.status !== STATUS.BUSY;
  }

  <template>
    {{#if this.showRequestLink}}
      <JobCard />
    {{/if}}
  </template>
}

interface JobCardSignature {
  Args: {
    lastJob?: Job;
    lastFinishedJob?: Job;
  };
}
class JobCard extends Component<JobCardSignature> {
  get showRequestLink() {
    const { lastJob } = this.args;

    if (!lastJob) {
      return true;
    }

    // Do we need to check the scheduled status as well?
    return lastJob.status !== STATUS.BUSY;
  }

  <template>
    <article
      class="au-c-file-card au-o-box au-o-box--small"
      style="text-align: right"
    >
      <AuHeading @level="4" @skin="6">
        vertegenwoordigers-export.xlsx
        {{!-- <span class="au-c-file-card__file-size">(11-03-2026)</span> --}}
      </AuHeading>

      <div class="au-u-margin-top-tiny">
        <AuLink
          @route="spreadsheet-request-reason"
        >
          Vraag aan
        </AuLink>
      </div>
    </article>
  </template>
}
