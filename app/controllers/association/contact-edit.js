import Controller from '@ember/controller';
import { service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';

export default class AssociationContactEditController extends Controller {
  @service contactPoints;
  @service router;

  get isLoading() {
    return this.model.task.isRunning;
  }

  get taskData() {
    return this.model.task.isFinished
      ? this.model.task.value
      : null;
  }

  get association() {
    return this.taskData?.association;
  }

  get contactPoints() {
    return this.taskData?.contactPoints;
  }

  get address() {
    return this.taskData?.address;
  }

  save = dropTask(async (event) => {
    event.preventDefault();
    await timeout(1000);

    // TODO validate and save

    this.router.transitionTo('association.contact-detail');
  });
}
