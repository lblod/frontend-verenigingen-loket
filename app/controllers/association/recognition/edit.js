import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class AssociationRecognitionEditController extends Controller {
  @service currentRecognition;
  @service currentAssociation;
}
