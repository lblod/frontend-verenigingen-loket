import isPrimaryRole from 'frontend-verenigingen-loket/helpers/isPrimaryRole';

export function getPrimaryRole(roles) {
  for (const role of roles)
    if (isPrimaryRole(role))
      return role;
}

export function getSecondaryRole(roles) {
  for (const role of roles)
    if (!isPrimaryRole(role))
      return role;
}
