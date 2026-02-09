import Component from '@glimmer/component';
import { RECOGNITION_STATUS } from 'frontend-verenigingen-loket/models/recognition';
import { RECOGNITION_STATUS_LABELS } from '../../models/recognition';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';

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

  <template>
    {{#if @association.recognitionStatus}}
      <AuPill @skin={{this.skin}}>{{this.label}}</AuPill>
    {{/if}}
  </template>
}
