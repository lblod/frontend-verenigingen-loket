import Component from '@glimmer/component';
import { RECOGNITION_STATUS } from 'frontend-verenigingen-loket/models/recognition';
import { RECOGNITION_STATUS_LABELS } from '../../models/recognition';

export default class StatusComponent extends Component {
  get label() {
    return RECOGNITION_STATUS_LABELS[this.args.association.recognitionStatus];
  }

  get skin() {
    switch (this.args.association.recognitionStatus) {
      case RECOGNITION_STATUS.ACTIVE:
        return 'success';
      case RECOGNITION_STATUS.EXPIRED:
        return 'warning';
      case RECOGNITION_STATUS.UPCOMING:
        return 'link';
      default:
        // eslint-disable-next-line getter-return
        return;
    }
  }
}
