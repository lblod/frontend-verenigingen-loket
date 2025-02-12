import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class AssociationsDownload extends Component {
  @service store;

  constructor(owner, args) {
    super(owner, args);

    this.loadExportFileMeta.perform();
  }

  get exportFile() {
    if (this.loadExportFileMeta.isRunning) {
      return undefined;
    }

    return this.loadExportFileMeta.lastComplete.value;
  }

  get hasFileMeta() {
    return Boolean(this.exportFile);
  }

  loadExportFileMeta = task(async () => {
    return (
      await this.store.query('file', {
        filter: {
          ':exact:subject':
            'http://data.lblod.info/datasets/verenigingen-loket-organisations-dump',
        },
        sort: '-created',
        include: 'download',
      })
    )[0];
  });
}
