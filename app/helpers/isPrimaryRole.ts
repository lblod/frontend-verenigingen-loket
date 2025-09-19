import { ROLES } from '../models/role';
import type ConceptModel from '../models/role';

export default function isPrimaryRole(role: ConceptModel) {
  return role.uri === ROLES.PRIMARY;
}
