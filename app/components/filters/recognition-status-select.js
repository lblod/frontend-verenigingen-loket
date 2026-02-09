import Component from '@glimmer/component';
import {
  RECOGNITION_STATUS_LABELS,
  RECOGNITION_STATUS,
} from '../../models/recognition';

export default class RecognitionStatusSelect extends Component {
  get options() {
    return Object.values(RECOGNITION_STATUS);
  }

  optionLabel = (uri) => {
    return RECOGNITION_STATUS_LABELS[uri];
  };
}
