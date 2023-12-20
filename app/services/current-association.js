import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentAssociationService extends Service {
  @tracked association;

  setAssociation(association) {
    this.association = association;
  }
}
