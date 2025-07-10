import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AssociationRecognitionController extends Controller {
  @service currentAssociation;
  @service file;
  @service toaster;
  @tracked sort = '-validity-period.end-time';

  get isLoading() {
    return this.model.recognitions.isRunning;
  }

  get recognitions() {
    return this.model.recognitions.isFinished
      ? this.model.recognitions.value
      : null;
  }

  @action
  async getFile(file) {
    try {
      file = await this.file.getFile(file);
      if (!file) throw new Error('File not found');
      this.toaster.notify('Bestand succesvol geopend', 'Bestand geopend', {
        type: 'success',
        timeOut: 3000,
        closable: false,
      });
    } catch (error) {
      console.error(error);
      this.toaster.notify(
        'Een fout is opgetreden bij het openen van het bestand',
        'Bestand openen mislukt',
        { type: 'error', timeOut: 3000, closable: false },
      );
    }
  }
}
