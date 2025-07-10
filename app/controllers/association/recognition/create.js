import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class AssociationRecognitionCreateController extends Controller {
  @service currentRecognition;
  @service currentAssociation;
}
