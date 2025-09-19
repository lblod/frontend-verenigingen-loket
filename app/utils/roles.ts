import isPrimaryRole from 'frontend-verenigingen-loket/helpers/isPrimaryRole';
import type RoleModel from 'frontend-verenigingen-loket/models/role';

export function getPrimaryRole(roles: RoleModel[]): RoleModel | undefined {
  for (const role of roles) if (isPrimaryRole(role)) return role;
  return undefined;
}

export function getSecondaryRole(roles: RoleModel[]): RoleModel | undefined {
  for (const role of roles) if (!isPrimaryRole(role)) return role;
  return undefined;
}
