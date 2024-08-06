import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';

export default class DateInput extends Component {
  delayedChange = restartableTask(async (event) => {
    // We give users some time to type the full year
    await timeout(2000);

    const value = event.target.value;
    this.args.onChange?.(value ? value : null);
  });

  handleChange = (event) => {
    // We cancel any tasks that might still be running, since the user blurred the field already
    if (this.delayedChange.isRunning) {
      this.delayedChange.cancelAll();
    }

    const value = event.target.value;
    this.args.onChange?.(value ? value : null);
  };
}
