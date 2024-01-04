import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import UndoToaster from 'frontend-verenigingen-loket/components/toasts/undo';

export default class AssociationRecognitionShowController extends Controller {
  @service router;
  @service toaster;
  @service currentAssociation;
  @service currentRecognition;
  @tracked isLoading = false;
  @tracked isModalOpen = false;

  @action
  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  @action
  async deleteRecognition(recognition) {
    try {
      this.isLoading = true;
      await recognition.setProperties({
        status: 'http://data.lblod.info/document-statuses/verwijderd',
      });
      await recognition.save();
      this.router.transitionTo('association.recognition.index');
      this.toaster.show(UndoToaster, {
        type: 'success',
        timeOut: 4000,
        closable: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
      this.toggleModal();
    }
  }
}
