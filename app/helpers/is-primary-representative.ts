import { ROLES } from '../models/role';
import type Membership from '../models/membership';


export default async function isPrimaryRepresentative(representative: Membership) {
  return (await representative.role).uri === ROLES.PRIMARY;
}
