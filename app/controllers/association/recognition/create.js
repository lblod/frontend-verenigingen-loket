import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class AssociationRecognitionCreateController extends Controller {
  @service currentRecognition;
  @service currentAssociation;
}
