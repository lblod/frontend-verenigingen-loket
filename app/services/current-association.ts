import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Association from 'frontend-verenigingen-loket/models/association';

export default class CurrentAssociationService extends Service {
  @tracked private _association?: Association;

  get isSet() {
    return Boolean(this._association);
  }

  get association() {
    if (!this._association) {
      throw new Error(
        'currentAssociation.association was accessed before it was set',
      );
    }
    return this._association;
  }

  setAssociation(association: Association) {
    this._association = association;
  }
}
