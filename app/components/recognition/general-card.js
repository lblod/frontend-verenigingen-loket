import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
export default class GeneralCardComponent extends Component {
  @service file;
  @service toaster;
  @action
  async getFile(fileName) {
    try {
      const file = await this.file.getFile(fileName);
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
