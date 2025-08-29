import { attr } from '@ember-data/model';
import ConceptModel from './concept';

export const ROLES = {
  PRIMARY:
    'http://lblod.data.gift/concepts/75e74415-35cf-4da5-bac5-b72a1c137799',
  SECONDARY:
    'http://lblod.data.gift/concepts/78451ac5-ec0b-469d-b918-0a8ef92a77b2',
};

export default class RoleModel extends ConceptModel {
  //declare [Type]: 'role';

  @attr declare uri?: string;

  get isPrimary() {
    return this.uri === ROLES.PRIMARY;
  }
}
