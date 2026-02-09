import Component from '@glimmer/component';
import { RECOGNITION_STATUS_URIS } from 'frontend-verenigingen-loket/models/recognition';

export default class StatusComponent extends Component {
  get isActive() {
    return (
      this.args.association.recognitionStatus === RECOGNITION_STATUS_URIS.ACTIVE
    );
  }

  get isExpired() {
    return (
      this.args.association.recognitionStatus ===
      RECOGNITION_STATUS_URIS.EXPIRED
    );
  }

  get isUpcoming() {
    return (
      this.args.association.recognitionStatus ===
      RECOGNITION_STATUS_URIS.UPCOMING
    );
  }
}
