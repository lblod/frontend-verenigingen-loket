import Controller from '@ember/controller';
export default class AssociationLocationController extends Controller {
  get isLoading() {
    return this.model.recognitions.isRunning;
  }

  get recognition() {
    return this.model.recognitions.isFinished
      ? this.model.recognitions.value[0]
      : null;
  }
}
