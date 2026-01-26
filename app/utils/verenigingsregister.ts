import { assert } from '@ember/debug';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';
import { associationVCode } from 'frontend-verenigingen-loket/models/association';
import type Association from 'frontend-verenigingen-loket/models/association';
import type ContactPoint from 'frontend-verenigingen-loket/models/contact-point';
import type { ChangedAttributesHash } from '@warp-drive/core-types/cache';
import type Membership from 'frontend-verenigingen-loket/models/membership';
import type Site from 'frontend-verenigingen-loket/models/site';

const manager = new RequestManager().use([Fetch]);

export async function isApiAvailable(association: Association) {
  try {
    const url = await buildVerenigingUrl(association);
    await manager.request({
      url,
    });

    return true;
  } catch {
    return false;
  }
}

export async function isOutOfDate(association: Association) {
  const currentEtag = association.etag;
  if (typeof currentEtag !== 'string') {
    // If the etag isn't a string, we assume it was harvested incorrectly and we can't be sure the data is out of date.
    return false;
  }

  const latestEtag = await getLatestEtag(association);
  return currentEtag !== latestEtag;
}

export async function getLatestEtag(association: Association) {
  const url = await buildVerenigingUrl(association);
  const dataDocument = await manager.request({
    url,
  });

  const etag = dataDocument.response?.headers?.get('etag');
  return etag;
}

// These types aren't complete. The API contains more info, but we only type what is useful to keep things simple.
type Vereniging = {
  vCode: string;
  naam: string;
  korteNaam: string;
  korteBeschrijving: string;
  startdatum: string;
  einddatum: string;
  status: string;
  vertegenwoordigers: Vertegenwoordiger[];
};

type Vertegenwoordiger = {
  vertegenwoordigerId: number;
  voornaam: string;
  achternaam: string;
  roepnaam: string;
  rol: string;
  'e-mail': string;
  telefoon?: string;
  socialMedia?: string;
  isPrimair: boolean;
};

type VerenigingDetailsResponse = {
  vereniging: Vereniging;
  metadata: {
    datumLaatsteAanpassing: string;
  };
};

export async function getVertegenwoordigers(
  association: Association,
): Promise<Vertegenwoordiger[]> {
  const url = await buildVerenigingUrl(association);
  const dataDocument = await manager.request<VerenigingDetailsResponse>({
    url,
  });

  return dataDocument.content.vereniging.vertegenwoordigers;
}

/**
 * After writing to the API it is possible that the read requests are temporarily out of date due to its architecture.
 * The API provides a mechanism where the `expectedSequence` can be provided to verify that the data is up-to-date. If it isn't we have to wait a bit before trying again.
 * More information: https://vlaamseoverheid.atlassian.net/wiki/spaces/MG/pages/6564610476/Veel+gestelde+vragen+Verenigingsregister#expectedSequence-en-ETag
 */
export async function waitForStableAPI() {
  function wait(delay = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  // Instead of using the expectedSequence feature we just always wait a certain amount of time to keep things simple.
  // A delay of 1 second should be more than enough and isn't really noticeable by the user.
  return wait(1000);
}

export async function createOrUpdateContactDetail(contactPoint: ContactPoint) {
  const url = await buildContactDetailUrl(contactPoint);
  const method = contactPoint.isNew ? 'POST' : 'PATCH';

  await manager.request({
    url,
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      contactgegeven: mapRecordAttributesToAPIFields(
        contactPoint.changedAttributes(),
        CONTACT_DETAILS_ATTRIBUTE_MAP,
      ),
    }),
  });
}

export async function removeContactDetail(contactPoint: ContactPoint) {
  const url = await buildContactDetailUrl(contactPoint);

  await manager.request({
    url,
    method: 'DELETE',
  });
}

export async function createOrUpdateCorrespondenceSite(
  site: Site,
  association: Association,
) {
  const url = await buildSiteUrl(site, association);
  const method = site.isNew ? 'POST' : 'PATCH';
  const address = await site.address;
  const locationBody: Record<string, unknown> = {};

  if (site.isNew) {
    locationBody['locatietype'] = 'Correspondentie';
  }

  // "adresId" and "adres" are mutually exclusive.
  // The verenigingsregister API will automatically fetch the address information when we provide the address register URI.
  if (address.addressRegisterUri) {
    locationBody['adresId'] = {
      broncode: 'AR',
      bronwaarde: address.addressRegisterUri,
    };
  } else {
    // It seems we need to send _all_ the address values, even if only a single thing changes,
    // so we can't use the .changedAttributes and mapRecordAttributesToApiFields setup here
    locationBody['adres'] = {
      straatnaam: address.street,
      huisnummer: address.number,
      busnummer: address.boxNumber,
      postcode: address.postcode,
      gemeente: address.municipality,
      land: address.country,
    };
  }

  await manager.request({
    url,
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ locatie: locationBody }),
  });
}

export async function removeCorrespondenceSite(
  site: Site,
  association: Association,
) {
  const url = await buildSiteUrl(site, association);

  await manager.request({
    url,
    method: 'DELETE',
  });
}

export async function createOrUpdateRepresentative(
  representative: Membership,
  association: Association,
) {
  const url = await buildRepresentativeUrl(representative, association);
  const method = representative.isNew ? 'POST' : 'PATCH';

  const person = await representative.person;
  const contactPoints = await person.contactPoints;
  const contactPoint = contactPoints.at(0);

  assert('representatives are expected to have a contact point', contactPoint);

  if (
    !representative.hasDirtyAttributes &&
    !person.hasDirtyAttributes &&
    !contactPoint.hasDirtyAttributes
  ) {
    return;
  }

  const requestData = {
    ...mapRecordAttributesToAPIFields(
      representative.changedAttributes(),
      REPRESENTATIVE_ATTRIBUTE_MAP,
    ),
    ...mapRecordAttributesToAPIFields(
      person.changedAttributes(),
      REPRESENTATIVE_ATTRIBUTE_MAP,
    ),
    ...mapRecordAttributesToAPIFields(
      contactPoint.changedAttributes(),
      REPRESENTATIVE_ATTRIBUTE_MAP,
    ),
  };

  await manager.request({
    url,
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      vertegenwoordiger: requestData,
    }),
  });
}

export async function removeRepresentative(
  representative: Membership,
  association: Association,
) {
  const url = await buildRepresentativeUrl(representative, association);

  await manager.request({
    url,
    method: 'DELETE',
  });
}

async function buildContactDetailUrl(contactPoint: ContactPoint) {
  const association = contactPoint.organization;

  assert(
    'association contact points are expected to have an association relationship',
    association,
  );

  const url = (await buildVerenigingUrl(association)) + '/contactgegevens';

  if (!contactPoint.isNew) {
    const internalId = contactPoint.internalId;
    assert(
      'existing contact points are expected to have an internal id',
      internalId,
    );

    if (internalId) {
      return url + '/' + internalId;
    }
  }

  return url;
}

async function buildSiteUrl(site: Site, association: Association) {
  const url = (await buildVerenigingUrl(association)) + '/locaties';

  if (!site.isNew) {
    const internalId = site.internalId;
    assert('existing sites are expected to have an internal id', internalId);

    if (internalId) {
      return url + '/' + internalId;
    }
  }

  return url;
}

async function buildRepresentativeUrl(
  representative: Membership,
  association: Association,
) {
  const url = (await buildVerenigingUrl(association)) + '/vertegenwoordigers';

  if (!representative.isNew) {
    const internalId = representative.internalId;
    assert(
      'existing representatives are expected to have an internal id',
      internalId,
    );

    if (internalId) {
      return url + '/' + internalId;
    }
  }

  return url;
}

async function buildVerenigingUrl(association: Association) {
  const vCode = await associationVCode(association);
  return `/verenigingen-proxy/${vCode}`;
}

const CONTACT_DETAILS_ATTRIBUTE_MAP = {
  name: 'contactgegeventype',
  telephone: 'waarde',
  email: 'waarde',
  website: 'waarde',
  type: function (
    typeValue: unknown,
    mappedAttributes: Record<string, unknown>,
  ) {
    mappedAttributes['isPrimair'] = typeValue === 'Primary';
  },
};

const REPRESENTATIVE_ATTRIBUTE_MAP = {
  givenName: 'voornaam',
  familyName: 'achternaam',
  email: 'e-mail',
  telephone: 'telefoon',
  website: 'socialMedia',
  isPrimary: 'isPrimair',
  ssn: 'insz',
};

/**
 * The verenigingsregister API uses different field names than our mu-cl-resources API, so we need to map between them.
 * @param attributes: The hash of changed attributes
 * @param attributeMap: The object that maps the EmberData attribute names to the corresponding API field. It can also be a function if the mapped value needs to be changed as well.
 * @returns
 */
function mapRecordAttributesToAPIFields<T>(
  attributes: ChangedAttributesHash,
  attributeMap: AttributeMap<T>,
  ignoredAttributes?: (keyof T)[],
): Record<string, unknown> {
  const mappedAttributes: Record<string, unknown> = {};

  Object.keys(attributes).forEach((attribute) => {
    // TODO: there might be a way to type this properly without the type assertion?
    const mappedAttributeOrHandler = attributeMap[attribute as keyof T];

    if (
      Array.isArray(ignoredAttributes) &&
      ignoredAttributes.includes(attribute as keyof T)
    ) {
      return;
    }

    assert(
      `Map is missing for attribute "${attribute}"`,
      mappedAttributeOrHandler,
    );

    if (typeof mappedAttributeOrHandler === 'function') {
      const newValue = attributes[attribute]?.at(1);
      mappedAttributeOrHandler(newValue, mappedAttributes);
    } else if (typeof mappedAttributeOrHandler === 'string') {
      mappedAttributes[mappedAttributeOrHandler] = attributes[attribute]?.at(1);
    }
  });

  return mappedAttributes;
}

type AttributeMap<T> = {
  [K in keyof T]?:
    | string
    | ((value: unknown, mapped: Record<string, unknown>) => void);
};

export function handleError(
  toaster: { error: (message: string, title?: string) => void },
  error: Error,
) {
  toaster.error(
    'Er ging iets fout bij het verzenden van de gegevens naar het Verenigingsregister.',
  );
  logAPIError(error);
}

export function logAPIError(error: Error, message?: string) {
  if (message) {
    console.error(message, error, JSON.stringify(error));
  } else {
    console.error(error, JSON.stringify(error));
  }
}
