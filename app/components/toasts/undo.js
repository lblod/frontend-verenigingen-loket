import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { htmlSafe } from '@ember/template';

export default class ToastsUndoComponent extends Component {
  @service() currentRecognition;
  @service() router;
  @service() toaster;
  @tracked isLoading = false;
  @tracked progress = 0;

  constructor() {
    super(...arguments);
    this.animateProgress.perform();
  }
  get progressStyle() {
    const width = `${this.progress}%`;
    const height = '2px';
    const backgroundColor = 'var(--au-green-500)';
    const position = 'absolute';
    const bottom = '0';
    const left = '0';

    const styleString = `width: ${width}; height: ${height}; background-color: ${backgroundColor}; position: ${position}; bottom: ${bottom}; left: ${left};`;

    return htmlSafe(styleString);
  }
  @task
  *animateProgress() {
    for (let i = 0; i <= 100; i++) {
      this.progress = i;
      yield timeout(38);
    }
    this.currentRecognition.setCurrentRecognition(null);
  }

  @action
  async undoRecognition(recognition) {
    this.isLoading = true;
    try {
      await recognition.setProperties({
        status: null,
      });
      await recognition.save();
      this.router.transitionTo('association.recognition.show', recognition);
      this.closeToaster();
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  closeToaster() {
    const currentToast = this.toaster.toasts[0];
    if (currentToast) {
      this.toaster.close(currentToast);
    }
  }
}
