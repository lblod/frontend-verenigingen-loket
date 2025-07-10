import Controller from '@ember/controller';
import { service } from '@ember/service';
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
      const file = await this.removeFile.perform(recognition);
      if (!file) throw new Error('File removal failed');
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

  removeFile = task({ drop: true }, async (recognition) => {
    if (
      recognition.legalResource &&
      recognition.legalResource.includes('.pdf')
    ) {
      const fileId = recognition.legalResource.split('.pdf')[0];
      try {
        let response = await fetch(`/files/${fileId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          return true;
        }
        throw new Error('File removal failed');
      } catch (error) {
        console.error('An error occurred while removing the file', error);
        return true;
      }
    }
    return true;
  });
}
