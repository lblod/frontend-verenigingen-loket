import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
// import UndoToaster from 'frontend-verenigingen-loket/components/toasts/undo';
import { task } from 'ember-concurrency';

export default class AssociationRecognitionShowController extends Controller {
  @service router;
  @service toaster;
  @service currentAssociation;
  @service currentRecognition;
  @tracked isModalOpen = false;

  get canEditRecognition() {
    return !this.currentRecognition.hasExpired;
  }

  @action
  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  deleteRecognition = task({ drop: true }, async (recognition) => {
    try {
      // await recognition.setProperties({
      //   status: 'http://data.lblod.info/document-statuses/verwijderd',
      // });
      await recognition.deleteRecord();
      await recognition.save(); // HARD DELETE THE RECOGNITION
      this.router.transitionTo('association.recognition.index');
      // await this.toaster.show(UndoToaster, {
      //   type: 'success',
      //   timeOut: 4000,
      //   closable: true,
      // });
    } catch (error) {
      console.error('Error updating recognition status:', error);
    } finally {
      this.toggleModal();
    }
  });
}
