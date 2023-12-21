import Controller from '@ember/controller';

export default class AssociationRecognitionController extends Controller {
  get isLoading() {
    return (
      this.model.association.isRunning || this.model.recognitions.isRunning
    );
  }

  get association() {
    const association = this.model.association.isFinished
      ? this.model.association.value
      : null;
    return association;
  }

  get recognitions() {
    return this.model.recognitions.isFinished
      ? this.model.recognitions.value
      : null;
  }
}
