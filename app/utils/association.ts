import type Association from 'frontend-verenigingen-loket/models/association';
import type Site from 'frontend-verenigingen-loket/models/site';
import type Store from 'frontend-verenigingen-loket/services/store';

export async function findCorrespondenceAddressSite(
  store: Store,
  association: Association,
): Promise<Site | undefined> {
  // We have to check both the `primarySite` and `sites` relationships because primarySite records
  // aren't included in the `sites` relationship, but they could still be the correspondence address.
  const primarySite = await association.primarySite;
  const siteType = await primarySite.siteType;

  if (
    siteType?.uri ===
    'http://lblod.data.gift/concepts/9dd5b10d-719f-5207-bf39-ba09441fd590'
  ) {
    return primarySite;
  } else {
    return (
      await store.query<Site>('site', {
        'filter[associations][:id:]': association.id,
        'filter[site-type][:uri:]':
          'http://lblod.data.gift/concepts/9dd5b10d-719f-5207-bf39-ba09441fd590',
        page: { size: 1, number: 0 },
      })
    ).at(0);
  }
}
