import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class RecognitionStatusSelectComponent extends Component {
  @service router;
  @service store;

  @tracked recognitionStatusQuery = '';
  @tracked recognitionStatus;

  constructor() {
    super(...arguments);
    this.recognitionStatusQuery =
      this.router.currentRoute.queryParams.recognition;
    this.args.onChange(this.selectedRecognitionStatus());
  }

  selectedRecognitionStatus() {
    return this.recognitionStatusQuery
      ? this.recognitionStatusQuery.split(',').map((id) => id)
      : [];
  }
}
